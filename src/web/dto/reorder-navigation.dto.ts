import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class NavigationOrderItem {
  id: string;
  order: number;
}

export class ReorderNavigationDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NavigationOrderItem)
  orders: { id: string; order: number }[];
}
