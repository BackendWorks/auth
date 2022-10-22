import { config } from 'dotenv';
config();
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  private config: { [key: string]: any } = {};
  constructor() {
    this.config.servicePort = process.env.AUTH_PORT;
    this.config.service = process.env.AUTH_HOST;
    this.config.rb_url = process.env.RABBITMQ_URL;
    this.config.token_queue = process.env.RABBITMQ_TOKEN_QUEUE;
    this.config.auth_queue = process.env.RABBITMQ_AUTH_QUEUE;
    this.config.mailer_queue = process.env.RABBITMQ_MAILER_QUEUE;
    this.config.logger_queue = process.env.RABBITMQ_LOGGER_QUEUE;
    this.config.accessExp = process.env.ACCESS_EXP;
    this.config.refreshExp = process.env.REFRESH_EXP;
    this.config.secretKey = process.env.APP_SECRET;
    this.config.env = process.env.NODE_ENV;
    this.config.tokenExp = process.env.PASSWORD_TOKEN_EXP
  }

  public get(key: string): any {
    return this.config[key];
  }
}
