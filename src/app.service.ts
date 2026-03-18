/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly config: ConfigService) {}
  getHello(): string {
    return 'Hello World!';
  }

  getHelloCustom(): string {
    return 'Hello World!, this is a custom message';
  }

  getConfig() {
    return {
      port: this.config.get<number>('PORT'),
      nodeEnv: this.config.get<string>('NODE_ENV'),
      appName: this.config.get<string>('APP_NAME'),
    };
  }
}
