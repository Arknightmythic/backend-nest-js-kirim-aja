import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    UseInterceptors,
    Req,
    UploadedFile,
} from '@nestjs/common';
import { UserAddressesService } from './user-addresses.service';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';
import { JwtAuthGuard } from '../auth/guards/logged-in.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BaseResponse } from 'src/common/interface/basee-response.interface';
import { UserAddress } from '@prisma/client';


@Controller('user-addresses')
@UseGuards(JwtAuthGuard)
export class UserAddressesController {
    constructor(private readonly userAddressesService: UserAddressesService) {}

    @Post()
    @UseInterceptors(
        FileInterceptor('photo', {
            storage: diskStorage({
                destination: './public/uploads/photos',
                filename: (req, file, cb) => {
                    const uniqueSuffix =
                        Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, uniqueSuffix + extname(file.originalname));
                },
            }),
            fileFilter: (req, file, cb) => {
                if (!file.originalname.match(/\.(jpg|jpeg|png|gif|avif)$/)) {
                    return cb(
                        new Error('only image files are allowed!'),
                        false,
                    );
                }
                cb(null, true);
            },
        }),
    )
    async create(
        @Body() createUserAddressDto: CreateUserAddressDto,
        @Req() req: Request & { user?: any },
        @UploadedFile() photoFile: Express.Multer.File|undefined,
    ):Promise<BaseResponse<UserAddress>> {
        return {
          data: await this.userAddressesService.create(
            createUserAddressDto,
            req.user.id,
            photoFile?.filename,
          ),
          message: 'User address created successfully',   
        };
    }

    @Get()
    async findAll(
      @Req() req: Request & { user?: any }
    ):Promise<BaseResponse<UserAddress[]>>  {
        return {
          message:'User addresses retrieved successfully',
          data: await this.userAddressesService.findAll(req.user.id)
        };
    }

    @Get(':id')
    async findOne(@Param('id') id: string):Promise<BaseResponse<UserAddress>> {
        return{
          message:'User address retrieved successfully',
          data: await this.userAddressesService.findOne(+id),
        } 
    }

    @Patch(':id')
        @UseInterceptors(
        FileInterceptor('photo', {
            storage: diskStorage({
                destination: './public/uploads/photos',
                filename: (req, file, cb) => {
                    const uniqueSuffix =
                        Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, uniqueSuffix + extname(file.originalname));
                },
            }),
            fileFilter: (req, file, cb) => {
                if (!file.originalname.match(/\.(jpg|jpeg|png|gif|avif)$/)) {
                    return cb(
                        new Error('only image files are allowed!'),
                        false,
                    );
                }
                cb(null, true);
            },
        }),
    )
    async update(
        @Param('id') id: string,
        @Body() updateUserAddressDto: UpdateUserAddressDto,
        @UploadedFile() photo: Express.Multer.File|undefined,
    ):Promise<BaseResponse<UserAddress>> {
        return {
          message:'User address updated successfully',
          data: await this.userAddressesService.update(+id, updateUserAddressDto, photo ? photo.filename:null),
        }
    }

    @Delete(':id')
    async remove(@Param('id') id: string):Promise<BaseResponse<void>> {
      await this.userAddressesService.remove(+id)
      return{
          message:'User address removed successfully',
          data: null,
        } 
    }
}
