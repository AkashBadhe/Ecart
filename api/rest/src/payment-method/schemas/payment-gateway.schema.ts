import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

export type PaymentGatewayDocument = HydratedDocument<PaymentGateway>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, strict: false })
export class PaymentGateway {
  @Prop({ type: Number, auto: true })
  id: number;

  @Prop({ type: Number, required: true })
  user_id: number;

  @Prop({ type: String, required: true })
  customer_id: string;

  @Prop({ type: String, required: true })
  gateway_name: string;
}

export const PaymentGatewaySchema = SchemaFactory.createForClass(PaymentGateway);

// Auto-increment ID
PaymentGatewaySchema.pre<PaymentGatewayDocument>('save', async function (next) {
  if (this.isNew) {
    const Model = this.constructor as Model<PaymentGatewayDocument>;
    const lastDoc = await Model.findOne({}, {}, { sort: { id: -1 } })
      .exec();
    this.id = lastDoc && lastDoc.id ? lastDoc.id + 1 : 1;
  }
  next();
});

