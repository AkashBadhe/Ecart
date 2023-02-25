import { AttributeValue } from './attribute-value.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Shop } from 'src/shops/entities/shop.entity';

export type AttributeDocument = Attribute & Document;

@Schema()
export class Attribute extends CoreEntity {
  @Prop()
  name: string;

  @Prop()
  shop_id: string;

  @Prop({ type: Shop })
  shop: Shop;

  @Prop()
  slug: string;

  @Prop()
  values: AttributeValue[];

  @Prop()
  language: string;

  @Prop()
  translated_languages: string[];
}

export const AttributeSchema = SchemaFactory.createForClass(Attribute);
