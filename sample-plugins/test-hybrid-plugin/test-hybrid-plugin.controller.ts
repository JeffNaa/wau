import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { TestHybridPluginService } from './test-hybrid-plugin.service';

@Controller()
export class TestHybridPluginController {
  constructor(
    private readonly service: TestHybridPluginService,
    @Inject('PluginSchemaService') private readonly schema: any,
    @Inject('PluginDataService') private readonly data: any,
  ) {}

  private readonly pluginName = 'test-hybrid-plugin';

  @Get('status')
  getStatus() {
    return this.service.getStatus();
  }

  // ========== Shop Config (KV Store) ==========

  @Get('config')
  async getShopConfig() {
    const row = await this.data.get(this.pluginName, 'config:shop');
    return row?.data ?? {
    };
  }

  @Post('config')
  async setShopConfig(@Body() body: any) {
    const current = await this.getShopConfig();
    const merged = { ...current, ...body };
    const row = await this.data.set(this.pluginName, 'config:shop', merged);
    return row.data;
  }

  // ========== Categories (KV Store) ==========

  @Get('categories')
  async getCategories() {
    const row = await this.data.get(this.pluginName, 'config:categories');
    return row?.data ?? [];
  }

  @Post('categories')
  async setCategories(@Body() body: { categories: string[] }) {
    if (!Array.isArray(body.categories)) {
      throw new BadRequestException('categories must be an array');
    }
    const row = await this.data.set(this.pluginName, 'config:categories', body.categories);
    return row.data;
  }

  // ========== Products (Migration Table + Schema CRUD) ==========

  @Get('products')
  async listProducts(@Query('category') category?: string, @Query('active') active?: string) {
    const where: any = {};
    if (category) where.category = category;
    if (active !== undefined) where.active = active === 'true';
    return this.schema.find(this.pluginName, 'products', {
      where,
      orderBy: { field: 'created_at', direction: 'desc' },
    });
  }

  @Post('products')
  async createProduct(@Body() body: any) {
    return this.schema.create(this.pluginName, 'products', body);
  }

