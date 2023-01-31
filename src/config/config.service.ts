import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
config();

interface Config {
  servicePort: string;
  rb_url: string;
  auth_queue: string;
  mailer_queue: string;
  accessExp: string;
  refreshExp: string;
  authSecret: string;
  env: string;
  tokenExp: string;
}

@Injectable()
export class ConfigService {
  private config = {} as Config;
  constructor() {
    this.config.servicePort = process.env.PORT;
    this.config.rb_url = process.env.RABBITMQ_URL;
    this.config.auth_queue = process.env.RABBITMQ_AUTH_QUEUE;
    this.config.mailer_queue = process.env.RABBITMQ_MAILER_QUEUE;
    this.config.authSecret = process.env.AUTH_SECRET;
    this.config.env = process.env.NODE_ENV;
    this.config.tokenExp = process.env.TOKEN_EXP;
  }

  public get(key: keyof Config): any {
    return this.config[key];
  }
}
