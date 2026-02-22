import { Injectable } from '@nestjs/common';
import { FilterQuery, Model, Types } from 'mongoose';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Shop } from './entities/shop.entity';
import {
  GetShopsDto,
  QueryShopOrderByColumn,
  ShopPaginator,
} from './dto/get-shops.dto';
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

  private buildShopIdQuery(id: string | number): FilterQuery<ShopDocument> {
    const conditions: Record<string, unknown>[] = [];
    const normalized = String(id);
    const numericId = Number(normalized);

    if (!Number.isNaN(numericId)) {
      conditions.push({ id: numericId });
    }
    if (Types.ObjectId.isValid(normalized)) {
      conditions.push({ _id: normalized });
    }

    if (!conditions.length) {
      conditions.push({ id: normalized });
    }

    return { $or: conditions };
  }

  private decodeEmailFromAuthHeader(authHeader?: string): string | undefined {
    if (!authHeader) return undefined;
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : authHeader.trim();

    if (!token || token === 'jwt token') return undefined;

    try {
      const decoded = Buffer.from(token, 'base64').toString('utf8');
      return decoded.includes('@') ? decoded : undefined;
    } catch {
      return undefined;
    }
  }

  async create(createShopDto: CreateShopDto, authHeader?: string) {
    const lastShop = await this.shopModel.findOne().sort({ id: -1 }).exec();
    const nextId = (lastShop?.id ?? 0) + 1;

    const emailFromToken = this.decodeEmailFromAuthHeader(authHeader);
    const currentUser = emailFromToken
      ? await this.userModal.findOne({ email: emailFromToken }).exec()
      : await this.userModal.findOne().sort({ _id: -1 }).exec();

    const baseSlug = this.generateSlug(createShopDto.slug || createShopDto.name);
    let uniqueSlug = await this.generateUniqueSlug(baseSlug);

    const userObject = currentUser
      ? typeof currentUser.toObject === 'function'
        ? currentUser.toObject()
        : (currentUser as unknown as Record<string, unknown>)
      : null;

    const ownerPayload = userObject
      ? {
          id: userObject.id,
          name: userObject.name,
          email: userObject.email,
          profile: userObject.profile,
        }
      : undefined;

    try {
      const createdShop = await this.shopModel.create({
        ...createShopDto,
        id: nextId,
        slug: uniqueSlug,
        ...(ownerPayload && { owner: ownerPayload }),
      });

      if (currentUser?._id) {
        const shopObject =
          typeof createdShop.toObject === 'function'
            ? createdShop.toObject()
            : (createdShop as unknown as Record<string, unknown>);

        await this.userModal.updateOne(
          { _id: currentUser._id },
          {
            $set: {
              managed_shop: shopObject,
              shop_id: nextId,
            },
            $addToSet: {
              shops: shopObject,
            },
          },
        );
      }

      return createdShop;
    } catch (error: any) {
      if (error?.code === 11000 && error?.keyPattern?.slug) {
        uniqueSlug = await this.generateUniqueSlug(baseSlug);
        return this.shopModel.create({
          ...createShopDto,
          id: nextId,
          slug: uniqueSlug,
          ...(ownerPayload && { owner: ownerPayload }),
        });
      }
      throw error;
    }
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async generateUniqueSlug(baseSlug: string): Promise<string> {
    const normalizedBaseSlug = baseSlug || 'shop';
    let candidateSlug = normalizedBaseSlug;
    let suffix = 2;

    while (await this.shopModel.exists({ slug: candidateSlug })) {
      candidateSlug = `${normalizedBaseSlug}-${suffix}`;
      suffix += 1;
    }

    return candidateSlug;
  }

  async getShops({
    page = 1,
    limit = 10,
    search = '',
    sortedBy = SortOrder.DESC,
    orderBy = QueryShopOrderByColumn.UPDATED_AT,
    searchJoin = '$or',
  }: GetShopsDto): Promise<ShopPaginator> {
    const skip = (page - 1) * limit;
    const query = getSearchQuery(search, searchJoin);
    console.log(JSON.stringify(query));

    const sort: any = {
      [orderBy]: sortedBy.toLowerCase() === 'desc' ? -1 : 1,
    };

    const [shopDocuments, totalCount] = await Promise.all([
      this.shopModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
      this.shopModel.countDocuments(query).exec(),
    ]);

    const shops: Shop[] = shopDocuments.map((shopDocument) => {
      const shopRecord =
        (typeof shopDocument.toObject === 'function'
          ? shopDocument.toObject()
          : shopDocument) as unknown as Record<string, unknown>;

      const name =
        typeof shopRecord.name === 'string' ? (shopRecord.name as string) : '';
      const slug =
        typeof shopRecord.slug === 'string' && (shopRecord.slug as string).length > 0
          ? (shopRecord.slug as string)
          : this.generateSlug(name);

      return {
        ...(shopRecord as unknown as Shop),
        slug,
      };
    });

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
      .findOneAndUpdate(this.buildShopIdQuery(id), updateShopDto, { new: true })
      .exec();
  }

  approve(id: number) {
    return `This action removes a #${id} shop`;
  }

  remove(id: string) {
    return this.shopModel.findOneAndDelete(this.buildShopIdQuery(id)).exec();
  }

  disapproveShop(id: number) {
    return this.shopModel
      .findOneAndUpdate(this.buildShopIdQuery(id), {is_active: false}, { new: true })
      .exec();
  }

  approveShop(id: number) {
    return this.shopModel
    .findOneAndUpdate(this.buildShopIdQuery(id), {is_active: true}, { new: true })
    .exec();
  }
}
