// balance.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Shop } from './shop.schema';
import { PaymentInfo } from './payment-info.schema';

export type BalanceDocument = Balance & Document;

@Schema({ timestamps: true })
export class Balance {
  @Prop({ type: Number })
  id: number;

  @Prop({ type: Number, default: 0 })
  admin_commission_rate: number;

  @Prop({ type: Shop })
  shop: Shop;

  @Prop({ type: Number, default: 0 })
  total_earnings: number;

  @Prop({ type: Number, default: 0 })
  withdrawn_amount: number;

  @Prop({ type: Number, default: 0 })
  current_balance: number;

  @Prop({ type: PaymentInfo })
  payment_info: PaymentInfo;
}

export const BalanceSchema = SchemaFactory.createForClass(Balance);
