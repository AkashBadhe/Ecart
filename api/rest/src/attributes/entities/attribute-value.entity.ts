import { Attribute } from './attribute.entity';

export class AttributeValue {
  shop_id: number;
  value: string;
  meta?: string;
  attribute: Attribute;
}