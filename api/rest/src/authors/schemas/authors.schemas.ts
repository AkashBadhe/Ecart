import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CoreEntity } from '../../common/entities/core.entity';
import { Attachment } from '../../common/entities/attachment.entity';
import { ShopSocials } from '../../settings/entities/setting.entity';

export type AuthorDocument = Author & Document;

@Schema()
export class Author extends CoreEntity {
  @Prop({ required: true })
  name: string;

  @Prop()
  bio?: string;

  @Prop()
  born?: string;

  @Prop({ type: Attachment })
  cover_image?: Attachment;

  @Prop()
  death?: string;

  @Prop({ type: Attachment })
  image?: Attachment;

  @Prop({ default: false })
  is_approved?: boolean;

  @Prop()
  languages?: string;

  @Prop({ default: 0 })
  products_count?: number;

  @Prop()
  quote?: string;

  @Prop()
  slug?: string;

  @Prop({ type: ShopSocials })
  socials?: ShopSocials;

  @Prop()
  language?: string;

  @Prop()
  translated_languages?: string[];
}

export const AuthorSchema = SchemaFactory.createForClass(Author);
