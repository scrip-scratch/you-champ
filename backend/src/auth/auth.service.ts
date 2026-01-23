import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';

interface TelegramUserData {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

@Injectable()
export class AuthService {
  private adminTelegramIds: string[];

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    const adminIds = this.configService.get<string>('ADMIN_TELEGRAM_IDS') || '';
    this.adminTelegramIds = adminIds.split(',').filter((id) => id.trim());
  }

  validateTelegramInitData(initData: string): TelegramUserData | null {
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN is not set');
      return null;
    }

    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');

    // Sort parameters alphabetically
    const dataCheckArr: string[] = [];
    urlParams.sort();
    urlParams.forEach((value, key) => {
      dataCheckArr.push(`${key}=${value}`);
    });
    const dataCheckString = dataCheckArr.join('\n');

    // Calculate secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      console.error('Invalid Telegram initData hash');
      return null;
    }

    // Check auth_date (not older than 24 hours)
    const authDate = parseInt(urlParams.get('auth_date') || '0', 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) {
      console.error('Telegram initData is too old');
      return null;
    }

    // Parse user data
    const userDataStr = urlParams.get('user');
    if (!userDataStr) {
      console.error('No user data in initData');
      return null;
    }

    try {
      return JSON.parse(userDataStr);
    } catch (e) {
      console.error('Failed to parse user data:', e);
      return null;
    }
  }

  async authenticateWithTelegram(initData: string) {
    const telegramUser = this.validateTelegramInitData(initData);
    if (!telegramUser) {
      throw new UnauthorizedException('Invalid Telegram authentication data');
    }

    const telegramId = telegramUser.id.toString();
    let user = await this.usersService.findByTelegramId(telegramId);

    if (!user) {
      // Create user if not exists
      const isAdmin = this.adminTelegramIds.includes(telegramId);
      user = await this.usersService.create({
        telegramId,
        username: telegramUser.username || null,
        firstName: telegramUser.first_name || null,
        lastName: telegramUser.last_name || null,
        photoUrl: telegramUser.photo_url || null,
        role: isAdmin ? UserRole.ADMIN : UserRole.PARTICIPANT,
      });
    }

    const payload = { sub: user.id, telegramId: user.telegramId };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
