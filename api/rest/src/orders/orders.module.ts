import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { PaymentModule } from 'src/payment/payment.module';
import { SettingsModule } from 'src/settings/settings.module';
import { Order, OrderSchema } from './schemas/order.schema';
import { OrderStatus, OrderStatusSchema } from './schemas/order-status.schema';
import { OrderFile, OrderFileSchema } from './schemas/order-file.schema';
import { OrderInvoice, OrderInvoiceSchema } from './schemas/order-invoice.schema';
import { OrderExport, OrderExportSchema } from './schemas/order-export.schema';
import {
  DownloadInvoiceController,
  OrderExportController,
  OrderFilesController,
  OrdersController,
  OrderStatusController,
} from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: OrderStatus.name, schema: OrderStatusSchema },
      { name: OrderFile.name, schema: OrderFileSchema },
      { name: OrderInvoice.name, schema: OrderInvoiceSchema },
      { name: OrderExport.name, schema: OrderExportSchema },
    ]),
    AuthModule,
    PaymentModule,
    SettingsModule,
  ],
  controllers: [
    OrdersController,
    OrderStatusController,
    OrderFilesController,
    OrderExportController,
    DownloadInvoiceController,
  ],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}

