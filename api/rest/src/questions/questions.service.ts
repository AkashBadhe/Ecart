import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { paginate } from 'src/common/pagination/paginate';
import { GetQuestionDto } from './dto/get-questions.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import questionsJSON from '@db/questions.json';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from './schemas/questions.schema';
import { getSearchQuery } from 'src/common/utils';

const questions = plainToClass(Question, questionsJSON);
const options = {
  keys: [],
  threshold: 0.3,
};
const fuse = new Fuse(questions, options);

@Injectable()
export class QuestionService {
  constructor(
    @InjectModel(Question.name)
    private readonly questionModel: Model<QuestionDocument>,
  ) {}

  async findAllQuestions({
    limit,
    page,
    search,
    answer,
    product_id,
    orderBy,
    sortedBy,
  }: GetQuestionDto) {
    const skip = (page - 1) * limit;
    const query = getSearchQuery(search);

    const sort: any = {
      [orderBy]: sortedBy.toLowerCase() === 'desc' ? -1 : 1,
    };

    const [questions, totalCount] = await Promise.all([
      this.questionModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
      this.questionModel.countDocuments(query).exec(),
    ]);

    const url = `/questions?search=${search}&answer=${answer}&limit=${limit}`;
    return {
      data: questions,
      ...paginate(totalCount, page, limit, questions.length, url),
    };
  }

  async findQuestion(id: string) {
    return this.questionModel.findById(id);
  }

  async create(createQuestionDto: CreateQuestionDto) {
    return this.questionModel.create(createQuestionDto);
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto) {
    return this.questionModel
      .findByIdAndUpdate(id, updateQuestionDto, { new: true })
      .exec();
  }

  delete(id: string) {
    return this.questionModel.findByIdAndDelete(id).exec();
  }
}
