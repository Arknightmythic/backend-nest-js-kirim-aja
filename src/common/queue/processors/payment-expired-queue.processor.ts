import { Process, Processor } from "@nestjs/bull";
import { Injectable, Logger } from "@nestjs/common";
import { Job } from "bull";
import { PaymentStatus } from "src/common/enum/payment-status.enum";
import { PrismaService } from "src/common/prisma/prisma.service";

export interface PaymentExpiryJobData{
    paymentId:number;
    shipmendtId:number;
    externalId:string;
}


@Processor('payment-expired-queue')
@Injectable()
export class PaymentExpiryQueueProcessor{
    private readonly logger = new Logger(PaymentExpiryQueueProcessor.name);

    constructor(private readonly prismaService:PrismaService){}

    @Process('expiry-payment')
    async handleExpirePayment(job:Job<PaymentExpiryJobData>){
        const {data} = job
        this.logger.log(
            `Processing payment expiry for payment ID: ${data.paymentId}`
        );

        try {
            const payment = await this.prismaService.payment.findUnique({
                where:{id:data.paymentId},
                include:{
                    shipment:{
                        include:{
                            shipmentDetail:{
                                include:{
                                    user:{
                                        select:{
                                            email:true,
                                            name:true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            })
            if (!payment) {
                this.logger.warn(`Payment with ID ${data.paymentId} not found`)
                return
            }

            if (payment.status !== PaymentStatus.PENDING) {
                this.logger.log(
                    `Payment ${data.paymentId} is no longer pending (status: ${payment.status}) Skipping expiry`
                )
                return
            }

            await this.prismaService.$transaction(async(tx)=>{
                await tx.payment.update({
                    where:{id:data.paymentId},
                    data:{
                        status:PaymentStatus.EXPIRED
                    }
                });

                await tx.shipment.update({
                    where:{id:data.shipmendtId},
                    data:{
                        paymentStatus:PaymentStatus.EXPIRED
                    }
                })


                await tx.shipmentHistory.create({
                    data:{
                        shipmentId:data.shipmendtId,
                        status:PaymentStatus.EXPIRED,
                        description:'Payment expired (automatically)'
                    }
                })
            })

            this.logger.log(
                `Payment ${data.paymentId} has been expired successfully`
            )
        } catch (error) {
            this.logger.error(
                `faileed to expire payment ${data.paymentId}`,
                error.stack,
            )
            throw error
        }
    }
}