import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Branch } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class BranchesService {
    constructor(
        private readonly prismaService: PrismaService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    async create(createBranchDto: CreateBranchDto): Promise<Branch> {
        const branch = await this.prismaService.branch.create({
            data: {
                name: createBranchDto.name,
                address: createBranchDto.address,
                phoneNumber: createBranchDto.phone_number,
            },
        });
        // menghapus Cache agar tidak outdated(albert)
        await this.cacheManager.del('all_branches');
        return branch;
    }

    async findAll(): Promise<Branch[]> {
        const cachedBranches =
            await this.cacheManager.get<Branch[]>('all_branches');

        if (cachedBranches) {
            return cachedBranches;
        }

        const branches = await this.prismaService.branch.findMany();
        await this.cacheManager.set('all_branches', branches);

        return branches;
    }

    async findOne(id: number): Promise<Branch> {
        const cacheKey = `branch_${id}`;
        const cachedBranch = await this.cacheManager.get<Branch>(cacheKey);

        if (cachedBranch) {
            return cachedBranch;
        }

        const branch = await this.prismaService.branch.findUnique({
            where: { id },
        });

        if (!branch) {
            throw new NotFoundException(`Branch with id: ${id} is not found`);
        }

        await this.cacheManager.set(cacheKey, branch);

        return branch;
    }

    async update(id: number, updateBranchDto: UpdateBranchDto) {
        await this.findOne(id);

        const updatedBranch = await this.prismaService.branch.update({
            where: { id },
            data: {
                name: updateBranchDto.name,
                address: updateBranchDto.address,
                phoneNumber: updateBranchDto.phone_number,
            },
        });

        // Invalidate cache
        await this.cacheManager.del(`branch_${id}`);
        await this.cacheManager.del('all_branches');

        return updatedBranch;
    }

    async remove(id: number): Promise<void> {
    await this.findOne(id);
    
    await this.prismaService.branch.delete({
      where: { id },
    });
    
    // Invalidate cache
    await this.cacheManager.del(`branch_${id}`);
    await this.cacheManager.del('all_branches');
  }

}
