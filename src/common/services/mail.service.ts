import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor(private readonly configService: ConfigService) {
        const smtpHost = this.configService.get<string>('smtp.host');
        const smtpPort = this.configService.get<number>('smtp.port') || 587;
        const smtpUser = this.configService.get<string>('smtp.user');
        const smtpPassword = this.configService.get<string>('smtp.password');

        if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
            console.error('Missing SMTP configuration:', {
                smtpHost,
                smtpPort,
                smtpUser,
                smtpPassword,
            });
            throw new Error('SMTP configuration is incomplete');
        }

        this.transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            auth: {
                user: smtpUser,
                pass: smtpPassword,
            },
        });
    }

    /**
     * General method to send an email using a template.
     * @param to Recipient email address
     * @param subject Email subject
     * @param templateName Name of the HTML template file
     * @param replacements Object containing values to replace in the template
     */
    private async sendEmail(
        to: string,
        subject: string,
        templateName: string,
        replacements: Record<string, string>,
    ) {
        const templatePath = path.join(__dirname, '../../templates', templateName);

        let source: string;
        try {
            source = fs.readFileSync(templatePath, 'utf8');
        } catch (error) {
            console.error(`Error reading email template: ${templatePath}`, error);
            throw new InternalServerErrorException('Error loading email template');
        }

        const template = handlebars.compile(source);
        const htmlToSend = template(replacements);

        try {
            await this.transporter.sendMail({
                from: 'support@fishstat.ru',
                to,
                subject,
                html: htmlToSend,
            });
        } catch (error) {
            console.error('Error sending email:', error);
            throw new InternalServerErrorException('Error sending email');
        }
    }

    /**
     * Format the date to 'dd.MM.YYYY'.
     * @param date Date object
     * @returns Formatted date string
     */
    private formatDate(date: Date): string {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}.${month}.${year}`;
    }

    /**
     * Sends a user confirmation email.
     * @param email Recipient email
     * @param token Confirmation token
     */
    async sendUserConfirmation(email: string, token: string) {
        const url = `https://fishstat.ru/auth/email-verify?token=${token}&email=${email}`;
        const replacements = {
            url,
            date: this.formatDate(new Date()),
            currentDate: new Date().toLocaleString('ru-RU', {
                timeZone: 'Europe/Moscow',
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
            }),
        };

        await this.sendEmail(
            email,
            'Запрос на подтверждение почты',
            'email-verify.html',
            replacements,
        );
    }

    /**
     * Sends a password reset email.
     * @param email Recipient email
     * @param token Password reset token
     */
    async sendPasswordReset(email: string, token: string) {
        const url = `https://fishstat.ru/auth/reset-password-verify?token=${token}&email=${email}`;
        const replacements = {
            url,
            date: this.formatDate(new Date()),
            currentDate: new Date().toLocaleString('ru-RU', {
                timeZone: 'Europe/Moscow',
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
            }),
        };

        await this.sendEmail(email, 'Сброс пароля', 'reset-password-verify.html', replacements);
    }
}
