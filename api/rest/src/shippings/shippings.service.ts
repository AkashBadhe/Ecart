import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateShippingDto } from './dto/create-shipping.dto';
import { GetShippingsDto } from './dto/get-shippings.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';
import { Shipping } from './entities/shipping.entity';
import {
  Shipping as ShippingSchemaEntity,
  ShippingDocument,
} from './schemas/shipping.schema';

@Injectable()
export class ShippingsService {
  constructor(
    @InjectModel(ShippingSchemaEntity.name)
    private readonly shippingModel: Model<ShippingDocument>,
  ) {}

  async create(createShippingDto: CreateShippingDto) {
    const lastShipping = await this.shippingModel.findOne().sort({ id: -1 }).exec();
    const nextId = (lastShipping?.id ?? 0) + 1;
    return this.shippingModel.create({ ...createShippingDto, id: nextId });
  }

  async getShippings({}: GetShippingsDto) {
    return this.shippingModel.find().exec();
  }

  async findOne(id: number) {
    return this.shippingModel.findOne({ id: Number(id) }).exec();
  }

  async update(id: number, updateShippingDto: UpdateShippingDto) {
    return this.shippingModel
      .findOneAndUpdate({ id }, updateShippingDto, { new: true })
      .exec();
  }

  async remove(id: number) {
    return this.shippingModel.findOneAndDelete({ id }).exec();
  }
}
