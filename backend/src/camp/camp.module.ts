import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampRegistration } from './entities/camp-registration.entity';
import { CampService } from './camp.service';
import { CampController } from './camp.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([CampRegistration]), UsersModule],
  controllers: [CampController],
  providers: [CampService],
  exports: [CampService],
})
export class CampModule {}
