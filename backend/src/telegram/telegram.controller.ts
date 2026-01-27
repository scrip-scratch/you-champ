import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

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
    const result = await this.telegramService.broadcastMessage(
      dto.message,
      dto.source === 'all' || !dto.source ? undefined : dto.source,
    );
    return {
      success: true,
      sent: result.sent,
      failed: result.failed,
      message: `Отправлено: ${result.sent}, не доставлено: ${result.failed}`,
    };
  }
}
