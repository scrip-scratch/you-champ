import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

class SendNotificationDto {
  @IsString()
  @IsNotEmpty()
  telegramId: string;

  @IsString()
  @IsNotEmpty()
  adminUsername: string;
}

class BroadcastDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsBoolean()
  campRegistrantsOnly?: boolean;
}

@Controller('telegram')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('send-notification')
  async sendNotification(@Body() dto: SendNotificationDto) {
    await this.telegramService.sendNotificationToUser(
      dto.telegramId,
      dto.adminUsername,
    );
    return { success: true, message: 'Уведомление отправлено' };
  }

  @Post('broadcast')
  async broadcast(@Body() dto: BroadcastDto) {
    const { jobId } = await this.telegramService.enqueueBroadcast(
      dto.message,
      dto.source === 'all' || !dto.source ? undefined : dto.source,
      !!dto.campRegistrantsOnly,
    );
    return {
      success: true,
      jobId,
      message:
        'Рассылка поставлена в очередь. Идёт отправка — статус обновляется на странице.',
    };
  }

  @Get('broadcast/jobs/:jobId')
  async broadcastJobStatus(@Param('jobId', ParseUUIDPipe) jobId: string) {
    const status = await this.telegramService.getBroadcastJobStatus(jobId);
    return { success: true, ...status };
  }
}
