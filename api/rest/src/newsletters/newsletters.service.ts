import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Newsletter } from './schemas/newsletter.schema';

@Injectable()
export class NewslettersService {
  constructor(
    @InjectModel(Newsletter.name) private newsletterModel: Model<Newsletter>,
  ) {}

  async create(createNewsletterDto: any): Promise<Newsletter> {
    const createdNewsletter = new this.newsletterModel(createNewsletterDto);
    return createdNewsletter.save();
  }

  async findAll(): Promise<Newsletter[]> {
    return this.newsletterModel.find().exec();
  }

  async findById(id: string): Promise<Newsletter> {
    return this.newsletterModel.findById(id).exec();
  }

  async update(id: string, updateNewsletterDto: any): Promise<Newsletter> {
    return this.newsletterModel.findByIdAndUpdate(id, updateNewsletterDto, { new: true }).exec();
  }

  async delete(id: string): Promise<Newsletter> {
    return this.newsletterModel.findByIdAndRemove(id).exec();
  }
}
