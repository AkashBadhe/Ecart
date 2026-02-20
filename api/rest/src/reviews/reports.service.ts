import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Report, ReportDocument } from './schemas/report.schema';

@Injectable()
export class AbusiveReportService {
  constructor(
    @InjectModel(Report.name)
    private readonly reportModel: Model<ReportDocument>,
  ) {}

  async findAllReports() {
    return this.reportModel.find().exec();
  }

  async findReport(id: number) {
    return this.reportModel.findOne({ id }).exec();
  }

  async create(createReportDto: CreateReportDto) {
    const lastReport = await this.reportModel.findOne().sort({ id: -1 }).exec();
    const nextId = (lastReport?.id ?? 0) + 1;
    return this.reportModel.create({ ...createReportDto, id: nextId });
  }

  async update(id: number, updateReportDto: UpdateReportDto) {
    return this.reportModel
      .findOneAndUpdate({ id }, updateReportDto, { new: true })
      .exec();
  }

  async delete(id: number) {
    return this.reportModel.findOneAndDelete({ id }).exec();
  }
}
