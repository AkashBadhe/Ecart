import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductsDto, QueryProductsOrderByColumn } from './dto/get-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { paginate } from 'src/common/pagination/paginate';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/products.schema';
import { GetPopularProductsDto } from './dto/get-popular-products.dto';
import { getSearchQuery } from 'src/common/utils';
import { SortOrder } from 'src/common/dto/generic-conditions.dto';

const options = {
  keys: [
    'name',
    'type.slug',
    'categories.slug',
    'status',
    'shop_id',
    'author.slug',
    'tags',
    'manufacturer.slug',
  ],
  threshold: 0.3,
};
@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const createdProduct = await this.productModel.create(createProductDto);
    return createdProduct;
  }

  async getProducts({
    page = 1,
    limit = 10,
    search = '',
    sortedBy = SortOrder.DESC,
    orderBy = QueryProductsOrderByColumn.UPDATED_AT,
    searchJoin = '$or'
  }: GetProductsDto) {
    const skip = (page - 1) * limit;
    const query = getSearchQuery(search, searchJoin);
    console.log(JSON.stringify(query));

    const sort: any = {
      [orderBy]: sortedBy.toLowerCase() === 'desc' ? -1 : 1,
    };

    const [products, totalCount] = await Promise.all([
      this.productModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
      this.productModel.countDocuments(query).exec(),
    ]);

    const url = `/products?search=${search}&limit=${limit}`;
    return {
      data: products,
      ...paginate(totalCount, page, limit, products.length, url),
    };
  }

  async getProductById(id: string) {
    return await this.productModel.findById(id).exec();
  }

  async getProductBySlug(identifier: string) {
    let product;
    if (Types.ObjectId.isValid(identifier)) {
      product = await this.productModel.findById(identifier).exec();
    } else {
      product = await this.productModel.findOne({ slug: identifier }).exec();
    }
    let related_products = [];
    if (product?.type?.slug) {
      related_products = await this.productModel
        .find({ 'type.slug': product?.type?.slug })
        .limit(20)
        .exec();
    }

    product.related_products = related_products;
    return product;
  }

  async getPopularProducts({ limit, type_slug }: GetPopularProductsDto) {
    return await this.productModel
      .find({ type_slug: type_slug })
      .limit(limit)
      .exec();
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .exec();
  }

  remove(id: string) {
    return this.productModel.findByIdAndDelete(id).exec();
  }
}
