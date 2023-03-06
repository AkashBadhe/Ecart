import { Injectable } from '@nestjs/common';
import { GetTopManufacturersDto } from './dto/get-top-manufacturers.dto';
import {
  GetManufacturersDto,
  ManufacturerPaginator,
  QueryManufacturersOrderByColumn,
} from './dto/get-manufactures.dto';
import { paginate } from '../common/pagination/paginate';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';
import {
  ManufacturerDocument,
  Manufacturer,
} from './schemas/manufacturer.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { getSearchQuery } from 'src/common/utils';
import { SortOrder } from 'src/common/dto/generic-conditions.dto';
@Injectable()
export class ManufacturersService {
  constructor(
    @InjectModel(Manufacturer.name)
    private manufacturerModel: Model<ManufacturerDocument>,
  ) {}

  async create(createManufactureDto: CreateManufacturerDto) {
    return await this.manufacturerModel.create(createManufactureDto);
  }

  async getManufactures({
    page = 1,
    limit = 10,
    search = '',
    orderBy = QueryManufacturersOrderByColumn.UPDATED_AT,
    sortedBy = SortOrder.DESC,
  }: GetManufacturersDto): Promise<ManufacturerPaginator> {
    const skip = (page - 1) * limit;
    const query = getSearchQuery(search);

    const sort: any = {
      [orderBy]: sortedBy.toLowerCase() === 'desc' ? -1 : 1,
    };

    const [authors, totalCount] = await Promise.all([
      this.manufacturerModel
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.manufacturerModel.countDocuments(query).exec(),
    ]);

    const url = `/manufacturers?search=${search}&limit=${limit}`;
    return {
      ...paginate(totalCount, page, limit, authors.length, url),
      data: authors,
    };
  }

  async getTopManufactures({
    limit = 10,
  }: GetTopManufacturersDto): Promise<Manufacturer[]> {
    return this.manufacturerModel.find().limit(limit).exec();
  }

  async getManufacturesBySlug(slug: string): Promise<Manufacturer> {
    return this.manufacturerModel.findOne({ slug: slug }).exec();
  }

  update(id: string, updateManufacturesDto: UpdateManufacturerDto) {
    return this.manufacturerModel
      .findByIdAndUpdate(id, updateManufacturesDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<any> {
    return this.manufacturerModel.findByIdAndDelete(id).exec();
  }
}
