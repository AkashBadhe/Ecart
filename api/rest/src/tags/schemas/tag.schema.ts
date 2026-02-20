import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TagDocument = HydratedDocument<Tag>;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  strict: false,
})
export class Tag {
  @Prop({ index: true, unique: true, sparse: true })
  id: number;

  @Prop({ index: true })
  slug: string;

  @Prop({ index: true })
  name: string;

  @Prop({ type: Number })
  parent?: number;

  @Prop({ type: String })
  details?: string;

  @Prop({ type: Object, default: {} })
  image?: any;

  @Prop({ type: String })
  icon?: string;

  @Prop({ type: Object, default: {} })
  type?: any;

  @Prop({ type: Array, default: [] })
  products?: any[];

  @Prop({ type: String })
  language?: string;

  @Prop({ type: Array, default: [] })
  translated_languages?: string[];

  @Prop({ type: Date, default: Date.now })
  created_at?: Date;

  @Prop({ type: Date, default: Date.now })
  updated_at?: Date;
}

export const TagSchema = SchemaFactory.createForClass(Tag);
