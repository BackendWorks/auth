import { Injectable } from "@nestjs/common";
import { decode, sign } from 'jsonwebtoken';
import { ConfigService } from "src/config/config.service";
import { ITokenResponse } from "../interfaces";

@Injectable()
export class TokenService {
    constructor(private configService: ConfigService) { }

    public createToken(payload: any): ITokenResponse {
        const accessExp = this.configService.get('accessExp');
        const refreshExp = this.configService.get('refreshExp');
        const secretKey = this.configService.get('secretKey');
        const accessToken = sign({ userId: payload }, secretKey, { expiresIn: accessExp });
        const refreshToken = sign({ userId: payload }, secretKey, { expiresIn: refreshExp });
        return {
            accessToken,
            refreshToken,
        };
    }

    public decodeToken(
        token: string,
    ): any {
        return decode(token);
    }

}