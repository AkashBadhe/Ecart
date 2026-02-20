import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  strict: false,
})
export class Review {
  @Prop({ index: true, unique: true, sparse: true })
  id: number;

  @Prop({ index: true })
  product_id: number;

  @Prop({ index: true })
  rating: number;

  @Prop()
  message: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
