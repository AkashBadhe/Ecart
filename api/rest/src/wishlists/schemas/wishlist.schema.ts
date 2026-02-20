import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WishlistDocument = HydratedDocument<Wishlist>;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  strict: false,
})
export class Wishlist {
  @Prop({ index: true, unique: true, sparse: true })
  id: number;

  @Prop({ index: true })
  product_id: number;

  @Prop({ index: true })
  user_id: string;
}

export const WishlistSchema = SchemaFactory.createForClass(Wishlist);
