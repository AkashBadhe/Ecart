import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

export type PaymentIntentDocument = HydratedDocument<PaymentIntent>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, strict: false })
export class PaymentIntent {
  @Prop({ type: Number, auto: true })
  id: number;

  @Prop({ type: Number })
  order_id: number;

  @Prop({ type: String })
  tracking_number: string;

  @Prop({ type: String })
  payment_gateway: string;

  @Prop({
    type: {
      client_secret: { type: String, default: null },
      redirect_url: { type: String, default: null },
      payment_id: { type: String },
      is_redirect: { type: Boolean, default: false },
    },
    default: {},
  })
  payment_intent_info: {
    client_secret?: string | null;
    redirect_url?: string | null;
    payment_id: string;
    is_redirect: boolean;
  };
}

export const PaymentIntentSchema = SchemaFactory.createForClass(PaymentIntent);

// Auto-increment ID by checking the last document
PaymentIntentSchema.pre<PaymentIntentDocument>('save', async function (next) {
  if (this.isNew) {
    const Model = this.constructor as Model<PaymentIntentDocument>;
    const lastDoc = await Model.findOne({}, {}, { sort: { id: -1 } })
      .exec();
    this.id = lastDoc && lastDoc.id ? lastDoc.id + 1 : 1;
  }
  next();
});
