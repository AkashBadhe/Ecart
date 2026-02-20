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
    const lastTag = await this.tagModel.findOne().sort({ id: -1 }).exec();
    const nextId = (lastTag?.id ?? 0) + 1;
    return this.tagModel.create({ ...createTagDto, id: nextId });
  }

  async findAll({ page = 1, limit = 15, search, sortedBy = SortOrder.DESC }: GetTagsDto) {
    if (!page) page = 1;
    const skip = (page - 1) * limit;
    const query = getSearchQuery(search, 'and');
    const sort = { created_at: sortedBy?.toLowerCase() === 'asc' ? 1 : -1 };

    const [data, totalCount] = await Promise.all([
      this.tagModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
      this.tagModel.countDocuments(query).exec(),
    ]);

    const url = `/tags?limit=${limit}`;
    return {
      data,
      ...paginate(totalCount, page, limit, data.length, url),
    };
  }

  async findOne(param: string, language: string) {
    return this.tagModel
      .findOne({
        $or: [{ id: Number(param) || -1 }, { slug: param }],
      })
      .exec();
  }

  async update(id: number, updateTagDto: UpdateTagDto) {
    return this.tagModel.findOneAndUpdate({ id }, updateTagDto, { new: true }).exec();
  }

  async remove(id: number) {
    return this.tagModel.findOneAndDelete({ id }).exec();
  }
}
