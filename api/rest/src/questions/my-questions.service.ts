import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { paginate } from 'src/common/pagination/paginate';
import { Question, QuestionDocument } from './schemas/question.schema';
import { GetQuestionDto } from './dto/get-questions.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { getSearchQuery } from 'src/common/utils';

@Injectable()
export class MyQuestionsService {
  constructor(@InjectModel(Question.name) private questionModel: Model<QuestionDocument>) {}

  async findMyQuestions({ limit = 8, page = 1, search, answer }: GetQuestionDto) {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (search) {
      query.$or = getSearchQuery(search, 'answer');
    }

    const results = await this.questionModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .exec();

    const totalCount = await this.questionModel.countDocuments(query).exec();
    const url = `/my-questions?with=user&orderBy=created_at&sortedBy=desc`;

    return {
      data: results,
      ...paginate(totalCount, page, limit, results.length, url),
    };
  }

  async findMyQuestion(id: number) {
    return this.questionModel.findOne({ id }).exec();
  }

  async create(createQuestionDto: CreateQuestionDto) {
    const newQuestion = new this.questionModel(createQuestionDto);
    return newQuestion.save();
  }

  async update(id: number, updateQuestionDto: UpdateQuestionDto) {
    return this.questionModel
      .findOneAndUpdate({ id }, updateQuestionDto, { new: true })
      .exec();
  }

  async delete(id: number) {
    return this.questionModel.findOneAndDelete({ id }).exec();
  }
}

