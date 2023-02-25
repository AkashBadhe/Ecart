import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Product } from 'src/products/entities/product.entity';
import { Type } from 'src/types/entities/type.entity';


export type CategoryDocument = Category & Document;

@Schema()
export class Category {
  @Prop({ required: true })
  name: string;

  @Prop()
  slug: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category' })
  parent: Category;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }] })
  children: Category[];

  @Prop()
  details: string;

  @Prop({ type: Attachment })
  image: Attachment;

  @Prop()
  icon: string;

  @Prop({ enum: Type })
  type: Type;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }] })
  products: Product[];

  @Prop({ required: true })
  language: string;

  @Prop({ type: [{ type: String }] })
  translated_languages: string[];
}

export const CategorySchema = SchemaFactory.createForClass(Category);
