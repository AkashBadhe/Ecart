import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CouponType } from '../entities/coupon.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Order } from 'src/orders/entities/order.entity';

export type CouponDocument = Coupon & Document;

@Schema()
export class Coupon extends CoreEntity {
  @Prop({ required: true })
  code: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  minimum_cart_amount: number;

  @Prop({ type: [{ type: String, ref: 'Order' }] })
  orders?: Order[];

  @Prop({ required: true, enum: CouponType, default: CouponType.DEFAULT_COUPON })
  type: CouponType;

  @Prop({ type: Attachment })
  image?: Attachment;

  @Prop({ default: true })
  is_valid?: boolean;

  @Prop()
  amount?: number;

  @Prop({ required: true })
  active_from: string;

  @Prop({ required: true })
  expire_at: string;

  @Prop({ required: true })
  language: string;

  @Prop({ required: true, type: [String] })
  translated_languages: string[];
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
