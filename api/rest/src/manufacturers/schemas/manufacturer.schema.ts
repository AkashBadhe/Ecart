import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CoreEntity } from '../../common/entities/core.entity';
import { Attachment } from '../../common/entities/attachment.entity';
import { ShopSocials } from '../../settings/entities/setting.entity';
import { Type } from '../../types/entities/type.entity';


export type ManufacturerDocument = Manufacturer & Document;

@Schema()
export class Manufacturer extends CoreEntity {
  @Prop()
  cover_image?: Attachment;

  @Prop()
  description?: string;

  @Prop()
  image?: Attachment;

  @Prop()
  is_approved?: boolean;

  @Prop()
  name: string;

  @Prop()
  products_count?: number;

  @Prop()
  slug?: string;

  @Prop()
  socials?: ShopSocials;

  @Prop()
  type: Type;

  @Prop()
  type_id?: string;

  @Prop()
  website?: string;
}

export const ManufacturerSchema = SchemaFactory.createForClass(Manufacturer);
