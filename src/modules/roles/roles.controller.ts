import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/guards/logged-in.guard';
import { BaseResponse } from 'src/common/interface/basee-response.interface';
import { RoleResponse } from '../auth/response/auth-login.response';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async findAll():Promise<BaseResponse<RoleResponse[]>> {
    return {
      message:'roles retrivied successfully',
      data: await this.rolesService.findAll()
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string):Promise<BaseResponse<RoleResponse>> {
    return {
      message:`Role With ID ${id} retrieved successfully`,
      data: await this.rolesService.findOne(+id)
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto):Promise<BaseResponse<RoleResponse>>  {
    return {
      message:`Role With ID ${id} retrieved successfully`,
      data: await this.rolesService.update(+id,updateRoleDto)
    }
  }
}
