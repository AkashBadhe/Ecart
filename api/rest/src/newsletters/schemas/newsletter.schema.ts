import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CoreEntity } from '../../common/entities/core.entity';

export type NewsletterDocument = Newsletter & Document;

@Schema({ timestamps: true })
export class Newsletter extends CoreEntity {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, default: false })
  is_subscribed: boolean;

  @Prop()
  subscribed_at: string;

  @Prop()
  unsubscribed_at: string;
}

export const NewsletterSchema = SchemaFactory.createForClass(Newsletter);
