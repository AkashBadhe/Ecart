import { UpdateAnalyticsDto } from './dto/update-analytics.dto';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { Analytics } from './schemas/analytics.schema';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post()
  async create(@Body() createAnalyticsDto: CreateAnalyticsDto): Promise<Analytics> {
    return this.analyticsService.create(createAnalyticsDto);
  }

  @Get()
  async findAll(): Promise<Analytics[]> {
    return this.analyticsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Analytics> {
    return this.analyticsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAnalyticsDto: UpdateAnalyticsDto,
  ): Promise<Analytics> {
    return this.analyticsService.update(id, updateAnalyticsDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Analytics> {
    return this.analyticsService.remove(id);
  }
}
