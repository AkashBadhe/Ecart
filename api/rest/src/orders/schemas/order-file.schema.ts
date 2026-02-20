import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrderFileDocument = HydratedDocument<OrderFile>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, strict: false })
export class OrderFile {
  @Prop({ type: Number })
  id: number;

  @Prop({ type: String })
  purchase_key: string;

  @Prop({ type: Number })
  digital_file_id: number;

  @Prop({ type: Number })
  order_id: number;

  @Prop({ type: Number })
  customer_id: number;

  @Prop({ type: Object, default: {} })
  file: {
    id: number;
    url: string;
  };
}

export const OrderFileSchema = SchemaFactory.createForClass(OrderFile);
