import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Address } from 'src/addresses/entities/address.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Profile } from '../entities/profile.entity';

export type UserDocument = User & Document;

@Schema()
export class User extends CoreEntity {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  shop_id: number;

  @Prop({ type: Profile })
  profile: Profile;

  @Prop()
  shops: Shop[];

  @Prop({ type: Shop })
  managed_shop: Shop;

  @Prop({ default: true })
  is_active: boolean;
  
  @Prop({ default: false })
  is_admin: boolean;

  @Prop()
  address: Address[];
}

export const UserSchema = SchemaFactory.createForClass(User);
