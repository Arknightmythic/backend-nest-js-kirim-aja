import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import * as path from "path";
import * as fs from "fs";
import * as handlebars from "handlebars";

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;
    private templatePath:string

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT||'25'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        })

        this.templatePath = path.join(process.cwd(), 'src/common/email/templates')
    }

    private loadTemplate(templateName: string): string {
        const templatePath = path.join(this.templatePath, `${templateName}.hbs`);
        return fs.readFileSync(templatePath, 'utf-8');
    }

    private compileTemplate(
        templateName: string,
        data:any,
    ):string{
        const templateSource = this.loadTemplate(templateName);
        const template = handlebars.compile(templateSource);
        return template(data);
    }

    async testingEmail(to:string):Promise<void>{
        const templateData = {
            title: 'Test Email',
            message: 'This is a test email from our application'
        }
        const htmlContent = this.compileTemplate('test-email', templateData);

        const mailOptions = {
            from: process.env.SMTP_EMAIL_SENDER,
            to,
            subject: 'Test Email KirimAja(no need reply)',
            html: htmlContent,
        }

        await this.transporter.sendMail(mailOptions);
    }
}