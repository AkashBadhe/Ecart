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
}

export const TagSchema = SchemaFactory.createForClass(Tag);
