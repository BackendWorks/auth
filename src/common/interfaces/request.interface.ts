import { ROLE } from '@prisma/client';

export interface IAuthUserPayload {
    userId: string;
    role: ROLE;
}

export interface IRequest {
    user: IAuthUserPayload;
}
