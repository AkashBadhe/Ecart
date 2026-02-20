import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ShippingDocument = HydratedDocument<Shipping>;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  strict: false,
})
export class Shipping {
  @Prop({ index: true, unique: true, sparse: true })
  id: number;

  @Prop({ index: true })
  name: string;

  @Prop({ index: true })
  amount: number;

  @Prop({ index: true })
  type: string;
}

export const ShippingSchema = SchemaFactory.createForClass(Shipping);
