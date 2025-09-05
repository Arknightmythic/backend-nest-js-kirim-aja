// prisma/seeders/employee-branches-seed.ts

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

export async function employeeBranchesSeed() {
  const employeesPath = path.resolve(__dirname, 'data', 'employee-branches.json');
  const employeesRaw = fs.readFileSync(employeesPath, 'utf-8');
  const employees = JSON.parse(employeesRaw).data;

  for (const emp of employees) {
    // Cari role berdasarkan roleKey
    const role = await prisma.role.findFirst({
      where: { key: emp.roleKey },
    });

    if (!role) {
      console.log(`❌ Role ${emp.roleKey} tidak ditemukan, skip ${emp.email}`);
      continue;
    }

    // Cari branch berdasarkan nama
    const branch = await prisma.branch.findFirst({
      where: { name: emp.branchName },
    });

    if (!branch) {
      console.log(`❌ Branch ${emp.branchName} tidak ditemukan, skip ${emp.email}`);
      continue;
    }

    // Cek apakah user sudah ada
    let user = await prisma.user.findFirst({
      where: { email: emp.email },
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash(emp.password, 10);

      user = await prisma.user.create({
        data: {
          name: emp.name,
          email: emp.email,
          password: hashedPassword,
          phoneNumber: emp.phoneNumber,
          roleId: role.id,
        },
      });

      console.log(`✅ User ${emp.email} berhasil dibuat`);
    } else {
      console.log(`⚠️ User ${emp.email} sudah ada, skip create user`);
    }

    // Cek apakah relasi employee-branch sudah ada
    const existingEmpBranch = await prisma.employeeBranch.findFirst({
      where: {
        userId: user.id,
        branchId: branch.id,
      },
    });

    if (!existingEmpBranch) {
      await prisma.employeeBranch.create({
        data: {
          userId: user.id,
          branchId: branch.id,
          type: emp.type,
        },
      });
      console.log(`✅ Relasi employeeBranch untuk ${emp.email} di ${branch.name} berhasil dibuat`);
    } else {
      console.log(`⚠️ Relasi employeeBranch ${emp.email} - ${branch.name} sudah ada`);
    }
  }
}

// Untuk menjalankan langsung
if (require.main === module) {
  employeeBranchesSeed()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
