import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Shop } from './entities/shop.entity';
import { GetShopsDto, QueryShopOrderByColumn } from './dto/get-shops.dto';
import { paginate } from 'src/common/pagination/paginate';
import { GetStaffsDto } from './dto/get-staffs.dto';
import { ShopDocument } from './schemas/shop.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SortOrder } from 'src/common/dto/generic-conditions.dto';
import { getSearchQuery } from 'src/common/utils';
import { UserDocument, User } from 'src/users/schemas/user.schema';

@Injectable()
export class ShopsService {
  constructor(
    @InjectModel(Shop.name) private shopModel: Model<ShopDocument>,
    @InjectModel(User.name) private userModal: Model<UserDocument>,
  ) {}

  create(createShopDto: CreateShopDto) {
    return this.shopModel.create(createShopDto);
  }

  async getShops({
    page = 1,
    limit = 10,
    search = '',
    sortedBy = SortOrder.DESC,
    orderBy = QueryShopOrderByColumn.UPDATED_AT,
    searchJoin = '$or',
  }: GetShopsDto) {
    const skip = (page - 1) * limit;
    const query = getSearchQuery(search, searchJoin);
    console.log(JSON.stringify(query));

    const sort: any = {
      [orderBy]: sortedBy.toLowerCase() === 'desc' ? -1 : 1,
    };

    const [shops, totalCount] = await Promise.all([
      this.shopModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
      this.shopModel.countDocuments(query).exec(),
    ]);
    const url = `/shops?search=${search}&limit=${limit}`;

    return {
      data: shops,
      ...paginate(totalCount, page, limit, shops.length, url),
    };
  }

  async getStaffs({ shop_id, limit = 10, page = 1 }: GetStaffsDto) {
    const query = {shop_id: shop_id};
    const [staffMembers, totalCount] = await Promise.all([
      this.userModal.find(query).limit(limit).exec(),
      this.userModal.countDocuments(query).exec(),
    ]);
    
    const url = `/staffs?limit=${limit}`;

    return {
      data: staffMembers,
      ...paginate(totalCount, page, limit, staffMembers?.length, url),
    };
  }

  async getShop(slug: string) {
    return await this.shopModel.findOne({slug: slug}).exec();
  }

  update(id: number, updateShopDto: UpdateShopDto) {
    return this.shopModel
      .findByIdAndUpdate(id, updateShopDto, { new: true })
      .exec();
  }

  approve(id: number) {
    return `This action removes a #${id} shop`;
  }

  remove(id: string) {
    return this.shopModel.findByIdAndDelete(id).exec();
  }

  disapproveShop(id: number) {
    return this.shopModel
      .findByIdAndUpdate(id, {is_active: false}, { new: true })
      .exec();
  }

  approveShop(id: number) {
    return this.shopModel
    .findByIdAndUpdate(id, {is_active: true}, { new: true })
    .exec();
  }
}
