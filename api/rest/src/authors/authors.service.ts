import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { GetAuthorDto, QueryAuthorsOrderByColumn } from './dto/get-author.dto';
import { paginate } from '../common/pagination/paginate';
import { GetTopAuthorsDto } from './dto/get-top-authors.dto';
import { CreateAuthorDto } from './dto/create-author.dto';
import { Model } from 'mongoose';
import { Author, AuthorDocument } from './schemas/authors.schemas';
import { SortOrder } from 'src/common/dto/generic-conditions.dto';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectModel(Author.name) private readonly authorModel: Model<AuthorDocument>,
  ) {}

  async create(createAuthorDto: CreateAuthorDto) {
    const createAddress = await this.authorModel.create(createAuthorDto);
    return createAddress;
  }

  async getAuthors({
    page = 1,
    limit = 10,
    search = '',
    orderBy = QueryAuthorsOrderByColumn.CREATED_AT,
    orderByDirection = SortOrder.DESC,
  }: GetAuthorDto) {
    const skip = (page - 1) * limit;
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { bio: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const sort: any = {
      [orderBy]: orderByDirection.toLowerCase() === 'desc' ? -1 : 1,
    };

    const [authors, totalCount] = await Promise.all([
      this.authorModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
      this.authorModel.countDocuments(query).exec(),
    ]);

    const url = `/authors?search=${search}&limit=${limit}`;
    return {
      ...paginate(totalCount, page, limit, authors.length, url),
      data: authors,
    };
  }

  async getAuthorBySlug(slug: string): Promise<Author> {
    return this.authorModel.findOne({ slug: slug }).exec();
  }

  async getTopAuthors({ limit = 10 }: GetTopAuthorsDto): Promise<Author[]> {
    return this.authorModel.find().limit(limit).exec();
  }

  async update(id: string, updateAuthorDto: UpdateAuthorDto): Promise<Author> {
    return this.authorModel
      .findByIdAndUpdate(id, updateAuthorDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<any> {
    return this.authorModel.findByIdAndDelete(id).exec();
  }
}
