import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type AnalyticsDocument = HydratedDocument<Analytics>;

export class TotalYearSaleByMonth {
  @Prop({ required: true })
  total?: number;

  @Prop({ required: true })
  month?: string;
}

@Schema()
export class Analytics extends Document {
  @Prop()
  totalRevenue?: number;

  @Prop()
  totalShops?: number;

  @Prop()
  todaysRevenue?: number;

  @Prop()
  totalOrders?: number;

  @Prop()
  newCustomers?: number;

  @Prop()
  totalYearSaleByMonth?: TotalYearSaleByMonth[];
}

export const AnalyticsSchema = SchemaFactory.createForClass(Analytics);