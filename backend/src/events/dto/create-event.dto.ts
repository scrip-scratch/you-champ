import { IsString, IsOptional, IsBoolean, Matches } from 'class-validator';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  fullDescription?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  siteUrl?: string;

  @IsOptional()
  @IsString()
  siteUrlText?: string;

  /** Дата начала YYYY-MM-DD */
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'startDate must be YYYY-MM-DD' })
  startDate?: string;

  /** Время начала HH:mm */
  @IsOptional()
  @IsString()
  @Matches(/^\d{1,2}:\d{2}$/, { message: 'startTime must be HH:mm' })
  startTime?: string;

  /** Дата окончания YYYY-MM-DD */
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'endDate must be YYYY-MM-DD' })
  endDate?: string;

  /** Время окончания HH:mm */
  @IsOptional()
  @IsString()
  @Matches(/^\d{1,2}:\d{2}$/, { message: 'endTime must be HH:mm' })
  endTime?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
