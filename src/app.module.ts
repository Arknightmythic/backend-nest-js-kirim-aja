import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { JwtStrategy } from './modules/auth/strategies/jwt.strategy';
import { PrismaService } from './common/prisma/prisma.service';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { ProfileModule } from './modules/profile/profile.module';
import { BranchesModule } from './modules/branches/branches.module';
import { EmployeeBranchesModule } from './modules/employee-branches/employee-branches.module';
import { UserAddressesModule } from './modules/user-addresses/user-addresses.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { EmailService } from './common/email/email.services';
import { QueueModule } from './common/queue/queue.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';
import { AppCacheModule } from './common/cache/cache.module';

@Module({
    imports: [
        AuthModule,
        RolesModule,
        PermissionsModule,
        ProfileModule,
        BranchesModule,
        EmployeeBranchesModule,
        UserAddressesModule,
        AppCacheModule,
        QueueModule,
        ThrottlerModule.forRoot([
            {
                ttl: 60000, // Waktu dalam milidetik (contoh: 60 detik)
                limit: 10, // Batas permintaan dalam periode waktu di atas (contoh: 10 permintaan)
            },
        ]),
        ShipmentsModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        JwtStrategy,
        PrismaService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
        EmailService
    ],
})
export class AppModule {}
