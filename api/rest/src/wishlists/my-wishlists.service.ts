import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { paginate } from 'src/common/pagination/paginate';
import { Wishlist } from './entities/wishlist.entity';
import { GetWishlistDto } from './dto/get-wishlists.dto';
import { CreateWishlistDto } from './dto/create-wishlists.dto';
import { UpdateWishlistDto } from './dto/update-wishlists.dto';
import { Product, ProductDocument } from 'src/products/schemas/products.schema';
import {
  Wishlist as WishlistSchemaEntity,
  WishlistDocument,
} from './schemas/wishlist.schema';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class MyWishlistService {
  constructor(
    @InjectModel(WishlistSchemaEntity.name)
    private readonly wishlistModel: Model<WishlistDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly authService: AuthService,
  ) {}

  async findAMyWishlists({ limit = 30, page = 1 }: GetWishlistDto) {
    if (!page) page = 1;
    if (!limit) limit = 30;
    const skip = (page - 1) * limit;
    const me = await this.authService.me();
    const wishlists = await this.wishlistModel
      .find({ user_id: me?.id })
      .skip(skip)
      .limit(limit)
      .exec();
    const productIds = wishlists.map((wishlist) => wishlist.product_id);
    const results = await this.productModel.find({ id: { $in: productIds } }).exec();
    const totalCount = await this.wishlistModel.countDocuments({ user_id: me?.id }).exec();

    const url = `/my-wishlists?with=shop&orderBy=created_at&sortedBy=desc`;
    return {
      data: results,
      ...paginate(totalCount, page, limit, results.length, url),
    };
  }

  async findAMyWishlist(id: number) {
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
}
