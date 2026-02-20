import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from 'src/auth/auth.service';
import {
  StripeCustomer,
  StripePaymentMethod,
} from 'src/payment/entity/stripe.entity';
import { StripePaymentService } from 'src/payment/stripe-payment.service';
import { SettingsService } from 'src/settings/settings.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { DefaultCart } from './dto/set-default-card.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { PaymentGateway, PaymentGatewayDocument } from './schemas/payment-gateway.schema';
import { PaymentMethod, PaymentMethodDocument } from './schemas/payment-method.schema';

@Injectable()
export class PaymentMethodService {
  constructor(
    @InjectModel(PaymentMethod.name) private paymentMethodModel: Model<PaymentMethodDocument>,
    @InjectModel(PaymentGateway.name) private paymentGatewayModel: Model<PaymentGatewayDocument>,
    private readonly authService: AuthService,
    private readonly stripeService: StripePaymentService,
    private readonly settingService: SettingsService,
  ) {}

  async create(createPaymentMethodDto: CreatePaymentMethodDto) {
    try {
      const defaultCard = await this.paymentMethodModel.findOne({ default_card: true }).exec();
      if (!defaultCard) {
        createPaymentMethodDto.default_card = true;
      }
      if (createPaymentMethodDto.default_card) {
        await this.paymentMethodModel.updateMany({}, { default_card: false }).exec();
      }
      const settings = await this.settingService.findAll();
      const paymentGateway: string = settings?.options?.paymentGateway || 'stripe';
      return await this.saveCard(createPaymentMethodDto, paymentGateway);
    } catch (error) {
      console.log(error);
      return await this.paymentMethodModel.findOne().exec();
    }
  }

  async findAll() {
    return this.paymentMethodModel.find().exec();
  }

  async findOne(id: number) {
    return this.paymentMethodModel.findOne({ id }).exec();
  }

  async update(id: number, updatePaymentMethodDto: UpdatePaymentMethodDto) {
    return this.paymentMethodModel
      .findOneAndUpdate({ id }, updatePaymentMethodDto, { new: true })
      .exec();
  }

  async remove(id: number) {
    return this.paymentMethodModel.findOneAndDelete({ id }).exec();
  }

  async saveDefaultCart(defaultCart: DefaultCart) {
    const { method_id } = defaultCart;
    await this.paymentMethodModel.updateMany({}, { default_card: false }).exec();
    return this.paymentMethodModel
      .findOneAndUpdate({ id: Number(method_id) }, { default_card: true }, { new: true })
      .exec();
  }

  async savePaymentMethod(createPaymentMethodDto: CreatePaymentMethodDto) {
    const settings = await this.settingService.findAll();
    const paymentGateway: string = settings?.options?.paymentGateway || 'stripe';
    try {
      return this.saveCard(createPaymentMethodDto, paymentGateway);
    } catch (err) {
      console.log(err);
    }
  }

  async saveCard(
    createPaymentMethodDto: CreatePaymentMethodDto,
    paymentGateway: string,
  ) {
    const { method_key, default_card } = createPaymentMethodDto;
    const defaultCard = await this.paymentMethodModel.findOne({ default_card: true }).exec();
    if (!defaultCard) {
      createPaymentMethodDto.default_card = true;
    }
    const retrievedPaymentMethod =
      await this.stripeService.retrievePaymentMethod(method_key);
    if (
      await this.paymentMethodAlreadyExists(retrievedPaymentMethod.card.fingerprint)
    ) {
      return this.paymentMethodModel.findOne({ method_key }).exec();
    } else {
      const paymentMethod = await this.makeNewPaymentMethodObject(
        createPaymentMethodDto,
        paymentGateway,
      );
      const newPaymentMethod = new this.paymentMethodModel(paymentMethod);
      return newPaymentMethod.save();
    }
  }

  async paymentMethodAlreadyExists(fingerPrint: string): Promise<boolean> {
    const paymentMethod = await this.paymentMethodModel
      .findOne({ fingerprint: fingerPrint })
      .exec();
    return !!paymentMethod;
  }

  async makeNewPaymentMethodObject(
    createPaymentMethodDto: CreatePaymentMethodDto,
    paymentGateway: string,
  ) {
    const { method_key, default_card } = createPaymentMethodDto;
    const user = await this.authService.me();
    const user_id = user?.id;
    const name = user?.name;
    const email = user?.email;
    const listofCustomer = await this.stripeService.listAllCustomer();
    let currentCustomer = listofCustomer.data.find(
      (customer: StripeCustomer) => customer.email === email,
    );
    if (!currentCustomer) {
      const newCustomer = await this.stripeService.createCustomer({
        name,
        email,
      });
      currentCustomer = newCustomer;
    }
    const attachedPaymentMethod: StripePaymentMethod =
      await this.stripeService.attachPaymentMethodToCustomer(
        method_key,
        currentCustomer.id,
      );
    let customerGateway = await this.paymentGatewayModel.findOne({
      user_id,
      gateway_name: paymentGateway,
    }).exec();
    if (!customerGateway) {
      const newGateway = new this.paymentGatewayModel({
        user_id,
        customer_id: currentCustomer['id'],
        gateway_name: paymentGateway,
      });
      customerGateway = await newGateway.save();
    }
    const paymentMethod: Partial<PaymentMethod> = {
      method_key,
      payment_gateway_id: customerGateway.id,
      default_card,
      fingerprint: attachedPaymentMethod.card.fingerprint,
      owner_name: attachedPaymentMethod.billing_details.name,
      last4: attachedPaymentMethod.card.last4,
      expires: `${attachedPaymentMethod.card.exp_month}/${attachedPaymentMethod.card.exp_year}`,
      network: attachedPaymentMethod.card.brand,
      type: attachedPaymentMethod.card.funding,
      origin: attachedPaymentMethod.card.country,
      verification_check: attachedPaymentMethod.card.checks.cvc_check,
    };
    return paymentMethod;
  }
}

