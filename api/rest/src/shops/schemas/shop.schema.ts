// shop.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserAddress } from 'src/addresses/entities/address.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Balance } from '../entities/shop.entity';
import { ShopSettings, ShopSettingsSchema } from './shop-settings.schema';

export type ShopDocument = Shop & Document;

@Schema({ timestamps: true })
export class Shop extends CoreEntity {
  @Prop({ type: Number })
  owner_id: number;

  @Prop()
  owner: User;

  @Prop()
  staffs?: User[];

  @Prop({ type: Boolean, default: true })
  is_active: boolean;

  @Prop({ type: Number, default: 0 })
  orders_count: number;

  @Prop({ type: Number, default: 0 })
  products_count: number;

  @Prop({ type: Balance })
  balance?: Balance;

  @Prop({ type: String } )
  name: string;

  @Prop({ type: String, unique: true})
  slug: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Attachment })
  cover_image: Attachment;

  @Prop({ type: Attachment })
  logo?: Attachment;

  @Prop({ type: UserAddress })
  address: UserAddress;

  @Prop({ type: ShopSettingsSchema })
  settings?: ShopSettings;
}

export const ShopSchema = SchemaFactory.createForClass(Shop);
