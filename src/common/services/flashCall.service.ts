import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { addMinutes, addHours, isAfter } from 'date-fns';
import * as bcrypt from 'bcryptjs';

import { SendFlashCallDto, VerifyFlashCallDto } from 'src/common/dtos/send-flash-call.dto';
import { SendFlashCallResponseDto } from 'src/common/dtos/flash-call-response.dto';

import { CallFactory } from 'src/modules/call/call.factory';
import { CallProviders } from 'src/modules/call/interfaces/call.interface';
import { PrismaService } from 'src/common/services/prisma.service';

const MIN_INTERVAL_MINUTES = 1;
const MAX_REQUESTS_PER_DAY = 5;
const BLOCK_DURATION_HOURS = 24;
const PINCODE_EXPIRATION_MINUTES = 10;

@Injectable()
export class FlashCallService {
    private readonly logger = new Logger(FlashCallService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly callFactory: CallFactory,
    ) {}

    async sendFlashCall(
        sendFlashCallDto: SendFlashCallDto,
        userId?: string,
    ): Promise<SendFlashCallResponseDto> {
        const { phone } = sendFlashCallDto;

        const now = new Date();

        const phoneCode = await this.prisma.phoneCode.findUnique({
            where: { phone },
        });

        if (phoneCode) {
            if (phoneCode.blockedUntil && isAfter(now, phoneCode.blockedUntil)) {
                const remainingMinutes = Math.ceil(
                    (phoneCode.blockedUntil.getTime() - now.getTime()) / 60000,
                );
                throw new HttpException(
                    `Too many requests. Please try again after ${remainingMinutes} minutes.`,
                    HttpStatus.TOO_MANY_REQUESTS,
                );
            }

            if (phoneCode.lastSentAt) {
                const nextAllowedTime = addMinutes(phoneCode.lastSentAt, MIN_INTERVAL_MINUTES);
                if (isAfter(now, nextAllowedTime)) {
                    const remainingSeconds = Math.ceil(
                        (nextAllowedTime.getTime() - now.getTime()) / 1000,
                    );
                    throw new HttpException(
                        `Please wait ${remainingSeconds} seconds before requesting another flash call.`,
                        HttpStatus.TOO_MANY_REQUESTS,
                    );
                }
            }

            if (phoneCode.requestCount >= MAX_REQUESTS_PER_DAY) {
                await this.prisma.phoneCode.update({
                    where: { phone },
                    data: {
                        blockedUntil: addHours(now, BLOCK_DURATION_HOURS),
                    },
                });
                throw new HttpException(
                    'You have exceeded the maximum number of flash calls. Please try again after 24 hours.',
                    HttpStatus.TOO_MANY_REQUESTS,
                );
            }
        }

        let pincode: string;
        try {
            const callService = this.callFactory.getCallService(CallProviders.ZVONOK);
            pincode = await callService.initiateFlashCall(sendFlashCallDto);

            if (!pincode || pincode.length !== 4) {
                throw new Error('Invalid pincode received from Zvonok API');
            }

            this.logger.log(`Flash call sent successfully to ${phone}`);
        } catch (error) {
            this.logger.error(`Failed to send flash call: ${error.message}`);
            throw new HttpException('Failed to send flash call', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        const phoneCodeHash = await bcrypt.hash(pincode, 10);

        await this.prisma.phoneCode.upsert({
            where: { phone },
            create: {
                phone,
                phoneCodeHash,
                requestCount: 1,
                lastSentAt: now,
                expiresAt: addMinutes(now, PINCODE_EXPIRATION_MINUTES),
                user: {
                    connect: { id: userId },
                },
            },
            update: {
                phoneCodeHash,
                requestCount: phoneCode ? phoneCode.requestCount + 1 : 1,
                lastSentAt: now,
                expiresAt: addMinutes(now, PINCODE_EXPIRATION_MINUTES),
            },
        });

        return {
            status: 200,
            description: 'Flash call initiated successfully',
        };
    }

    public async verifyFlashCall(verifyFlashCallDto: VerifyFlashCallDto): Promise<void> {
        const { phone, code } = verifyFlashCallDto;
        const phoneCode = await this.prisma.phoneCode.findUnique({
            where: { phone },
        });

        if (!phoneCode) {
            throw new HttpException(
                'No flash call request found for this phone number',
                HttpStatus.BAD_REQUEST,
            );
        }

        const now = new Date();
        if (phoneCode.blockedUntil && isAfter(now, phoneCode.blockedUntil)) {
            const remainingMinutes = Math.ceil(
                (phoneCode.blockedUntil.getTime() - now.getTime()) / 60000,
            );
            throw new HttpException(
                `You are temporarily blocked. Please try again after ${remainingMinutes} minutes.`,
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        if (isAfter(now, phoneCode.expiresAt)) {
            throw new HttpException(
                'Verification code has expired. Please request a new flash call.',
                HttpStatus.BAD_REQUEST,
            );
        }

        const isMatch = await bcrypt.compare(code, phoneCode.phoneCodeHash);
        if (!isMatch) {
            throw new HttpException('Invalid verification code.', HttpStatus.BAD_REQUEST);
        }

        await this.prisma.phoneCode.delete({
            where: { phone },
        });

        this.logger.log(`Phone verification successful and code removed. Phone: ${phone}`);
    }
}
