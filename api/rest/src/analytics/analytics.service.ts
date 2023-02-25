import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Analytics, AnalyticsDocument } from './schemas/analytics.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Analytics.name)
    private analyticsModel: Model<AnalyticsDocument>,
  ) {}

  async create(createAnalyticsDto: any): Promise<Analytics> {
    const createdAnalytics = new this.analyticsModel(createAnalyticsDto);
    return createdAnalytics.save();
  }

  async findAll(): Promise<Analytics[]> {
    return this.analyticsModel.find().exec();
  }

  async findOne(id: string): Promise<Analytics> {
    return this.analyticsModel.findById(id).exec();
  }

  async update(id: string, updateAnalyticsDto: any): Promise<Analytics> {
    return this.analyticsModel
      .findByIdAndUpdate(id, updateAnalyticsDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Analytics> {
    return this.analyticsModel.findByIdAndRemove(id).exec();
  }
}
