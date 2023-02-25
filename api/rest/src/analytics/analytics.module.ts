import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Analytics, AnalyticsSchema } from './schemas/analytics.schema';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Analytics.name, schema: AnalyticsSchema }])],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}