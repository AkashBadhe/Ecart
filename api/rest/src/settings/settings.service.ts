import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { Setting } from './entities/setting.entity';
import {
  Setting as SettingSchemaEntity,
  SettingDocument,
} from './schemas/setting.schema';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(SettingSchemaEntity.name)
    private readonly settingModel: Model<SettingDocument>,
  ) {}

  async create(createSettingDto: CreateSettingDto) {
    const lastSetting = await this.settingModel.findOne().sort({ id: -1 }).exec();
    const nextId = (lastSetting?.id ?? 0) + 1;
    return this.settingModel.create({ ...createSettingDto, id: nextId });
  }

  async findAll() {
    return this.settingModel.findOne().sort({ created_at: -1 }).exec();
  }

  async findOne(id: number) {
    return this.settingModel.findOne({ id }).exec();
  }

  async update(id: number, updateSettingDto: UpdateSettingDto) {
    return this.settingModel
      .findOneAndUpdate({ id }, updateSettingDto, { new: true })
      .exec();
  }

  async remove(id: number) {
    return this.settingModel.findOneAndDelete({ id }).exec();
  }
}
