// shop-settings.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Location, ShopSocials } from 'src/settings/entities/setting.entity';

export type ShopSettingsDocument = ShopSettings & Document;

@Schema({ timestamps: true })
export class ShopSettings {
  @Prop()
  socials: ShopSocials[];

  @Prop({ type: String })
  contact: string;

  @Prop({ type: Location })
  location: Location;

  @Prop({ type: String })
  website: string;
}

export const ShopSettingsSchema = SchemaFactory.createForClass(ShopSettings);
