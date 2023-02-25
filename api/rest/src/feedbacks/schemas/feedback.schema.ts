import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CoreEntity } from 'src/common/entities/core.entity';

export type FeedbackDocument = HydratedDocument<Feedback>;

@Schema()
export class Feedback extends CoreEntity {
  @Prop()
  user_id: string;

  @Prop({ required: true })
  model_type: string;

  @Prop({ required: true })
  model_id: string;

  @Prop()
  positive?: boolean;

  @Prop()
  negative?: boolean;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
