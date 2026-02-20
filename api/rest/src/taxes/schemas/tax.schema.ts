import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TaxDocument = HydratedDocument<Tax>;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  strict: false,
})
export class Tax {
  @Prop({ index: true, unique: true, sparse: true })
  id: number;

  @Prop({ index: true })
  name: string;

  @Prop({ index: true })
  rate: number;
}

export const TaxSchema = SchemaFactory.createForClass(Tax);
