import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserAddress } from 'src/addresses/schemas/address.schema';
import { Coupon } from 'src/coupons/entities/coupon.entity';
import { PaymentIntent } from 'src/payment-intent/entries/payment-intent.entity';
import { Product } from 'src/products/entities/product.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { User } from 'src/users/entities/user.entity';
import { OrderStatus } from '../entities/order-status.entity';
import { CoreEntity } from '../../common/entities/core.entity';
import {
  OrderStatusType,
  PaymentGatewayType,
  PaymentStatusType,
} from '../entities/order.entity';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order extends CoreEntity{
  @Prop()
  tracking_number: string;

  @Prop()
  customer_id: number;

  @Prop()
  customer_contact: string;

  @Prop({ type: Object })
  customer: User;

  @Prop({ type: Object, default: null })
  parent_order?: Order;

  @Prop({ type: [Object], default: [] })
  children: Order[];

  @Prop({ type: Object })
  status: OrderStatus;

  @Prop({
    type: String,
    enum: Object.values(OrderStatusType),
    default: OrderStatusType.DEFAULT_ORDER_STATUS,
  })
  order_status: OrderStatusType;

  @Prop({
    type: String,
    enum: Object.values(PaymentStatusType),
    default: PaymentStatusType.DEFAULT_PAYMENT_STATUS,
  })
  payment_status: PaymentStatusType;

  @Prop()
  amount: number;

  @Prop()
  sales_tax: number;

  @Prop()
  total: number;

  @Prop()
  paid_total: number;

  @Prop({ default: null })
  payment_id?: string;

  @Prop({ type: String, enum: Object.values(PaymentGatewayType) })
  payment_gateway: PaymentGatewayType;

  @Prop({ type: Object, default: null })
  coupon?: Coupon;

  @Prop({ type: Object })
  shop: Shop;

  @Prop({ default: null })
  discount?: number;

  @Prop()
  delivery_fee: number;

  @Prop()
  delivery_time: string;

  @Prop({ type: [Object] })
  products: Product[];

  @Prop({ type: Object })
  billing_address: UserAddress;

  @Prop({ type: Object })
  shipping_address: UserAddress;

  @Prop()
  language: string;

  @Prop()
  translated_languages: string[];

  @Prop()
  payment_intent: PaymentIntent;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
