import { Injectable } from '@nestjs/common';
import { CreateFeedBackDto } from './dto/create-feedback.dto';
import { UpdateFeedBackDto } from './dto/update-feedback.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Feedback, FeedbackDocument } from './schemas/feedback.schema';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name) private readonly feedbackModel: Model<FeedbackDocument>,
  ) {}

  async create(createFeedBackDto: CreateFeedBackDto): Promise<Feedback> {
    const createdFeedback = new this.feedbackModel(createFeedBackDto);
    return createdFeedback.save();
  }

  async findAll(): Promise<Feedback[]> {
    return this.feedbackModel.find().exec();
  }

  async findById(id: string): Promise<Feedback> {
    return this.feedbackModel.findById(id).exec();
  }

  async update(id: string, updateFeedBackDto: UpdateFeedBackDto): Promise<Feedback> {
    return this.feedbackModel.findByIdAndUpdate(id, updateFeedBackDto, { new: true }).exec();
  }

  async delete(id: string): Promise<Feedback> {
    return this.feedbackModel.findByIdAndDelete(id).exec();
  }
}
