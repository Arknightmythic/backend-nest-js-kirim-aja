import { Injectable } from '@nestjs/common';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { QueueService } from 'src/common/queue/queue.service';
import { OpenCageService } from 'src/common/opencage/opencage.service';
import { XenditService } from 'src/common/xendit/xendit.service';
import { Shipment } from '@prisma/client';
import getDistance from 'geolib/es/getPreciseDistance';
import { PaymentStatus } from 'src/common/enum/payment-status.enum';

@Injectable()
export class ShipmentsService {
    constructor(
        private prismaService: PrismaService,
        private queueService: QueueService,
        private openCageService: OpenCageService,
        private xenditService: XenditService,
    ) {}
    async create(createShipmentDto: CreateShipmentDto): Promise<Shipment> {
        const { lat, lng } = await this.openCageService.geocode(
            createShipmentDto.destination_address,
        );

        const userAddress = await this.prismaService.userAddress.findFirst({
            where: {
                id: createShipmentDto.pickup_address_id,
            },
            include: {
                user: true,
            },
        });

        if (!userAddress || !userAddress.latitude || !userAddress.longitude) {
            throw new Error('Pickup address not found');
        }

        const distance = getDistance(
            {
                latitude: userAddress.latitude,
                longitude: userAddress.longitude,
            },
            {
                latitude: lat,
                longitude: lng,
            },
        );

        const distanceInKm = distance / 1000;

        const shipmentCost = this.calculateShipmentCost(
            distanceInKm,
            createShipmentDto.weight,
            createShipmentDto.delivery_type,
        );

        const shipment = await this.prismaService.$transaction(
            async (prisma) => {
                const newShipment = await prisma.shipment.create({
                    data: {
                        paymentStatus: PaymentStatus.PENDING,
                        distance: distanceInKm,
                        price: shipmentCost.totalPrice,
                    },
                });

                await prisma.shipmentDetail.create({
                    data: {
                        shipmentId: newShipment.id,
                        pickupAddressId: createShipmentDto.pickup_address_id,
                        destinationAddress:
                            createShipmentDto.destination_address,
                        recipientName: createShipmentDto.recipient_name,
                        recipientPhone: createShipmentDto.recipient_phone,
                        weight: createShipmentDto.weight,
                        packageType: createShipmentDto.package_type,
                        deliveryType: createShipmentDto.delivery_type,
                        destinationLatitude: lat,
                        destinationLongitude: lng,
                        basePrice: shipmentCost.basePrice,
                        weightPrice: shipmentCost.weightPrice,
                        distancePrice: shipmentCost.distancePrice,
                        userId: userAddress.userId,
                    },
                });
                return newShipment;
            },
        );
        const invoice = await this.xenditService.createInvoice({
            externalId: `INV-${Date.now()}-${shipment.id}`,
            amount: shipmentCost.totalPrice,
            payerEmail: userAddress.user.email,
            description: `Shipment #${shipment.id} from ${userAddress.address} to ${createShipmentDto.destination_address}`,
            successRedirectUrl: `${process.env.FRONTEND_URL}/send-package/detail/${shipment.id}`,
            invoiceDuration: 1 * 24 * 60 * 60, // 1 day
        });

        const payment = await this.prismaService.$transaction(async (prisma) => {
            const createdPayment = await prisma.payment.create({
                data: {
                    shipmentId: shipment.id,
                    externalId: invoice.externalId,
                    invoiceId: invoice.id!,
                    status: invoice.status,
                    invoiceUrl: invoice.invoiceUrl,
                    expiryDate: invoice.expiryDate,
                },
            });

            await prisma.shipmentHistory.create({
                data: {
                    shipmentId: shipment.id,
                    status: PaymentStatus.PENDING,
                    description: `Invoice ${invoice.id} created with status ${invoice.status} and total price ${shipmentCost.totalPrice}`,
                },
            });
            return createdPayment;
        });

        try {
            await this.queueService.addEmailJob({
                type: 'payment-notification',
                to: userAddress.user.email,
                shipmentId: shipment.id,
                amount: shipmentCost.totalPrice,
                payment_url: payment.invoiceUrl ?? undefined,
                expiryDate: payment.expiryDate ?? undefined,
            });
        } catch (error) {
            console.error('Failed to enqueue email job:', error);
        }

        try {
            await this.queueService.addPaymentExpiryJob(
                {
                    paymentId:payment.id,
                    shipmendtId:shipment.id,
                    externalId:payment.externalId!,
                },
                invoice.expiryDate,
            )
        } catch (error) {
            console.error('failed to add payment expiry job to queue: ', error)
        }

        return shipment;
    }

    findAll() {
        return `This action returns all shipments`;
    }

    findOne(id: number) {
        return `This action returns a #${id} shipment`;
    }

    update(id: number, updateShipmentDto: UpdateShipmentDto) {
        return `This action updates a #${id} shipment`;
    }

    remove(id: number) {
        return `This action removes a #${id} shipment`;
    }

    private calculateShipmentCost(
        distance: number,
        weight: number,
        deliveryType: string,
    ): {
        totalPrice: number;
        basePrice: number;
        weightPrice: number;
        distancePrice: number;
    } {
        const baseRates = {
            same_day: 15000,
            next_day: 10000,
            regular: 5000,
        };

        const weightRates = {
            same_day: 1000,
            next_day: 800,
            regular: 500,
        };

        const distanceTierRates = {
            same_day: {
                tier1: 8000, // 0-50 km
                tier2: 12000, // 51-100 km
                tier3: 15000, // 100+ km per 10km
            },
            next_day: {
                tier1: 6000, // 0-50 km
                tier2: 9000, // 51-100 km
                tier3: 12000, // 100+ km per 10km
            },
            regular: {
                tier1: 4000, // 0-50 km
                tier2: 6000, // 51-100 km
                tier3: 8000, // 100+ km per 10km
            },
        };

        const basePrice = baseRates[deliveryType] || baseRates.regular;
        const weightRate = weightRates[deliveryType] || weightRates.regular;
        const distanceRate =
            distanceTierRates[deliveryType] || distanceTierRates.regular;

        const weightKg = Math.ceil(weight / 1000); // Convert grams to kg and round up
        const weightPrice = weightKg * weightRate;
        let distancePrice = 0;

        if (distance <= 50) {
            distancePrice = distanceRate.tier1;
        } else if (distance <= 100) {
            distancePrice = distanceRate.tier1 + distanceRate.tier2;
        } else {
            const extraDistanceIncrements = Math.ceil((distance - 100) / 10);
            distancePrice =
                distanceRate.tier1 +
                distanceRate.tier2 +
                extraDistanceIncrements * distanceRate.tier3;
        }

        const totalPrice = basePrice + weightPrice + distancePrice;
        const minimumPrice = 10000;
        const finalPrice = Math.max(totalPrice, minimumPrice);

        return {
            totalPrice: finalPrice,
            basePrice: basePrice,
            weightPrice: weightPrice,
            distancePrice: distancePrice,
        };
    }
}