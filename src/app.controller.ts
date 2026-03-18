import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  // eslint-disable-next-line prettier/prettier
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('hello')
  getHelloCustom(): string {
    return this.appService.getHelloCustom();
  }

  @Get('config')
  getConfig(): any {
    return this.appService.getConfig();
  }

  @Public()
  @Get('health')
  getPublic(): string {
    return 'This is a public route';
  }
}
