import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TypeDocument = HydratedDocument<Type>;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  strict: false,
})
export class Type {
  @Prop({ index: true, unique: true, sparse: true })
  id: number;

  @Prop({ index: true, unique: true, sparse: true })
  slug: string;

  @Prop({ index: true })
  name: string;

  @Prop({ type: Object, default: {} })
  image?: any;

  @Prop({ type: String })
  icon?: string;

  @Prop({ type: Array, default: [] })
  banners?: any[];

  @Prop({ type: Array, default: [] })
  promotional_sliders?: any[];

  @Prop({ type: Object, default: {} })
  settings?: any;

  @Prop({ type: String })
  language?: string;

  @Prop({ type: Array, default: [] })
  translated_languages?: string[];

  @Prop({ type: Date, default: Date.now })
  created_at?: Date;

  @Prop({ type: Date, default: Date.now })
  updated_at?: Date;
}

export const TypeSchema = SchemaFactory.createForClass(Type);
