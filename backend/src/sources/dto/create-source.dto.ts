import { IsString, IsOptional, IsBoolean, Matches, MaxLength } from 'class-validator';

export class CreateSourceDto {
  @IsString()
  @MaxLength(64)
  @Matches(/^[A-Za-z0-9_-]+$/, {
    message: 'Code can only contain letters, numbers, underscores and hyphens',
  })
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
