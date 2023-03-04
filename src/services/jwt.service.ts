import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from 'src/config/config.service';
import { PrismaService } from './prisma.service';

@Injectable()
export class JwtService extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 3,
        jwksUri: `${configService.get('authority')}/${configService.get(
          'cognitoUserPoolId',
        )}/.well-known/jwks.json`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: configService.get('cognitoClientId'),
      issuer: `${configService.get('authority')}/${configService.get(
        'cognitoUserPoolId',
      )}`,
      algorithms: ['RS256'],
    });
  }

  public async validate(payload: any) {
    // console.debug('JWT VALIDATION', payload);
    const user = await this.prisma.user.findUnique({
      where: { cognito_sub: payload?.sub },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async validateToken(accessToken: string) {
    try {
      const verifier = CognitoJwtVerifier.create({
        userPoolId: this.configService.get('cognitoUserPoolId'),
        tokenUse: 'id',
        clientId: this.configService.get('cognitoClientId'),
      });
      const payload = await verifier.verify(accessToken);
      const user = await this.prisma.user.findUnique({
        where: { cognito_sub: payload?.sub },
      });
      if (!user) {
        throw new UnauthorizedException();
      }
      return { status: true, data: user, error: null };
    } catch (e) {
      return { status: false, data: null, error: e.message };
    }
  }
}
