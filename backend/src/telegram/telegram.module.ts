import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramUpdate } from './telegram.update';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { TelegramBroadcastProcessor } from './telegram-broadcast.processor';
import { UsersModule } from '../users/users.module';
import { SourcesModule } from '../sources/sources.module';
import { CampModule } from '../camp/camp.module';
import { TELEGRAM_BROADCAST_QUEUE } from './telegram-broadcast.constants';

@Module({
  imports: [
    BullModule.registerQueue({
      name: TELEGRAM_BROADCAST_QUEUE,
      defaultJobOptions: {
        attempts: 1,
        removeOnComplete: 500,
        removeOnFail: 200,
      },
    }),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('TELEGRAM_BOT_TOKEN'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    SourcesModule,
    CampModule,
  ],
  controllers: [TelegramController],
  providers: [TelegramUpdate, TelegramService, TelegramBroadcastProcessor],
  exports: [TelegramService],
})
export class TelegramModule {}
