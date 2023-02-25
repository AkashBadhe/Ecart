import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Coupon, CouponSchema } from './schemas/coupon.schema';
import { CouponsService } from './coupons.service';
import { CouponsController } from './coupons.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Coupon.name, schema: CouponSchema }]),
  ],
  controllers: [CouponsController],
  providers: [CouponsService],
})
export class CouponsModule {}
