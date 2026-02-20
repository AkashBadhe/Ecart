import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaymentIntent } from './schemas/payment-intent.schema';

@Injectable()
export class PaymentIntentService {
  constructor(@InjectModel(PaymentIntent.name) private paymentIntentModel: Model<PaymentIntent>) {}

  async getPaymentIntent(id: number): Promise<PaymentIntent> {
    return this.paymentIntentModel.findOne({ id }).exec();
  }

  async findAllPaymentIntents(): Promise<PaymentIntent[]> {
    return this.paymentIntentModel.find().exec();
  }

  async findPaymentIntentByOrderId(orderId: number): Promise<PaymentIntent> {
    return this.paymentIntentModel.findOne({ order_id: orderId }).exec();
  }

  async create(paymentIntentData: Partial<PaymentIntent>): Promise<PaymentIntent> {
    const newPaymentIntent = new this.paymentIntentModel(paymentIntentData);
    return newPaymentIntent.save();
  }

  async update(id: number, paymentIntentData: Partial<PaymentIntent>): Promise<PaymentIntent> {
    return this.paymentIntentModel
      .findOneAndUpdate({ id }, paymentIntentData, { new: true })
      .exec();
  }

  async remove(id: number): Promise<PaymentIntent> {
    return this.paymentIntentModel.findOneAndDelete({ id }).exec();
  }
}

