import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class UpsertCampRegistrationDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  /** Telegram @username — сохраняется в users.username */
  @IsOptional()
  @IsString()
  username?: string | null;
}
