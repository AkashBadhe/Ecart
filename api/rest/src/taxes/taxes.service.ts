import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { Tax } from './entities/tax.entity';
import { Tax as TaxSchemaEntity, TaxDocument } from './schemas/tax.schema';

@Injectable()
export class TaxesService {
  constructor(
    @InjectModel(TaxSchemaEntity.name)
    private readonly taxModel: Model<TaxDocument>,
  ) {}

  async create(createTaxDto: CreateTaxDto) {
    const lastTax = await this.taxModel.findOne().sort({ id: -1 }).exec();
    const nextId = (lastTax?.id ?? 0) + 1;
    return this.taxModel.create({ ...createTaxDto, id: nextId });
  }

  async findAll() {
    return this.taxModel.find().exec();
  }

  async findOne(id: number) {
    return this.taxModel.findOne({ id: Number(id) }).exec();
  }

  async update(id: number, updateTaxDto: UpdateTaxDto) {
    return this.taxModel.findOneAndUpdate({ id }, updateTaxDto, { new: true }).exec();
  }

  async remove(id: number) {
    return this.taxModel.findOneAndDelete({ id }).exec();
  }
}
