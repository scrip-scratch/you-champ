import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

class TelegramAuthDto {
  initData: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('telegram')
  async authenticateWithTelegram(@Body() body: TelegramAuthDto) {
    return this.authService.authenticateWithTelegram(body.initData);
  }
}
