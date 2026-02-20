import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrderInvoiceDocument = HydratedDocument<OrderInvoice>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, strict: false })
export class OrderInvoice {
  @Prop({ type: Number })
  order_id: number;

  @Prop({ type: String })
  url: string;
}

export const OrderInvoiceSchema = SchemaFactory.createForClass(OrderInvoice);
