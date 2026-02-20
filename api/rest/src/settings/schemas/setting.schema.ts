import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SettingDocument = HydratedDocument<Setting>;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  strict: false,
})
export class Setting {
  @Prop({ index: true, unique: true, sparse: true })
  id: number;

  @Prop({ type: Object })
  options: Record<string, unknown>;

  @Prop({ index: true })
  language: string;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
