import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

export async function branchesSeed() {
    const branchesPath = path.resolve(__dirname, 'data', 'branches.json');
    const branchesRaw = fs.readFileSync(branchesPath, 'utf-8');
    const branches = JSON.parse(branchesRaw).data;

    for (const branch of branches) {
        const existingBranch = await prisma.branch.findFirst({
            where: { name: branch.name },
        });

        if (!existingBranch) {
            await prisma.branch.create({
                data: {
                    name: branch.name,
                    address: branch.address,
                    phoneNumber: branch.phone_number,
                },
            });
            console.log(`✅ branch ${branch.name} seeded`);
        }else{
            console.log(`skipped ✅ branch ${branch.name}, already exist`);
        }

        console.log(`✅ branch seeded`);
    }
}

// For running directly
if (require.main === module) {
    branchesSeed()
        .catch((e) => {
            console.error(e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}
