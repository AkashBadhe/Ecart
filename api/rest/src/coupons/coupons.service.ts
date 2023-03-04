import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import couponsJson from '@db/coupons.json';
import Fuse from 'fuse.js';
import {
  GetCouponsDto,
  QueryCouponsOrderByColumn,
} from './dto/get-coupons.dto';
import { paginate } from 'src/common/pagination/paginate';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon, CouponDocument } from './schemas/coupon.schema';
import { getSearchQuery } from 'src/common/utils';

const coupons = plainToClass(Coupon, couponsJson);
const options = {
  keys: ['code'],
  threshold: 0.3,
};
const fuse = new Fuse(coupons, options);

@Injectable()
export class CouponsService {
  constructor(
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
  ) {}

  async create(createCouponDto: CreateCouponDto): Promise<Coupon> {
    const createdCoupon = new this.couponModel(createCouponDto);
    return createdCoupon.save();
  }

  async getCoupons({
    search,
    limit,
    page,
    orderBy = QueryCouponsOrderByColumn.UPDATED_AT,
    orderByDirection = 'DESC',
  }: GetCouponsDto) {
    const skip = (page - 1) * limit;
    const query = getSearchQuery(search);

    const sort: any = {
      [orderBy]: orderByDirection.toLowerCase() === 'desc' ? -1 : 1,
    };

    const [authors, totalCount] = await Promise.all([
      this.couponModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
      this.couponModel.countDocuments(query).exec(),
    ]);

    const url = `/authors?search=${search}&limit=${limit}`;
    return {
      ...paginate(totalCount, page, limit, authors.length, url),
      data: authors,
    };
  }

  async getCoupon(code: string, language: string): Promise<Coupon> {
    return this.couponModel.findOne({ code: code }).exec();
  }

  async update(id: number, updateCouponDto: UpdateCouponDto) {
    return this.couponModel
      .findByIdAndUpdate(id, updateCouponDto, { new: true })
      .exec();
  }

  async remove(id: number) {
    return this.couponModel.findByIdAndDelete(id).exec();
  }

  async verifyCoupon(code: string) {
    const coupon = await this.getCoupon(code, undefined);
    return {
      is_valid: coupon.is_valid,
      coupon: coupon,
    };
  }
}
