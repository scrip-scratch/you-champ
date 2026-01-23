import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramUpdate } from './telegram.update';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('TELEGRAM_BOT_TOKEN'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  providers: [TelegramUpdate],
})
export class TelegramModule {}
