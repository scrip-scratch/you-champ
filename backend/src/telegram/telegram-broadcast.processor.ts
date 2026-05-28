import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { TelegramService } from './telegram.service';
import { TELEGRAM_BROADCAST_QUEUE } from './telegram-broadcast.constants';
import type { TelegramBroadcastJobData } from './telegram.service';

@Processor(TELEGRAM_BROADCAST_QUEUE, {
  concurrency: 1,
  limiter: { max: 25, duration: 1000 },
  lockDuration: 600_000,
  stalledInterval: 120_000,
})
export class TelegramBroadcastProcessor extends WorkerHost {
  constructor(private readonly telegramService: TelegramService) {
    super();
  }

  async process(job: Job<TelegramBroadcastJobData>): Promise<{
    sent: number;
    failed: number;
  }> {
    return this.telegramService.executeBroadcastJob(job.data, job);
  }
}
