import { Injectable } from '@nestjs/common';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  ISignUpResult,
} from 'amazon-cognito-identity-js';
import { ConfigService } from '../config/config.service';

@Injectable()
export class AuthService {
  private userPool: CognitoUserPool;

  constructor(private readonly configService: ConfigService) {
    this.userPool = new CognitoUserPool({
      UserPoolId: this.configService.get('cognitoUserPoolId'),
      ClientId: this.configService.get('cognitoClientId'),
    });
  }

  registerUser(registerRequest: {
    email: string;
    password: string;
  }): Promise<ISignUpResult> {
    const { email, password } = registerRequest;
    return new Promise((resolve, reject) => {
      this.userPool.signUp(email, password, null, null, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }

  verify(email: string, otp: string) {
    return new Promise((resolve, reject) => {
      const userData = {
        Username: email,
        Pool: this.userPool,
      };
      const user = new CognitoUser(userData);
      user.confirmRegistration(otp, false, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }

  sendOtpRequest(email: string) {
    return new Promise((resolve, reject) => {
      const userData = {
        Username: email,
        Pool: this.userPool,
      };
      const user = new CognitoUser(userData);
      user.resendConfirmationCode((err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }

  authenticateUser(data: {
    email: string;
    password: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = data;

    const userData = {
      Username: email,
      Pool: this.userPool,
    };

    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const user = new CognitoUser(userData);

    return new Promise((resolve, reject) => {
      return user.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          resolve({
            accessToken: result.getIdToken().getJwtToken(),
            refreshToken: result.getRefreshToken().getToken(),
          });
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }
}
