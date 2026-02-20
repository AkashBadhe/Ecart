import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ReportDocument = HydratedDocument<Report>;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  strict: false,
})
export class Report {
  @Prop({ index: true, unique: true, sparse: true })
  id: number;

  @Prop()
  message: string;

  @Prop({ index: true })
  model_id: number;

  @Prop({ index: true })
  model_type: string;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
