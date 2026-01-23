import { Update, Start, Ctx } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';

@Update()
export class TelegramUpdate {
  private adminTelegramIds: string[];

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    const adminIds = this.configService.get<string>('ADMIN_TELEGRAM_IDS') || '';
    this.adminTelegramIds = adminIds.split(',').filter((id) => id.trim());
  }

  @Start()
  async onStart(@Ctx() ctx: Context) {
    const telegramUser = ctx.from;
    if (!telegramUser) {
      return;
    }

    const telegramId = telegramUser.id.toString();
    const isAdmin = this.adminTelegramIds.includes(telegramId);

    // Check if user already exists
    let user = await this.usersService.findByTelegramId(telegramId);

    if (!user) {
      // Get user photo if available
      let photoUrl: string | null = null;
      try {
        const photos = await ctx.telegram.getUserProfilePhotos(telegramUser.id, 0, 1);
        if (photos.total_count > 0) {
          const fileId = photos.photos[0][0].file_id;
          const file = await ctx.telegram.getFile(fileId);
          photoUrl = `https://api.telegram.org/file/bot${this.configService.get('TELEGRAM_BOT_TOKEN')}/${file.file_path}`;
        }
      } catch (error) {
        console.log('Could not get user photo:', error.message);
      }

      // Create new user
      user = await this.usersService.create({
        telegramId,
        username: telegramUser.username || null,
        firstName: telegramUser.first_name || null,
        lastName: telegramUser.last_name || null,
        photoUrl,
        role: isAdmin ? UserRole.ADMIN : UserRole.PARTICIPANT,
      });

      // Notify admin about new registration
      if (isAdmin) {
        await ctx.reply(
          `🎉 Добро пожаловать, администратор!\n\nВы зарегистрированы как администратор системы.`,
        );
      } else {
        await ctx.reply(
          `👋 Добро пожаловать!\n\nВы успешно зарегистрированы как участник.`,
        );
      }

      console.log(
        `New user registered: ${telegramUser.first_name} (${telegramId}), role: ${isAdmin ? 'admin' : 'participant'}`,
      );
    } else {
      await ctx.reply(
        `👋 С возвращением, ${user.firstName || 'друг'}!\n\nВы уже зарегистрированы в системе.`,
      );
    }

    // Send mini app button
    await ctx.reply('Нажмите кнопку ниже, чтобы открыть приложение:', {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📱 Открыть приложение',
              web_app: {
                url: this.configService.get<string>('WEBAPP_URL') || 'https://your-app.com',
              },
            },
          ],
        ],
      },
    });
  }
}
