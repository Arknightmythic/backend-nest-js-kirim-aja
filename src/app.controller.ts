import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './modules/auth/guards/logged-in.guard';
import { PermissionGuard } from './modules/auth/guards/permission.guard';
import { RequiredAnyPermissions } from './modules/auth/decorators/permissions.decorator';
import { EmailService } from './common/email/email.services';

@Controller()
@UseGuards(JwtAuthGuard, PermissionGuard)
export class AppController {
  constructor(private readonly appService: AppService, private readonly emailService: EmailService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('protected')
  @RequiredAnyPermissions('shipments.create')
  getProtectedResource():string{
    return 'this is a protected resourcee'
  }

  @Get('send-email-test')
  async sendTestEmail():Promise<string>{
    await this.emailService.testingEmail('testing@gmail.com');
    return 'Test email sent successfully';
  }
}
