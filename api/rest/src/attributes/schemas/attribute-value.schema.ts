import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Attribute } from './attribute.schema';

export type AttributeValueDocument = AttributeValue & Document;

@Schema()
export class AttributeValue extends CoreEntity {
  @Prop()
  shop_id: number;

  @Prop()
  value: string;

  @Prop()
  meta?: string;

  @Prop({ type: { type: Attribute } })
  attribute: Attribute;
}

export const AttributeValueSchema = SchemaFactory.createForClass(AttributeValue);
