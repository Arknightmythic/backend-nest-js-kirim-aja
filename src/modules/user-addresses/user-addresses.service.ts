import { Injectable } from '@nestjs/common';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { OpenCageService } from 'src/common/opencage/opencage.service';
import { UserAddress } from '@prisma/client';

@Injectable()
export class UserAddressesService {
    constructor(
        private prismaService: PrismaService,
        private opencageService: OpenCageService,
    ) {}

    private readonly UPLOAD_PATH = '/uploads/photos/'

    private generatePhotoPath(filename: string): string |null{
      return filename ? `${this.UPLOAD_PATH}${filename}` : null
    }

    private async getCoodinatesFromAddress(
      address:string
    ):Promise<{ lat: number; lng: number }> {
      return await this.opencageService.geocode(address);

    }

    async create(createUserAddressDto: CreateUserAddressDto, userId:number, photoFilename?:string):Promise<UserAddress> {
        const {lat, lng} = await this.getCoodinatesFromAddress(createUserAddressDto.address);
    }

    findAll() {
        return `This action returns all userAddresses`;
    }

    findOne(id: number) {
        return `This action returns a #${id} userAddress`;
    }

    update(id: number, updateUserAddressDto: UpdateUserAddressDto) {
        return `This action updates a #${id} userAddress`;
    }

    remove(id: number) {
        return `This action removes a #${id} userAddress`;
    }
}
