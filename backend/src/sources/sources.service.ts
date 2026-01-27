import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Source } from './entities/source.entity';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSourceDto } from './dto/update-source.dto';

@Injectable()
export class SourcesService {
  constructor(
    @InjectRepository(Source)
    private sourcesRepository: Repository<Source>,
  ) {}

  async create(createSourceDto: CreateSourceDto): Promise<Source> {
    // Check if code already exists
    const existing = await this.sourcesRepository.findOne({
      where: { code: createSourceDto.code },
    });
    if (existing) {
      throw new ConflictException(`Source with code "${createSourceDto.code}" already exists`);
    }

    const source = this.sourcesRepository.create(createSourceDto);
    return this.sourcesRepository.save(source);
  }

  async findAll(): Promise<Source[]> {
    return this.sourcesRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Source> {
    const source = await this.sourcesRepository.findOne({ where: { id } });
    if (!source) {
      throw new NotFoundException(`Source with ID ${id} not found`);
    }
    return source;
  }

  async findByCode(code: string): Promise<Source | null> {
    return this.sourcesRepository.findOne({ where: { code } });
  }

  async update(id: string, updateSourceDto: UpdateSourceDto): Promise<Source> {
    const source = await this.findOne(id);

    // Check if new code conflicts with existing
    if (updateSourceDto.code && updateSourceDto.code !== source.code) {
      const existing = await this.sourcesRepository.findOne({
        where: { code: updateSourceDto.code },
      });
      if (existing) {
        throw new ConflictException(`Source with code "${updateSourceDto.code}" already exists`);
      }
    }

    Object.assign(source, updateSourceDto);
    return this.sourcesRepository.save(source);
  }

  async remove(id: string): Promise<void> {
    const source = await this.findOne(id);
    await this.sourcesRepository.remove(source);
  }

  async incrementUsage(code: string): Promise<void> {
    const source = await this.findByCode(code);
    if (source) {
      source.usageCount += 1;
      await this.sourcesRepository.save(source);
    }
  }
}
