import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument } from 'mongoose';
import { AddressType } from '../entities/address.entity';
import { IsNotEmpty  } from 'class-validator';

export type AddressDocument = HydratedDocument<Address>;

export class UserAddress {
  @Prop()
  street_address: string;

  @IsNotEmpty()
  @Prop({ required: true})
  country: string;

  @Prop()
  city: string;

  @Prop()
  state: string;

  @Prop()
  zip: string;
}

@Schema()
export class Address extends Document {
  @IsNotEmpty()
  @Prop({isRequired: true})
  title: string;

  @Prop()
  default: boolean;

  @Prop({ type: UserAddress })
  address: UserAddress;
  
  @Prop({ enum: AddressType })
  type: AddressType;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  customer: string;
}

export const AddressSchema = SchemaFactory.createForClass(Address);