import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CoreEntity } from '../../common/entities/core.entity';

export type OrderStatusDocument = OrderStatus & Document;

@Schema()
export class OrderStatus extends CoreEntity {
  @Prop()
  name: string;

  @Prop()
  color: string;

  @Prop()
  serial: number;

  @Prop()
  slug: string;

  @Prop()
  language: string;

  @Prop()
  translated_languages: string[];
}

export const OrderStatusSchema = SchemaFactory.createForClass(OrderStatus);
