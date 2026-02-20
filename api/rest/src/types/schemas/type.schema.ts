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
}

export const TypeSchema = SchemaFactory.createForClass(Type);
