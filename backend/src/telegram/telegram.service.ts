import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { UsersService } from '../users/users.service';

@Injectable()
export class TelegramService {
  constructor(
    @InjectBot() private readonly bot: Telegraf,
    private readonly usersService: UsersService,
  ) {}

  async sendNotificationToUser(
    telegramId: string,
    adminUsername: string,
  ): Promise<void> {
    const message = `🎉 Поздравляем! Вы стали победителем розыгрыша!\n\nПожалуйста, свяжитесь с администратором для получения приза:\n@${adminUsername}`;

    try {
      await this.bot.telegram.sendMessage(parseInt(telegramId), message);
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw new Error('Не удалось отправить уведомление');
    }
  }

  async broadcastMessage(message: string, source?: string): Promise<{ sent: number; failed: number }> {
    const participants = await this.usersService.findParticipantsBySource(source);
    let sent = 0;
    let failed = 0;

    for (const user of participants) {
      try {
        await this.bot.telegram.sendMessage(parseInt(user.telegramId), message);
        sent++;
      } catch (error) {
        console.error(`Failed to send to ${user.telegramId}:`, error);
        failed++;
      }
    }

    return { sent, failed };
  }
}
