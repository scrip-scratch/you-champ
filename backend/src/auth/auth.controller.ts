import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsString, IsNotEmpty } from 'class-validator';

class TelegramAuthDto {
  @IsString()
  @IsNotEmpty()
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
