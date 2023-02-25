import { PickType } from '@nestjs/swagger';
import { Analytics } from '../entities/analytics.entity';

export class CreateAnalyticsDto extends PickType(Analytics, [
  'totalRevenue',
  'totalShops',
  'todaysRevenue',
  'totalOrders',
  'newCustomers',
  'totalYearSaleByMonth'
]) {
  
}