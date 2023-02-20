import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address, AddressDocument } from './schemas/address.schema';
import { Model } from 'mongoose';
@Injectable()
export class AddressesService {
  constructor(
    @InjectModel(Address.name) private readonly addressModel: Model<AddressDocument>,
  ) {}

  
  async create(createAddressDto: CreateAddressDto): Promise<Address> {
    const createAddress = await this.addressModel.create(createAddressDto);
    return createAddress;
  }

  async findAll() {
    return this.addressModel.find().exec(); 
  }

  async findOne(id: string) {
    return this.addressModel.findOne({_id: id}).exec();
  }

  async update(id: string, updateAddressDto: any): Promise<Address> {
    return this.addressModel.findByIdAndUpdate(id, updateAddressDto, { new: true }).exec();
  }

  async remove(id: string): Promise<Address> {
    return this.addressModel.findByIdAndRemove(id).exec();
  }
}
