import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MenuItem, Order } from '@app/common/entities';
import { CreateMenuItemDto, CreateOrderDto } from '@app/common/dto';

@ApiTags('restaurant')
@Controller()
export class AppController {
  @Get('menu')
  @ApiOperation({ summary: 'Get all menu items' })
  @ApiResponse({ status: 200, description: 'Menu items retrieved successfully' })
  async getMenu(): Promise<MenuItem[]> {
    // TODO: Implement menu retrieval logic
    return [];
  }

  @Post('menu')
  @ApiOperation({ summary: 'Create a new menu item' })
  @ApiResponse({ status: 201, description: 'Menu item created successfully' })
  async createMenuItem(@Body() createMenuItemDto: CreateMenuItemDto): Promise<MenuItem> {
    // TODO: Implement menu item creation logic
    return {} as MenuItem;
  }

  @Post('orders')
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    // TODO: Implement order creation logic
    return {} as Order;
  }
}
