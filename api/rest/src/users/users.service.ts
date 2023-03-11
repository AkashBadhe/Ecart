import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import {
  GetUsersDto,
  UserPaginator,
  QueryUsersOrderByColumn,
} from './dto/get-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { paginate } from 'src/common/pagination/paginate';
import { User, UserDocument } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SortOrder } from 'src/common/dto/generic-conditions.dto';
import { getSearchQuery } from 'src/common/utils';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  create(createUserDto: CreateUserDto) {
    return this.userModel.create(createUserDto);
  }

  async getUsers({
    page = 1,
    limit = 10,
    search = '',
    sortedBy = SortOrder.DESC,
    orderBy = QueryUsersOrderByColumn.NAME,
    searchJoin = '$or',
  }: GetUsersDto): Promise<UserPaginator> {
    const skip = (page - 1) * limit;
    const query = getSearchQuery(search, searchJoin);
    console.log(JSON.stringify(query));

    const sort: any = {
      [orderBy]: sortedBy.toLowerCase() === 'desc' ? -1 : 1,
    };

    const [users, totalCount] = await Promise.all([
      this.userModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
      this.userModel.countDocuments(query).exec(),
    ]);

    const url = `/users?limit=${limit}`;

    return {
      data: users,
      ...paginate(totalCount, page, limit, users.length, url),
    };
  }

  async findOne(id: string) {
    return this.userModel.findById(id).exec();
  }
  
  async getByShopId(id: string) {
    return this.userModel.find({shop_id: id}).exec();
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
  }

  remove(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async makeAdmin(user_id: string) {
    return this.userModel
      .findByIdAndUpdate(user_id, { is_admin: true }, { new: true })
      .exec();
  }

  banUser(id: number) {
    return this.userModel
      .findByIdAndUpdate(id, { is_active: false }, { new: true })
      .exec();
  }

  activeUser(id: number) {
    return this.userModel
    .findByIdAndUpdate(id, { is_active: true }, { new: true })
    .exec();
  }
}
