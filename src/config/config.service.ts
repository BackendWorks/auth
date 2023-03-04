import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
config();

interface Config {
  env: string;
  servicePort: string;
  rb_url: string;
  auth_queue: string;
  mailer_queue: string;
  files_queue: string;
  notification_queue: string;
  cognitoUserPoolId: string;
  cognitoClientId: string;
  authority: string;
}

@Injectable()
export class ConfigService {
  private config = {} as Config;
  constructor() {
    this.config.env = process.env.NODE_ENV;
    this.config.servicePort = process.env.PORT;
    this.config.rb_url = process.env.RABBITMQ_URL;
    this.config.auth_queue = process.env.RABBITMQ_AUTH_QUEUE;
    this.config.files_queue = process.env.RABBITMQ_FILES_QUEUE;
    this.config.cognitoClientId = process.env.AWS_COGNITO_CLIENT_ID;
    this.config.cognitoUserPoolId = process.env.AWS_COGNITO_USER_POOL_ID;
    this.config.authority = process.env.AWS_COGNITO_AUTHORITY;
  }

  public get(key: keyof Config): any {
    return this.config[key];
  }
}
