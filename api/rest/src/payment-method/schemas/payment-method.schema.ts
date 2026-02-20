import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

export type PaymentMethodDocument = HydratedDocument<PaymentMethod>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, strict: false })
export class PaymentMethod {
  @Prop({ type: Number, auto: true })
  id: number;

  @Prop({ type: String, required: true })
  method_key: string;

  @Prop({ type: Boolean, default: false })
  default_card: boolean;

  @Prop({ type: Number })
  payment_gateway_id: number;

  @Prop({ type: String })
  fingerprint: string;

  @Prop({ type: String })
  owner_name: string;

  @Prop({ type: String })
  network: string;

  @Prop({ type: String })
  type: string;

  @Prop({ type: String })
  last4: string;

  @Prop({ type: String })
  expires: string;

  @Prop({ type: String })
  origin: string;

  @Prop({ type: String })
  verification_check: string;
}

export const PaymentMethodSchema = SchemaFactory.createForClass(PaymentMethod);

// Auto-increment ID
PaymentMethodSchema.pre<PaymentMethodDocument>('save', async function (next) {
  if (this.isNew) {
    const Model = this.constructor as Model<PaymentMethodDocument>;
    const lastDoc = await Model.findOne({}, {}, { sort: { id: -1 } })
      .exec();
    this.id = lastDoc && lastDoc.id ? lastDoc.id + 1 : 1;
  }
  next();
});

