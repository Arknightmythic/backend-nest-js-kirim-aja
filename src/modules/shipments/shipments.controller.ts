import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { JwtAuthGuard } from '../auth/guards/logged-in.guard';
import { BaseResponse } from 'src/common/interface/basee-response.interface';
import { Shipment } from '@prisma/client';
import { RequiredPermissions } from '../auth/decorators/permissions.decorator';

@Controller('shipments')
@UseGuards(JwtAuthGuard)
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Post()
  @RequiredPermissions('shipments.create')
  async create(@Body() createShipmentDto: CreateShipmentDto):Promise<BaseResponse<Shipment>> {
    return {
      data: await this.shipmentsService.create(createShipmentDto),
      message:"shipment Created Successfully"
    };
  }

  @Get()
  findAll() {
    return this.shipmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shipmentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShipmentDto: UpdateShipmentDto) {
    return this.shipmentsService.update(+id, updateShipmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shipmentsService.remove(+id);
  }
}
