import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { GetCategoriesDto, QueryCategoriesOrderByColumn } from './dto/get-categories.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { paginate } from 'src/common/pagination/paginate';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { getSearchQuery } from 'src/common/utils';
import { SortOrder } from 'src/common/dto/generic-conditions.dto';
import { Product, ProductDocument } from '../products/schemas/products.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(category: CreateCategoryDto): Promise<Category> {
    const createdCategory = new this.categoryModel(category);
    return createdCategory.save();
  }

  async getCategories({
    limit,
    page,
    parent,
    search = '',
    orderBy = QueryCategoriesOrderByColumn.UPDATED_AT,
    sortedBy = SortOrder.DESC,
    searchJoin = '$or'
  }: GetCategoriesDto, tenantShopId?: number) {
    const skip = (page - 1) * limit;
    const query = getSearchQuery(search, searchJoin);

    // Tenant scoping: find category IDs that appear in this shop's products
    if (tenantShopId !== undefined) {
      const categoryIds = await this.productModel.distinct('categories.id', {
        shop_id: tenantShopId,
      }).exec();
      // Also try 'categories.slug' in case IDs are slugs
      const categorySlugs = await this.productModel.distinct('categories.slug', {
        shop_id: tenantShopId,
      }).exec();
      query['$or'] = [
        ...(query['$or'] || []),
        { id: { $in: categoryIds } },
        { slug: { $in: categorySlugs } },
      ];
    }

    const sort: any = {
      [orderBy]: sortedBy.toLowerCase() === 'desc' ? -1 : 1,
    };

    const [categories, totalCount] = await Promise.all([
      this.categoryModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
      this.categoryModel.countDocuments(query).exec(),
    ]);

    const url = `/categories?search=${search}&limit=${limit}&parent=${parent}`;
    return {
      ...paginate(totalCount, page, limit, categories.length, url),
      data: categories,
    };
  }

  async getCategory(param: string, language: string) {
    return this.categoryModel.find({ slug: param, _id: param }).exec();
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return this.categoryModel.findOneAndUpdate({ id: Number(id) }, updateCategoryDto, { new: true }).exec();
  }

  remove(id: number) {
    return this.categoryModel.findOneAndDelete({ id: Number(id) }).exec();
  }
}
