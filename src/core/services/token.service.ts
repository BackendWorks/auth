import { Injectable } from "@nestjs/common";
import { JwtPayload, decode, sign } from 'jsonwebtoken';
import { ConfigService } from "src/config/config.service";
import { IDecodeResponse } from "../interfaces/IDecodeResponse";
import { ITokenResponse } from "../interfaces/ITokenResponse";

@Injectable()
export class TokenService {
    constructor(private configService: ConfigService) { }

    public createToken(payload: any): ITokenResponse {
        const accessExp = this.configService.get('accessExp');
        const refreshExp = this.configService.get('refreshExp');
        const secretKey = this.configService.get('secretKey');
        const accessToken = sign(payload, secretKey, { expiresIn: accessExp });
        const refreshToken = sign(payload, secretKey, { expiresIn: refreshExp });
        return {
            accessToken,
            refreshToken,
        };
    }

    public async decodeToken(
        token: string,
    ): Promise<string | JwtPayload | IDecodeResponse> {
        return decode(token);
    }

}