// payment-info.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentInfoDocument = PaymentInfo & Document;

@Schema({ timestamps: true })
export class PaymentInfo {
  @Prop({ type: String })
  account: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  email: string;

  @Prop({ type: String })
  bank: string;
}

export const PaymentInfoSchema = SchemaFactory.createForClass(PaymentInfo);
