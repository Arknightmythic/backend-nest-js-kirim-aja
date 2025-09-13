import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreateEmployeeBranchDto } from './dto/create-employee-branch.dto';
import { UpdateEmployeeBranchDto } from './dto/update-employee-branch.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { EmployeeBranch } from '@prisma/client';
import * as bycrpt from 'bcrypt';

@Injectable()
export class EmployeeBranchesService {
    constructor(private primsaService: PrismaService) {}

    private async validateUniqueEmail(
        email: string,
        excludeUserId?: number,
    ): Promise<void> {
        const existingUser = await this.primsaService.user.findUnique({
            where: { email },
        });

        if (existingUser && existingUser.id !== excludeUserId) {
            throw new BadRequestException(`Email ${email} is already in use`);
        }
    }

    private async validateBranchExist(branchId: number): Promise<void> {
        const branch = await this.primsaService.branch.findUnique({
            where: { id: branchId },
        });
        if (!branch) {
            throw new NotFoundException(
                `Branch with brand ID: ${branchId} not found`,
            );
        }
    }

    private async validateRoleExists(roleId: number): Promise<void> {
        const role = await this.primsaService.role.findUnique({
            where: { id: roleId },
        });

        if (!role) {
            throw new NotFoundException(
                `Role with role ID: ${roleId} not found`,
            );
        }
    }

    async create(
        createEmployeeBranchDto: CreateEmployeeBranchDto,
    ): Promise<EmployeeBranch> {
        await Promise.all([
            this.validateUniqueEmail(createEmployeeBranchDto.email),
            this.validateBranchExist(createEmployeeBranchDto.branch_id),
            this.validateRoleExists(createEmployeeBranchDto.role_id),
        ]);

        return this.primsaService.$transaction(async (prisma) => {
            const user = await prisma.user.create({
                data: {
                    name: createEmployeeBranchDto.name,
                    email: createEmployeeBranchDto.email,
                    phoneNumber: createEmployeeBranchDto.phone_number,
                    password: await bycrpt.hash(
                        createEmployeeBranchDto.password,
                        10,
                    ),
                    avatar: createEmployeeBranchDto.avatar,
                    roleId: createEmployeeBranchDto.role_id,
                },
            });
            const employeeBranch = await prisma.employeeBranch.create({
                data: {
                    userId: user.id,
                    branchId: createEmployeeBranchDto.branch_id,
                    type: createEmployeeBranchDto.type,
                },
            });
            return employeeBranch;
        });
    }

    async findAll(): Promise<EmployeeBranch[]> {
        return this.primsaService.employeeBranch.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phoneNumber: true,
                        avatar: true,
                    },
                },
                branch: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                    },
                },
            },
        });
    }

    async findOne(id: number): Promise<EmployeeBranch> {
        const employeeBranch =
            await this.primsaService.employeeBranch.findUnique({
                where: { id },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phoneNumber: true,
                            avatar: true,
                        },
                    },
                    branch: {
                        select: {
                            id: true,
                            name: true,
                            address: true,
                        },
                    },
                },
            });
        if (!employeeBranch) {
            throw new NotFoundException(`employee with id:${id} not exist`);
        }
        return employeeBranch;
    }

    async update(
        id: number,
        updateEmployeeBranchDto: UpdateEmployeeBranchDto,
    ): Promise<EmployeeBranch> {
        const existingEmployeeBranch = await this.findOne(id);
        const validationPromise: Promise<void>[] = [];

        if (updateEmployeeBranchDto.email) {
            validationPromise.push(
                this.validateUniqueEmail(
                    updateEmployeeBranchDto.email,
                    existingEmployeeBranch.id,
                ),
            );
        }

        if (updateEmployeeBranchDto.branch_id) {
            validationPromise.push(
                this.validateBranchExist(updateEmployeeBranchDto.branch_id),
            );
        }

        if (updateEmployeeBranchDto.role_id) {
            validationPromise.push(
                this.validateRoleExists(updateEmployeeBranchDto.role_id),
            );
        }

        return this.primsaService.$transaction(async (prisma) => {
            await Promise.all(validationPromise);
            const updatedUser = await prisma.user.update({
                where: { id: existingEmployeeBranch.userId },
                data: {
                    name: updateEmployeeBranchDto.name,
                    email: updateEmployeeBranchDto.email,
                    phoneNumber: updateEmployeeBranchDto.phone_number,
                    ...(updateEmployeeBranchDto.password && {
                        password: await bycrpt.hash(
                            updateEmployeeBranchDto.password,
                            10,
                        ),
                    }),
                    avatar: updateEmployeeBranchDto.avatar,
                    roleId: updateEmployeeBranchDto.role_id,
                },
            });

            const updatedEmployeeBranch = await prisma.employeeBranch.update({
                where: { id },
                data: {
                    branchId: updateEmployeeBranchDto.branch_id,
                    type: updateEmployeeBranchDto.type,
                },
            });

            return { ...updatedEmployeeBranch };
        });
    }

    async remove(id: number): Promise<void> {
        return this.primsaService.$transaction(async (prisma) => {
            const employeeBranch = await this.findOne(id);
            return this.primsaService.$transaction(async (prisma) => {
                await prisma.employeeBranch.delete({
                    where: { id },
                });
                await prisma.user.delete({
                    where: { id: employeeBranch.userId },
                });
            });
        });
    }
}