  @Get('products/:id')
  async getProduct(@Param('id') id: string) {
    const product = await this.schema.findOne(this.pluginName, 'products', { id: parseInt(id, 10) });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  @Put('products/:id')
  async updateProduct(@Param('id') id: string, @Body() body: any) {
    const { id: _id, ...data } = body;
    const updated = await this.schema.update(this.pluginName, 'products', { id: parseInt(id, 10) }, data);
    if (updated.length === 0) throw new NotFoundException('Product not found');
    return updated[0];
  }

  @Delete('products/:id')
  async deleteProduct(@Param('id') id: string) {
    const removed = await this.schema.remove(this.pluginName, 'products', { id: parseInt(id, 10) });
    return { removed: removed > 0 };
  }

  // ========== Orders (Migration Table + Schema CRUD) ==========

  @Get('orders')
  async listOrders(@Query('status') status?: string) {
    const where: any = {};
    if (status) where.status = status;
    return this.schema.find(this.pluginName, 'orders', {
      where,
      orderBy: { field: 'created_at', direction: 'desc' },
    });
  }

  @Post('orders')
  async createOrder(@Body() body: any) {
    const product = await this.schema.findOne(this.pluginName, 'products', { id: body.product_id });
    if (!product) throw new NotFoundException('Product not found');
    if (!product.active) throw new BadRequestException('Product is not active');
    if (product.stock < (body.quantity ?? 1)) {
      throw new BadRequestException(`Insufficient stock. Available: ${product.stock}`);
    }

    const quantity = body.quantity ?? 1;
    const total = parseFloat(product.price) * quantity;

    const order = await this.schema.create(this.pluginName, 'orders', {
      ...body,
      quantity,
      total: total.toFixed(2),
    });

    // Decrease stock
    await this.schema.update(this.pluginName, 'products', { id: product.id }, { stock: product.stock - quantity });

    // Update KV stats
    await this.updateOrderStats(total);

    return order;
  }

  @Get('orders/:id')
  async getOrder(@Param('id') id: string) {
    const order = await this.schema.findOne(this.pluginName, 'orders', { id: parseInt(id, 10) });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  @Put('orders/:id')
  async updateOrder(@Param('id') id: string, @Body() body: any) {
    const { id: _id, ...data } = body;
    const updated = await this.schema.update(this.pluginName, 'orders', { id: parseInt(id, 10) }, data);
    if (updated.length === 0) throw new NotFoundException('Order not found');
    return updated[0];
  }

  @Delete('orders/:id')
  async deleteOrder(@Param('id') id: string) {
    const removed = await this.schema.remove(this.pluginName, 'orders', { id: parseInt(id, 10) });
    return { removed: removed > 0 };
  }

  // ========== Relationship: Product Orders ==========

  @Get('products/:id/orders')
  async getProductOrders(@Param('id') id: string) {
    const product = await this.schema.findOne(this.pluginName, 'products', { id: parseInt(id, 10) });
    if (!product) throw new NotFoundException('Product not found');

    const orders = await this.schema.find(this.pluginName, 'orders', {
      where: { product_id: parseInt(id, 10) },
      orderBy: { field: 'created_at', direction: 'desc' },
    });

    return { product, orders };
  }

  // ========== Stats (KV Store) ==========

  @Get('stats')
  async getStats() {
    const orderCountRow = await this.data.get(this.pluginName, 'stats:order_count');
    const revenueRow = await this.data.get(this.pluginName, 'stats:revenue');

    const productCount = await this.schema.count(this.pluginName, 'products');
    const pendingOrders = await this.schema.count(this.pluginName, 'orders', { status: 'pending' });
    const completedOrders = await this.schema.count(this.pluginName, 'orders', { status: 'completed' });

    return {
      products: productCount,
      orders: {
        total: parseInt(orderCountRow?.data?.value ?? 0, 10),
        pending: pendingOrders,
        completed: completedOrders,
      },
      revenue: parseFloat(revenueRow?.data?.value ?? 0),
    };
  }

  @Post('stats/refresh')
  async refreshStats() {
    const orders = await this.schema.find(this.pluginName, 'orders');
    const orderCount = orders.length;
    const revenue = orders.reduce((sum: number, o: any) => sum + parseFloat(o.total ?? 0), 0);

    await this.data.set(this.pluginName, 'stats:order_count', { value: orderCount });
    await this.data.set(this.pluginName, 'stats:revenue', { value: revenue.toFixed(2) });

    return { orderCount, revenue: revenue.toFixed(2) };
  }

  // ========== SQL Join Demo ==========

  @Get('orders-with-products')
  async getOrdersWithProducts() {
    const result = await this.data.queryRaw(`
      SELECT
        o.id AS order_id,
        o.quantity,
        o.total,
        o.customer_name,
        o.status,
        o.created_at,
        p.id AS product_id,
        p.sku,
        p.name AS product_name,
        p.category
      FROM plugin_test_hybrid_plugin_orders o
      JOIN plugin_test_hybrid_plugin_products p ON p.id = o.product_id
      ORDER BY o.created_at DESC
    `);
    return result;
  }

  // ========== Private helpers ==========

  private async updateOrderStats(orderTotal: number) {
    const countRow = await this.data.get(this.pluginName, 'stats:order_count');
    const currentCount = countRow?.data?.value ?? 0;
    await this.data.set(this.pluginName, 'stats:order_count', { value: currentCount + 1 });

    const revenueRow = await this.data.get(this.pluginName, 'stats:revenue');
    const currentRevenue = parseFloat(revenueRow?.data?.value ?? 0);
    await this.data.set(this.pluginName, 'stats:revenue', { value: (currentRevenue + orderTotal).toFixed(2) });
  }
}
