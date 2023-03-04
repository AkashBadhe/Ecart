import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { Feedback } from '../../feedbacks/entities/feedback.entity';

export type QuestionDocument = Question & Document;

@Schema()
export class Question extends CoreEntity {
  @Prop({ required: true })
  user_id: number;

  @Prop({ required: true })
  product_id: number;

  @Prop({ required: true })
  shop_id: number;

  @Prop({ required: true })
  answer: string;

  @Prop({ default: 0 })
  positive_feedbacks_count?: number;

  @Prop({ default: 0 })
  negative_feedbacks_count?: number;

  @Prop({ type: Product })
  product: Product;

  @Prop({ type: User })
  user: User;

  @Prop()
  feedbacks?: Feedback[];

  @Prop({ type: Feedback })
  my_feedback?: Feedback;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
