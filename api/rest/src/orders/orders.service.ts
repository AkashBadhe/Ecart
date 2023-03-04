import { Order, OrderDocument } from './schemas/order.schema';
import {
  OrderStatus,
  OrderStatusDocument,
} from './schemas/order-status.schema';
import { Order as OrderEntitry } from './entities/order.entity';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import exportOrderJson from '@db/order-export.json';
import orderFilesJson from '@db/order-files.json';
import orderInvoiceJson from '@db/order-invoice.json';
import orderStatusJson from '@db/order-statuses.json';
import paymentGatewayJson from '@db/payment-gateway.json';
import paymentIntentJson from '@db/payment-intent.json';
import setting from '@db/settings.json';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { AuthService } from 'src/auth/auth.service';
import { paginate } from 'src/common/pagination/paginate';
import { PaymentIntent } from 'src/payment-intent/entries/payment-intent.entity';
import { PaymentGateWay } from 'src/payment-method/entities/payment-gateway.entity';
import { PaypalPaymentService } from 'src/payment/paypal-payment.service';
import { StripePaymentService } from 'src/payment/stripe-payment.service';
import { Setting } from 'src/settings/entities/setting.entity';
import {
  CreateOrderStatusDto,
  UpdateOrderStatusDto,
} from './dto/create-order-status.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrderFilesDto } from './dto/get-downloads.dto';
import {
  GetOrderStatusesDto,
  OrderStatusPaginator,
} from './dto/get-order-statuses.dto';
import {
  GetOrdersDto,
  OrderPaginator,
  QueryOrdersOrderByColumn,
} from './dto/get-orders.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import {
  CheckoutVerificationDto,
  VerifiedCheckoutData,
} from './dto/verify-checkout.dto';
import {
  OrderFiles,
  OrderStatusType,
  PaymentGatewayType,
  PaymentStatusType,
} from './entities/order.entity';
import { InjectModel } from '@nestjs/mongoose';
import { getSearchQuery } from 'src/common/utils';
import { SortOrder } from 'src/common/dto/generic-conditions.dto';
const paymentIntents = plainToClass(PaymentIntent, paymentIntentJson);
const paymentGateways = plainToClass(PaymentGateWay, paymentGatewayJson);
const orderStatus = plainToClass(OrderStatus, orderStatusJson);
const options = {
  keys: ['name'],
  threshold: 0.3,
};
const fuse = new Fuse(orderStatus, options);
const orderFiles = plainToClass(OrderFiles, orderFilesJson);
const settings = plainToClass(Setting, setting);
@Injectable()
export class OrdersService {
  private orderFiles: OrderFiles[] = orderFiles;
  private setting: Setting = settings;
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(OrderStatus.name)
    private orderStatusModel: Model<OrderStatusDocument>,
    private readonly authService: AuthService,
    private readonly stripeService: StripePaymentService,
    private readonly paypalService: PaypalPaymentService,
  ) {}
  async create(createOrderInput: CreateOrderDto): Promise<Order> {
    const createOrder = await this.orderModel.create(createOrderInput);
    return createOrder;
    // const order = new Order();
    // order.amount = createOrderInput.amount;
    // const payment_gateway_type = createOrderInput.payment_gateway
    //   ? createOrderInput.payment_gateway
    //   : PaymentGatewayType.CASH_ON_DELIVERY;

    // order.payment_gateway = payment_gateway_type;
    // order.payment_intent = null;
    // // set the order type and payment type

    // switch (payment_gateway_type) {
    //   case PaymentGatewayType.CASH_ON_DELIVERY:
    //     order.order_status = OrderStatusType.PROCESSING;
    //     order.payment_status = PaymentStatusType.CASH_ON_DELIVERY;
    //     break;
    //   case PaymentGatewayType.CASH:
    //     order.order_status = OrderStatusType.PROCESSING;
    //     order.payment_status = PaymentStatusType.CASH;
    //     break;
    //   case PaymentGatewayType.FULL_WALLET_PAYMENT:
    //     order.order_status = OrderStatusType.COMPLETED;
    //     order.payment_status = PaymentStatusType.WALLET;
    //     break;
    //   default:
    //     order.order_status = OrderStatusType.PENDING;
    //     order.payment_status = PaymentStatusType.PENDING;
    //     break;
    // }

    // try {
    //   if (
    //     [
    //       PaymentGatewayType.STRIPE,
    //       PaymentGatewayType.PAYPAL,
    //       PaymentGatewayType.RAZORPAY,
    //     ].includes(payment_gateway_type)
    //   ) {
    //     const paymentIntent = await this.processPaymentIntent(
    //       order,
    //       this.setting,
    //     );
    //     order.payment_intent = paymentIntent;
    //   }
    //   return await this.orderModel.create(order)
    // } catch (error) {
    //   return error;
    // }
  }

  async getOrders({
    limit = 10,
    page = 1,
    customer_id,
    tracking_number,
    search = '',
    shop_id,
    orderByDirection = SortOrder.DESC,
    orderBy = QueryOrdersOrderByColumn.CREATED_AT,
  }: GetOrdersDto): Promise<OrderPaginator> {
    const skip = (page - 1) * limit;
    const query = getSearchQuery(search);

    const sort: any = {
      [orderBy]: orderByDirection.toLowerCase() === 'desc' ? -1 : 1,
    };

    const [orders, totalCount] = await Promise.all([
      this.orderModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
      this.orderModel.countDocuments(query).exec(),
    ]);

    const url = `/orders?search=${search}&limit=${limit}`;
    return {
      ...paginate(totalCount, page, limit, orders.length, url),
      data: orders,
    };
  }

  async getOrderById(id: string): Promise<Order> {
    try {
      return this.orderModel.findById(id).exec();
    } catch (error) {
      console.log(error);
    }
  }

  async getOrderByTrackingNumber(id: string): Promise<Order> {
    try {
      return this.orderModel.findOne({ tracking_number: id }).exec();
    } catch (error) {
      console.log(error);
    }
  }

  async update(id: string, updateOrderInput: UpdateOrderDto) {
    return this.orderModel
      .findByIdAndUpdate(id, updateOrderInput, { new: true })
      .exec();
  }

  async remove(id: string): Promise<any> {
    return this.orderModel.findByIdAndDelete(id).exec();
  }

  verifyCheckout(input: CheckoutVerificationDto): VerifiedCheckoutData {
    return {
      total_tax: 0,
      shipping_charge: 0,
      unavailable_products: [],
      wallet_currency: 0,
      wallet_amount: 0,
    };
  }

  async getOrderStatuses({
    limit,
    page,
    search,
    orderBy,
    sortedBy,
  }: GetOrderStatusesDto) {
    const skip = (page - 1) * limit;
    const query = getSearchQuery(search);

    const sort: any = {
      [orderBy]: sortedBy.toLowerCase() === 'desc' ? -1 : 1,
    };

    const [orderStatuses, totalCount] = await Promise.all([
      this.orderStatusModel
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.orderStatusModel.countDocuments(query).exec(),
    ]);
    const url = `/order-status?search=${search}&limit=${limit}`;

    return {
      data: orderStatuses,
      ...paginate(totalCount, page, limit, orderStatuses.length, url),
    };
  }

  getOrderStatus(slug: string, language: string) {
    return this.orderStatusModel.findOne({ slug: slug }).exec();
  }

  async createOrderStatus(createOrderStatusInput: CreateOrderStatusDto) {
    const orderStatus = await this.orderStatusModel.create(
      createOrderStatusInput,
    );
    return orderStatus;
  }

  updateOrderStatus(id: string, updateOrderStatusInput: UpdateOrderStatusDto) {
    return this.orderStatusModel
      .findByIdAndUpdate(id, updateOrderStatusInput, { new: true })
      .exec();
  }

  async getOrderFileItems({ page, limit }: GetOrderFilesDto) {
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = orderFiles.slice(startIndex, endIndex);

    const url = `/downloads?&limit=${limit}`;
    return {
      data: results,
      ...paginate(orderFiles.length, page, limit, results.length, url),
    };
  }

  async getDigitalFileDownloadUrl(digitalFileId: number) {
    const item: OrderFiles = this.orderFiles.find(
      (singleItem) => singleItem.digital_file_id === digitalFileId,
    );

    return item.file.url;
  }

  async exportOrder(shop_id: string) {
    return exportOrderJson.url;
  }

  async downloadInvoiceUrl(shop_id: string) {
    return orderInvoiceJson[0].url;
  }

  /**
   * helper methods from here
   */

  /**
   * this method will process children of Order Object
   * @param order
   * @returns Children[]
   */
  processChildrenOrder(order: OrderEntitry) {
    return [...order.children].map((child) => {
      child.order_status = order.order_status;
      child.payment_status = order.payment_status;
      return child;
    });
  }
  /**
   * This action will return Payment Intent
   * @param order
   * @param setting
   */
  async processPaymentIntent(
    order: Order,
    setting: Setting,
  ): Promise<PaymentIntent> {
    const paymentIntent = paymentIntents.find(
      (intent: PaymentIntent) =>
        intent.tracking_number === order.tracking_number &&
        intent.payment_gateway.toString().toLowerCase() ===
          setting.options.paymentGateway.toString().toLowerCase(),
    );
    if (paymentIntent) {
      return paymentIntent;
    }
    const {
      id: payment_id,
      client_secret = null,
      redirect_url = null,
      customer = null,
    } = await this.savePaymentIntent(order, setting.options.paymentGateway);
    const is_redirect = redirect_url ? true : false;
    const paymentIntentInfo: PaymentIntent = {
      id: Number(Date.now()),
      order_id: order.id,
      tracking_number: order.tracking_number,
      payment_gateway: order.payment_gateway.toString().toLowerCase(),
      payment_intent_info: {
        client_secret,
        payment_id,
        redirect_url,
        is_redirect,
      },
    };

    /**
     * Commented below code will work for real database.
     * if you uncomment this for json will arise conflict.
     */

    // paymentIntents.push(paymentIntentInfo);
    // const paymentGateway: PaymentGateWay = {
    //   id: Number(Date.now()),
    //   user_id: this.authService.me().id,
    //   customer_id: customer,
    //   gateway_name: setting.options.paymentGateway,
    //   created_at: new Date(),
    //   updated_at: new Date(),
    // };
    // paymentGateways.push(paymentGateway);

    return paymentIntentInfo;
  }

  /**
   * Trailing method of ProcessPaymentIntent Method
   *
   * @param order
   * @param paymentGateway
   */
  async savePaymentIntent(order: Order, paymentGateway?: string): Promise<any> {
    const me = this.authService.me();
    switch (order.payment_gateway) {
      case PaymentGatewayType.STRIPE:
        const paymentIntentParam =
          await this.stripeService.makePaymentIntentParam(order, me);
        return await this.stripeService.createPaymentIntent(paymentIntentParam);
      case PaymentGatewayType.PAYPAL:
        // here goes PayPal
        return this.paypalService.createPaymentIntent(order);
        break;

      default:
        //
        break;
    }
  }

  /**
   *  Route {order/payment} Submit Payment intent here
   * @param order
   * @param orderPaymentDto
   */
  async stripePay(order: Order) {
    this.orderModel['order_status'] = OrderStatusType.PROCESSING;
    this.orderModel['payment_status'] = PaymentStatusType.SUCCESS;
    this.orderModel['payment_intent'] = null;
  }

  async paypalPay(order: Order) {
    order['order_status'] = OrderStatusType.PROCESSING;
    order['payment_status'] = PaymentStatusType.SUCCESS;
    const { status } = await this.paypalService.verifyOrder(
      order.payment_intent.payment_intent_info.payment_id,
    );
    order['payment_intent'] = null;
    if (status === 'COMPLETED') {
      //console.log('payment Success');
    }
  }

  /**
   * This method will set order status and payment status
   * @param orderStatus
   * @param paymentStatus
   */
  changeOrderPaymentStatus(
    order: Order,
    orderStatus: OrderStatusType,
    paymentStatus: PaymentStatusType,
  ) {
    order['order_status'] = orderStatus;
    order['payment_status'] = paymentStatus;
  }
}
