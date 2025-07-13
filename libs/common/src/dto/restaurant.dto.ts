import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { MenuCategory } from '../entities/menu-item.entity';

export class CreateMenuItemDto {
  @ApiProperty({
    description: 'Menu item name',
    example: 'Margherita Pizza',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Menu item description',
    example: 'Classic tomato sauce with mozzarella cheese',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Menu item price',
    example: 12.99,
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'Menu item category',
    enum: MenuCategory,
    example: MenuCategory.PIZZA,
  })
  @IsString()
  category: MenuCategory;

  @ApiProperty({
    description: 'Whether the item is available',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

export class CreateOrderItemDto {
  @ApiProperty({
    description: 'Menu item ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  menuItemId: string;

  @ApiProperty({
    description: 'Quantity of the item',
    example: 2,
  })
  @IsNumber()
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Array of order items',
    type: [CreateOrderItemDto],
  })
  @IsArray()
  items: CreateOrderItemDto[];
}

export class OrderResponseDto {
  @ApiProperty({
    description: 'Order ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Total order amount',
    example: 25.98,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Order status',
    example: 'pending',
  })
  status: string;

  @ApiProperty({
    description: 'Order creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}
