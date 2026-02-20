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
    id?: number;
    attachment_id?: number;
    url: string;
    fileable_id?: number;
    created_at?: Date;
    updated_at?: Date;
  };

  @Prop({ type: Date })
  created_at?: Date;

  @Prop({ type: Date })
  updated_at?: Date;

  @Prop({ type: Object, default: {} })
  fileable?: any;
}

export const OrderFileSchema = SchemaFactory.createForClass(OrderFile);
