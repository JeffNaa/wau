import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateNavigationDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  href: string;

  @IsString()
  @IsNotEmpty()
  position: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsString()
  parentId?: string;
}
