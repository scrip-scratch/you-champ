import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll(search?: string): Promise<User[]> {
    if (search) {
      return this.usersRepository.find({
        where: [
          { firstName: Like(`%${search}%`) },
          { lastName: Like(`%${search}%`) },
          { username: Like(`%${search}%`) },
          { phone: Like(`%${search}%`) },
        ],
        order: { createdAt: 'DESC' },
      });
    }
    return this.usersRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findParticipants(search?: string): Promise<User[]> {
    const baseWhere = { role: UserRole.PARTICIPANT };

    if (search) {
      return this.usersRepository.find({
        where: [
          { ...baseWhere, firstName: Like(`%${search}%`) },
          { ...baseWhere, lastName: Like(`%${search}%`) },
          { ...baseWhere, username: Like(`%${search}%`) },
          { ...baseWhere, phone: Like(`%${search}%`) },
        ],
        order: { createdAt: 'DESC' },
      });
    }
    return this.usersRepository.find({
      where: baseWhere,
      order: { createdAt: 'DESC' },
    });
  }

  async findParticipantsBySource(source?: string): Promise<User[]> {
    const participants = await this.findParticipants();
    if (!source || source === 'all') {
      return participants;
    }
    return participants.filter((u) => u.source === source);
  }

  async findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByTelegramId(telegramId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { telegramId } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
