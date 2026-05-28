import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampRegistration } from './entities/camp-registration.entity';
import { UpsertCampRegistrationDto } from './dto/upsert-camp-registration.dto';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/entities/user.entity';

function normalizeTelegramUsername(raw: string | null | undefined): string | null {
  if (raw == null || raw === '') return null;
  const t = raw.trim().replace(/^@+/, '');
  return t === '' ? null : t;
}

@Injectable()
export class CampService {
  constructor(
    @InjectRepository(CampRegistration)
    private readonly campRepo: Repository<CampRegistration>,
    private readonly usersService: UsersService,
  ) {}

  async findByUserId(userId: number): Promise<CampRegistration | null> {
    return this.campRepo.findOne({
      where: { userId },
      relations: ['user'],
    });
  }

  async findAllWithUsers(): Promise<CampRegistration[]> {
    return this.campRepo.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async upsertForUser(
    userId: number,
    dto: UpsertCampRegistrationDto,
  ): Promise<CampRegistration> {
    if (dto.username !== undefined) {
      const username = normalizeTelegramUsername(dto.username ?? undefined);
      await this.usersService.update(userId, { username });
    }

    let reg = await this.campRepo.findOne({ where: { userId } });
    const payload = {
      userId,
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      phone: dto.phone.trim(),
      email: dto.email.trim(),
      city: dto.city.trim(),
    };

    if (reg) {
      Object.assign(reg, payload);
    } else {
      reg = this.campRepo.create(payload);
    }
    return this.campRepo.save(reg);
  }

  /** Пользователи-участники с заявкой на camp; опционально по source */
  async findUsersForCampBroadcast(source?: string): Promise<User[]> {
    const qb = this.campRepo
      .createQueryBuilder('cr')
      .innerJoinAndSelect('cr.user', 'user')
      .where('user.role = :role', { role: UserRole.PARTICIPANT });

    if (source && source !== 'all') {
      qb.andWhere('user.source = :source', { source });
    }

    const rows = await qb.getMany();
    return rows.map((r) => r.user);
  }
}
