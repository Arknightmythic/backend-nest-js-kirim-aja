import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { JwtAuthGuard } from '../auth/guards/logged-in.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequiredPermissions } from '../auth/decorators/permissions.decorator';
import { BaseResponse } from 'src/common/interface/basee-response.interface';
import { Branch } from '@prisma/client';

@Controller('branches')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @RequiredPermissions('branches.create')
  async create(@Body() createBranchDto: CreateBranchDto):Promise<BaseResponse<Branch>> {
    return {
      message:'Branch create successfully',
      data: await this.branchesService.create(createBranchDto)
    };
  }

  @Get()
  @RequiredPermissions('branches.read')
  async findAll():Promise<BaseResponse<Branch[]>> {
    return{
      message:'branches retrieved successfully',
      data: await this.branchesService.findAll()
    }
  }

  @Get(':id')
  @RequiredPermissions('branches.read')
  async findOne(@Param('id') id: string):Promise<BaseResponse<Branch>> {
    return {
      message:'branch retrieved successfully',
      data: await this.branchesService.findOne(+id)
    }
  }

  @Patch(':id')
  @RequiredPermissions('branches.update')
  async update(@Param('id') id: string, @Body() updateBranchDto: UpdateBranchDto):Promise<BaseResponse<Branch>> {
    return {
      message:'updated branch successfully',
      data: await this.branchesService.update(+id, updateBranchDto)
    }
  }

  @Delete(':id')
  @RequiredPermissions('branches.delete')
  async remove(@Param('id') id: string):Promise<BaseResponse<Branch>> {
    await this.branchesService.remove(+id)
    return {
      message:'remove the branch successfully',
      data: null,
    }
  }
}
