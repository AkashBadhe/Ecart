import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrderExportDocument = HydratedDocument<OrderExport>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, strict: false })
export class OrderExport {
  @Prop({ type: String })
  url: string;
}

export const OrderExportSchema = SchemaFactory.createForClass(OrderExport);
