import { Controller, Get, Param } from '@nestjs/common';
import { PaymentIntentService } from './payment-intent.service';

@Controller('payment-intent')
export class PaymentIntentController {
  constructor(private readonly paymentIntentService: PaymentIntentService) {}
  @Get(':id')
  getPaymentIntent(@Param('id') id: string) {
    return this.paymentIntentService.getPaymentIntent(+id);
  }
}
