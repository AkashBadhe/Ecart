import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentIntentController } from './payment-intent.controller';
import { PaymentIntentService } from './payment-intent.service';
import { PaymentIntent, PaymentIntentSchema } from './schemas/payment-intent.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: PaymentIntent.name, schema: PaymentIntentSchema }])],
  controllers: [PaymentIntentController],
  providers: [PaymentIntentService],
})
export class PaymentIntentModule {}

