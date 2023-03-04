import { AttributeValue } from 'src/attributes/entities/attribute-value.entity';
import { ProductType, Variation, OrderProductPivot, ProductStatus } from '../entities/product.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Category } from 'src/categories/entities/category.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { Type } from 'src/types/entities/type.entity';
import { Review } from '../../reviews/entities/review.entity';

export type ProductDocument = Product & Document;

@Schema()
export class Product extends CoreEntity {
  @Prop()
  name: string;

  @Prop({ unique: true })
  slug: string;

  @Prop()
  type: Type;

  @Prop()
  type_id: number;

  @Prop({ enum: ProductType })
  product_type: ProductType;

  @Prop({ type: [{ type: Number, ref: 'Category' }] })
  categories: Category[];

  @Prop({ type: [{ type: Number, ref: 'Tag' }] })
  tags?: Tag[];

  @Prop({ type: [{ type: Number, ref: 'AttributeValue' }] })
  variations?: AttributeValue[];

  @Prop({ type: [{ type: Object }] })
  variation_options?: Variation[];

  @Prop({ type: OrderProductPivot })
  pivot?: OrderProductPivot;

  @Prop({ type: [{ type: Number, ref: 'Order' }] })
  orders?: Order[];

  @Prop({ type: Number, ref: 'Shop' })
  shop: Shop;

  @Prop()
  shop_id: number;

  @Prop({ type: [{ type: Number, ref: 'Product' }] })
  related_products?: Product[];

  @Prop()
  description: string;

  @Prop({ default: true })
  in_stock: boolean;

  @Prop({ default: true })
  is_taxable: boolean;

  @Prop({ type: Number })
  sale_price?: number;

  @Prop({ type: Number })
  max_price?: number;

  @Prop({ type: Number })
  min_price?: number;

  @Prop({ type: String })
  sku?: string;

  @Prop({ type: [{ type: Number, ref: 'Attachment' }] })
  gallery?: Attachment[];

  @Prop({ type: Number, ref: 'Attachment' })
  image?: Attachment;

  @Prop({ required: true, enum: ProductStatus, default: ProductStatus.DRAFT })
  status: ProductStatus;

  @Prop({ type: String })
  height?: string;

  @Prop({ type: String })
  length?: string;

  @Prop({ type: String })
  width?: string;

  @Prop({ type: Number })
  price?: number;

  @Prop()
  quantity: number;

  @Prop()
  unit: string;

  @Prop({ type: Number, default: 0 })
  ratings: number;

  @Prop({ default: false })
  in_wishlist: boolean;

  @Prop({ type: [{ type: Number, ref: 'Review' }] })
  my_review?: Review[];

  @Prop({ type: String })
  language?: string;

  @Prop({ type: [String] })
  translated_languages?: string[];
}

export const ProductSchema = SchemaFactory.createForClass(Product)
