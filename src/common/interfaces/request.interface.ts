import type { Role } from '@prisma/client';

export interface IAuthUserPayload {
    userId: string;
    role: Role;
}

export interface IRequest {
    user: IAuthUserPayload;
}