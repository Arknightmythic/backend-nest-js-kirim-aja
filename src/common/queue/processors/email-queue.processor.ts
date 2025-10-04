import { Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { Job } from "bull";
import { EmailService } from "src/common/email/email.services";

export interface EmailJobData{
    type:string;
    to:string;
    shipmentId?:number;
    amount?:number;
    payment_url?:string;
    expiryDate?:Date;
}

@Processor('email-queue')
export class EmailQueueProcessor{
    private readonly logger = new Logger(EmailQueueProcessor.name);

    constructor(private readonly emailService:EmailService){}


    @Process('send-email')
    async handleSendEmail(job:Job<EmailJobData>){
        const {data} = job
        this.logger.log(`Processing email job: Type=${data.type}, To=${data.to}`);
        // Here you would add the actual email sending logic
        try {
            switch(data.type){
                case 'testing':
                    await this.emailService.testingEmail(data.to);
                    this.logger.log(`test Email sent to ${data.to} successfully.`);
                    break;
                case 'payment-notification':
                    const expiryDate = 
                        typeof data.expiryDate === 'string' 
                            ? new Date(data.expiryDate)
                            : data.expiryDate
                    await this.emailService.sendEmailPaymentNotification(
                        data.to,
                        data.payment_url!||'',
                        data.shipmentId||0,
                        data.amount!||0,
                        expiryDate|| new Date(),
                    );
                    this.logger.log(`Payment notification email sent to ${data.to} successfully.`);
                    break;
                default:
                    this.logger.warn(`Unknown email type: ${data.type}`);
                    break;
            }
        } catch (error) {
            this.logger.error(`Failed to process email job: ${error.message}`);
            throw error;
        }
    }
}