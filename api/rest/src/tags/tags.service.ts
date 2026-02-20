import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { paginate } from 'src/common/pagination/paginate';
import { SortOrder } from 'src/common/dto/generic-conditions.dto';
import { getSearchQuery } from 'src/common/utils';
import { CreateTagDto } from './dto/create-tag.dto';
import { GetTagsDto } from './dto/get-tags.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag } from './entities/tag.entity';
import { Model } from 'mongoose';
import { TagDocument, Tag as TagSchemaEntity } from './schemas/tag.schema';

@Injectable()
export class TagsService {
  constructor(
    @InjectModel(TagSchemaEntity.name)
    private readonly tagModel: Model<TagDocument>,
  ) {}

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const lastTag = await this.tagModel.findOne().sort({ id: -1 }).lean().exec();
    const nextId = (lastTag?.id ?? 0) + 1;
    const result = await this.tagModel.create({ ...createTagDto, id: nextId });
    return (result as unknown as Tag);
  }

  async findAll({ page = 1, limit = 15, search, sortedBy = SortOrder.DESC }: GetTagsDto) {
    if (!page) page = 1;
    const skip = (page - 1) * limit;
    const query = getSearchQuery(search, 'and');
    const sortValue = sortedBy === SortOrder.ASC ? 1 : -1;
    const sort: any = { created_at: sortValue };

    const [data, totalCount] = await Promise.all([
      this.tagModel.find(query).sort(sort).skip(skip).limit(limit).lean().exec(),
      this.tagModel.countDocuments(query).exec(),
    ]);

    const url = `/tags?limit=${limit}`;
    return {
      data: data as any,
      ...paginate(totalCount, page, limit, data.length, url),
    };
  }

  async findOne(param: string, language: string) {
    const result = await this.tagModel
      .findOne({
        $or: [{ id: Number(param) || -1 }, { slug: param }],
      })
      .lean()
      .exec();
    return (result as unknown as Tag);
  }

  async update(id: number, updateTagDto: UpdateTagDto) {
    const result = await this.tagModel
      .findOneAndUpdate({ id }, updateTagDto, { new: true })
      .lean()
      .exec();
    return (result as unknown as Tag);
  }

  async remove(id: number) {
    const result = await this.tagModel.findOneAndDelete({ id }).lean().exec();
    return (result as unknown as Tag);
  }
}
