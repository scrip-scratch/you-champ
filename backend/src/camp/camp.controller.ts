import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CampService } from './camp.service';
import { UpsertCampRegistrationDto } from './dto/upsert-camp-registration.dto';

@Controller('camp')
@UseGuards(JwtAuthGuard)
export class CampController {
  constructor(private readonly campService: CampService) {}

  @Get('me')
  async getMine(@Request() req: { user: { id: number } }) {
    return this.campService.findByUserId(req.user.id);
  }

  @Put('me')
  async upsertMine(
    @Request() req: { user: { id: number } },
    @Body() dto: UpsertCampRegistrationDto,
  ) {
    await this.campService.upsertForUser(req.user.id, dto);
    return this.campService.findByUserId(req.user.id);
  }

  @Get('registrations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async listRegistrations() {
    return this.campService.findAllWithUsers();
  }
}
