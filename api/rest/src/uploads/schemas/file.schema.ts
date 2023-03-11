import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FileDocument = File & Document;

@Schema()
export class File {
  @Prop()
  fileName: string;

  @Prop()
  fileType: string;

  @Prop()
  filePath: string;

  @Prop()
  fileSize: number;

  @Prop({ default: Date.now })
  createdDate: Date;
  
  @Prop()
  publicId: string;
}

export const FileSchema = SchemaFactory.createForClass(File);
