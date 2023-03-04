import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { SortOrder } from 'src/common/dto/generic-conditions.dto';
import { Order } from '../entities/order.entity';

export class OrderPaginator extends Paginator<Order> {
  data: Order[];
}

export class GetOrdersDto extends PaginationArgs {
  tracking_number?: string;
  orderBy?: string;
  orderByDirection?: SortOrder;
  customer_id?: number;
  shop_id?: string;
  search?: string;
}


export enum QueryOrdersOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  NAME = 'NAME',
  UPDATED_AT = 'UPDATED_AT',
}
