import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { parse } from "path";
import { QueueService } from "./queue.service";
import { EmailService } from "../email/email.services";
import { EmailQueueProcessor } from "./processors/email-queue.processor";
import { PaymentExpiryQueueProcessor } from "./processors/payment-expired-queue.processor";
import { PrismaService } from "../prisma/prisma.service";

@Module({
    imports:[
        BullModule.forRoot({
            redis:{
                host:process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT|| "6379", 10),
                password:process.env.REDIS_PASSWORD || undefined
            }
        }),
        BullModule.registerQueue({
            name:'email-queue'
        },{
            name:'payment-expiry-queue'
        }),
    ],
    controllers:[],
    providers:[QueueService, EmailService, EmailQueueProcessor, PaymentExpiryQueueProcessor, PrismaService],
    exports:[QueueService]

})
export class QueueModule{}