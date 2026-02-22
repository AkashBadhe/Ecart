import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsDto, ProductPaginator } from './dto/get-products.dto';
import { Product } from './entities/product.entity';
import { GetPopularProductsDto } from './dto/get-popular-products.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  async getProducts(
    @Query() query: GetProductsDto,
    @Req() req: Request,
  ): Promise<ProductPaginator> {
    const tenantShopId = (req as any).tenantShopId as number | undefined;
    return this.productsService.getProducts(query, tenantShopId);
  }

  @Get(':slug')
  async getProductBySlug(@Param('slug') slug: string) {
    return this.productsService.getProductBySlug(slug);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}

@Controller('popular-products')
export class PopularProductsController {
  constructor(private readonly productsService: ProductsService) {}
  @Get()
  async getProducts(
    @Query() query: GetPopularProductsDto,
    @Req() req: Request,
  ): Promise<Product[]> {
    const tenantShopId = (req as any).tenantShopId as number | undefined;
    return this.productsService.getPopularProducts(query, tenantShopId);
  }
}
