import { NewslettersService } from './newsletters.service';
import { CreateNewSubscriberDto } from './dto/create-new-subscriber.dto';
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';

@Controller('subscribe-to-newsletter')
export class NewslettersController {
  constructor(private readonly newsletterService: NewslettersService) {}

  @Post()
  create(@Body() createNewsletterDto: CreateNewSubscriberDto) {
    return this.newsletterService.create(createNewsletterDto);
  }

  @Get()
  findAll() {
    return this.newsletterService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.newsletterService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateNewsletterDto: any) {
    return this.newsletterService.update(id, updateNewsletterDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.newsletterService.delete(id);
  }
}
