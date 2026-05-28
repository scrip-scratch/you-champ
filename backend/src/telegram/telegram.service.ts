import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf, TelegramError } from 'telegraf';
import { Job, Queue } from 'bullmq';
import { randomUUID } from 'crypto';
import { UsersService } from '../users/users.service';
import { CampService } from '../camp/camp.service';
import {
  TELEGRAM_BROADCAST_JOB_NAME,
  TELEGRAM_BROADCAST_QUEUE,
} from './telegram-broadcast.constants';

export interface TelegramBroadcastJobData {
  message: string;
  source?: string;
  campRegistrantsOnly: boolean;
}

export interface TelegramBroadcastJobStatus {
  state:
    | 'waiting'
    | 'active'
    | 'completed'
    | 'failed'
    | 'delayed'
    | 'prioritized'
    | 'waiting-children'
    | 'unknown'
    | 'not_found';
  progress: number;
  result?: { sent: number; failed: number };
  failedReason?: string;
}

@Injectable()
export class TelegramService {
  constructor(
    @InjectBot() private readonly bot: Telegraf,
    private readonly usersService: UsersService,
    private readonly campService: CampService,
    @InjectQueue(TELEGRAM_BROADCAST_QUEUE)
    private readonly broadcastQueue: Queue<
      TelegramBroadcastJobData,
      { sent: number; failed: number }
    >,
  ) {}

  async sendNotificationToUser(
    telegramId: string,
    adminUsername: string,
  ): Promise<void> {
    const message = `🎉 Поздравляем! Вы стали победителем розыгрыша путевки в первый танцевальный лагерь YC Summer Camp!\n\nПожалуйста, свяжитесь с администратором для получения приза:\n@${adminUsername}`;

    try {
      await this.bot.telegram.sendMessage(parseInt(telegramId), message);
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw new Error('Не удалось отправить уведомление');
    }
  }

  async enqueueBroadcast(
    message: string,
    source?: string,
    campRegistrantsOnly?: boolean,
  ): Promise<{ jobId: string }> {
    const jobId = randomUUID();
    await this.broadcastQueue.add(
      TELEGRAM_BROADCAST_JOB_NAME,
      {
        message,
        source,
        campRegistrantsOnly: !!campRegistrantsOnly,
      },
      { jobId },
    );
    return { jobId };
  }

  async getBroadcastJobStatus(
    jobId: string,
  ): Promise<TelegramBroadcastJobStatus> {
    const job = await this.broadcastQueue.getJob(jobId);
    if (!job) {
      return { state: 'not_found', progress: 0 };
    }

    const state = await job.getState();
    const progress = typeof job.progress === 'number' ? job.progress : 0;

    const status: TelegramBroadcastJobStatus = {
      state: state as TelegramBroadcastJobStatus['state'],
      progress,
    };

    if (state === 'completed' && job.returnvalue != null) {
      status.result = job.returnvalue as { sent: number; failed: number };
    }

    if (state === 'failed' && job.failedReason) {
      status.failedReason = job.failedReason;
    }

    return status;
  }

  async executeBroadcastJob(
    data: TelegramBroadcastJobData,
    job: Job<TelegramBroadcastJobData>,
  ): Promise<{ sent: number; failed: number }> {
    const { message, source, campRegistrantsOnly } = data;
    const participants = campRegistrantsOnly
      ? await this.campService.findUsersForCampBroadcast(source)
      : await this.usersService.findParticipantsBySource(source);

    const total = participants.length;
    let sent = 0;
    let failed = 0;

    await job.updateProgress(total === 0 ? 100 : 0);

    for (let i = 0; i < participants.length; i++) {
      const user = participants[i];
      try {
        await this.sendBroadcastMessage(
          parseInt(user.telegramId, 10),
          message,
        );
        sent++;
      } catch (error) {
        console.error(`Failed to send to ${user.telegramId}:`, error);
        failed++;
      }

      if (total > 0 && (i % 25 === 24 || i === participants.length - 1)) {
        await job.updateProgress(Math.round(((i + 1) / total) * 100));
      }
    }

    await job.updateProgress(100);
    return { sent, failed };
  }

  private async sendBroadcastMessage(
    chatId: number,
    text: string,
  ): Promise<void> {
    const maxAttempts = 4;
    let delayMs = 1500;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        await this.bot.telegram.sendMessage(chatId, text);
        return;
      } catch (error: unknown) {
        const retryAfterSec = this.getTelegramRetryAfter(error);
        const isRateLimited =
          retryAfterSec != null ||
          this.getTelegramErrorCode(error) === 429 ||
          this.messageIncludesTooManyRequests(error);

        if (isRateLimited && attempt < maxAttempts - 1) {
          const waitMs =
            retryAfterSec != null
              ? retryAfterSec * 1000 + Math.floor(Math.random() * 400)
              : delayMs + Math.floor(Math.random() * 400);
          await new Promise((r) => setTimeout(r, waitMs));
          delayMs = Math.min(delayMs * 2, 60_000);
          continue;
        }
        throw error;
      }
    }
  }

  private getTelegramErrorCode(error: unknown): number | undefined {
    if (error instanceof TelegramError) {
      return error.response?.error_code;
    }
    if (
      error &&
      typeof error === 'object' &&
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'error_code' in error.response
    ) {
      const code = (error.response as { error_code?: number }).error_code;
      return typeof code === 'number' ? code : undefined;
    }
    return undefined;
  }

  private getTelegramRetryAfter(error: unknown): number | undefined {
    if (error instanceof TelegramError) {
      const sec = error.parameters?.retry_after;
      return typeof sec === 'number' ? sec : undefined;
    }
    if (
      error &&
      typeof error === 'object' &&
      'parameters' in error &&
      error.parameters &&
      typeof error.parameters === 'object' &&
      'retry_after' in error.parameters
    ) {
      const sec = (error.parameters as { retry_after?: number }).retry_after;
      return typeof sec === 'number' ? sec : undefined;
    }
    return undefined;
  }

  private messageIncludesTooManyRequests(error: unknown): boolean {
    const msg = error instanceof TelegramError
      ? error.description
      : error instanceof Error
        ? error.message
        : String(error);
    return msg.toLowerCase().includes('too many requests');
  }
}
