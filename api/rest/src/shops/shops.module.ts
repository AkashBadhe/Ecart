import { Module } from '@nestjs/common';
import { ShopsService } from './shops.service';
import {
  ApproveShopController,
  DisapproveShopController,
  ShopsController,
  StaffsController,
} from './shops.controller';

import { MongooseModule } from '@nestjs/mongoose';
import { Shop, ShopSchema } from './schemas/shop.schema';
import { Balance, BalanceSchema } from './schemas/balance.schema';
import { PaymentInfo, PaymentInfoSchema } from './schemas/payment-info.schema';
import { ShopSettings, ShopSettingsSchema } from './schemas/shop-settings.schema';
import { UsersService } from 'src/users/users.service';
import { User, UserSchema } from 'src/users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Shop.name, schema: ShopSchema },
      { name: Balance.name, schema: BalanceSchema },
      { name: PaymentInfo.name, schema: PaymentInfoSchema },
      { name: ShopSettings.name, schema: ShopSettingsSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ShopsController, ApproveShopController, DisapproveShopController, StaffsController],
  providers: [ShopsService, UsersService],
})
export class ShopsModule {}
