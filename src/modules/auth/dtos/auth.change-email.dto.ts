import { IsEmail, IsNotEmpty } from 'class-validator';

export class ChangeEmailDto {
    @IsNotEmpty()
    @IsEmail()
    newEmail: string;

    @IsNotEmpty()
    currentEmail: string;
}
