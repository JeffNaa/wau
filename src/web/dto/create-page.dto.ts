import { IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString, IsEnum } from 'class-validator';
import { PageStatus } from '@prisma/client';

export class CreatePageDto {
  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsObject()
  layout?: Record<string, any>;

  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isHome?: boolean;

  @IsOptional()
  @IsEnum(PageStatus)
  status?: PageStatus;
}
