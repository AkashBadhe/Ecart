import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTypeDto } from './dto/create-type.dto';
import { UpdateTypeDto } from './dto/update-type.dto';
import { Type } from './entities/type.entity';
import { GetTypesDto } from './dto/get-types.dto';
import { getSearchQuery } from 'src/common/utils';
import { Type as TypeSchemaEntity, TypeDocument } from './schemas/type.schema';

@Injectable()
export class TypesService {
  constructor(
    @InjectModel(TypeSchemaEntity.name)
    private readonly typeModel: Model<TypeDocument>,
  ) {}

  async getTypes({ text, search }: GetTypesDto) {
    const query = getSearchQuery(search, 'and');
    if (text?.replace(/%/g, '')) {
      query['name'] = { $regex: text.replace(/%/g, ''), $options: 'i' };
    }
    return this.typeModel.find(query).exec();
  }

  async getTypeBySlug(slug: string): Promise<Type> {
    const result = await this.typeModel.findOne({ slug }).lean().exec();
    return (result as unknown as Type);
  }

  async create(createTypeDto: CreateTypeDto) {
    const lastType = await this.typeModel.findOne().sort({ id: -1 }).exec();
    const nextId = (lastType?.id ?? 0) + 1;
    return this.typeModel.create({ ...createTypeDto, id: nextId });
  }

  async findAll() {
    return this.typeModel.find().exec();
  }

  async findOne(id: number) {
    return this.typeModel.findOne({ id }).exec();
  }

  async update(id: number, updateTypeDto: UpdateTypeDto) {
    return this.typeModel.findOneAndUpdate({ id }, updateTypeDto, { new: true }).exec();
  }

  async remove(id: number) {
    return this.typeModel.findOneAndDelete({ id }).exec();
  }
}
