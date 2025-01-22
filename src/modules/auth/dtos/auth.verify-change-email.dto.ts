import { IsEmail, IsNotEmpty, IsUUID } from 'class-validator';

export class VerifyEmailChangeDto {
    @IsNotEmpty()
    @IsUUID()
    verification: string;

    @IsEmail()
    newEmail: string;
}
