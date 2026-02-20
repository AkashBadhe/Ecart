import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { paginate } from 'src/common/pagination/paginate';
import { Wishlist } from './entities/wishlist.entity';
import { GetWishlistDto } from './dto/get-wishlists.dto';
import { CreateWishlistDto } from './dto/create-wishlists.dto';
import { UpdateWishlistDto } from './dto/update-wishlists.dto';
import { getSearchQuery } from 'src/common/utils';
import {
  Wishlist as WishlistSchemaEntity,
  WishlistDocument,
} from './schemas/wishlist.schema';
import { Product, ProductDocument } from 'src/products/schemas/products.schema';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectModel(WishlistSchemaEntity.name)
    private readonly wishlistModel: Model<WishlistDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly authService: AuthService,
  ) {}

  async findAllWishlists({ limit = 30, page = 1, search }: GetWishlistDto) {
    if (!page) page = 1;
    if (!limit) limit = 30;
    const skip = (page - 1) * limit;
    const query = getSearchQuery(search);
    const [results, totalCount] = await Promise.all([
      this.wishlistModel.find(query).skip(skip).limit(limit).exec(),
      this.wishlistModel.countDocuments(query).exec(),
    ]);

    const url = `/wishlists?with=shop&orderBy=created_at&sortedBy=desc`;
    return {
      data: results,
      ...paginate(totalCount, page, limit, results.length, url),
    };
  }

  async findWishlist(id: number) {
    return this.wishlistModel.findOne({ id }).exec();
  }

  async create(createWishlistDto: CreateWishlistDto) {
    const me = await this.authService.me();
    const existing = await this.wishlistModel
      .findOne({ product_id: Number(createWishlistDto.product_id), user_id: me?.id })
      .exec();
    if (existing) {
      return existing;
    }

    const lastWishlist = await this.wishlistModel.findOne().sort({ id: -1 }).exec();
    const nextId = (lastWishlist?.id ?? 0) + 1;
    return this.wishlistModel.create({
      ...createWishlistDto,
      id: nextId,
      product_id: Number(createWishlistDto.product_id),
      user_id: me?.id,
    });
  }

  async update(id: number, updateWishlistDto: UpdateWishlistDto) {
    return this.wishlistModel
      .findOneAndUpdate({ id }, updateWishlistDto, { new: true })
      .exec();
  }

  async delete(id: number) {
    return this.wishlistModel.findOneAndDelete({ id }).exec();
  }

  async isInWishlist(product_id: number) {
    const me = await this.authService.me();
    const exists = await this.wishlistModel
      .findOne({ product_id: Number(product_id), user_id: me?.id })
      .exec();
    return !!exists;
  }

  async toggle({ product_id }: CreateWishlistDto) {
    const me = await this.authService.me();
    const pid = Number(product_id);
    const existing = await this.wishlistModel
      .findOne({ product_id: pid, user_id: me?.id })
      .exec();

    if (existing) {
      await this.wishlistModel.deleteOne({ _id: existing._id }).exec();
      await this.productModel.findOneAndUpdate({ id: pid }, { in_wishlist: false }).exec();
      return false;
    }

    const lastWishlist = await this.wishlistModel.findOne().sort({ id: -1 }).exec();
    const nextId = (lastWishlist?.id ?? 0) + 1;
    await this.wishlistModel.create({ id: nextId, product_id: pid, user_id: me?.id });
    await this.productModel.findOneAndUpdate({ id: pid }, { in_wishlist: true }).exec();
    return true;
  }
}
