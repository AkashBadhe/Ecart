import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { paginate } from 'src/common/pagination/paginate';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { GetReviewsDto, ReviewPaginator } from './dto/get-reviews.dto';
import { Review } from './entities/review.entity';
import {
  Review as ReviewSchemaEntity,
  ReviewDocument,
} from './schemas/review.schema';
import { getSearchQuery } from 'src/common/utils';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(ReviewSchemaEntity.name)
    private readonly reviewModel: Model<ReviewDocument>,
  ) {}

  async findAllReviews({ limit = 30, page = 1, search, product_id }: GetReviewsDto) {
    if (!page) page = 1;
    if (!limit) limit = 30;
    const skip = (page - 1) * limit;
    const query = getSearchQuery(search);

    if (product_id) {
      query['product_id'] = Number(product_id);
    }

    const [results, totalCount] = await Promise.all([
      this.reviewModel.find(query).skip(skip).limit(limit).exec(),
      this.reviewModel.countDocuments(query).exec(),
    ]);

    const url = `/reviews?search=${search}&limit=${limit}`;
    return {
      data: results,
      ...paginate(totalCount, page, limit, results.length, url),
    };
  }

  async findReview(id: number) {
    return this.reviewModel.findOne({ id }).exec();
  }

  async create(createReviewDto: CreateReviewDto) {
    const lastReview = await this.reviewModel.findOne().sort({ id: -1 }).exec();
    const nextId = (lastReview?.id ?? 0) + 1;
    return this.reviewModel.create({ ...createReviewDto, id: nextId });
  }

  async update(id: number, updateReviewDto: UpdateReviewDto) {
    return this.reviewModel
      .findOneAndUpdate({ id }, updateReviewDto, { new: true })
      .exec();
  }

  async delete(id: number) {
    return this.reviewModel.findOneAndDelete({ id }).exec();
  }
}
