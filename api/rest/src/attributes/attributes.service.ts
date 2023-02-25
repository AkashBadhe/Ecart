import { InjectModel } from '@nestjs/mongoose';
import { Attribute, AttributeDocument } from './schemas/attribute.schema';
import { Injectable } from '@nestjs/common';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { Model } from 'mongoose';

@Injectable()
export class AttributesService {
  constructor(
    @InjectModel(Attribute.name) private attributeModel: Model<AttributeDocument>
  ) {}

  async create(attribute: CreateAttributeDto): Promise<Attribute> {
    const createdAttribute = new this.attributeModel(attribute);
    return createdAttribute.save();
  }
  findAll() {
    return this.attributeModel.find().exec();
  }

  async findOne(param: string) {
    return this.attributeModel.find({ slug: param, _id: param }).exec();

  }

  update(id: number, updateAttributeDto: UpdateAttributeDto) {
    return this.attributeModel.findByIdAndUpdate(id, updateAttributeDto, { new: true }).exec();
  }


  remove(id: number) {
    return this.attributeModel.findByIdAndDelete(id).exec();
  }
}
