import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { TypesService } from './types.service';
import { CreateTypeDto } from './dto/create-type.dto';
import { UpdateTypeDto } from './dto/update-type.dto';
import { GetTypesDto } from './dto/get-types.dto';

@Controller('types')
export class TypesController {
  constructor(private readonly typesService: TypesService) {}

  @Post()
  create(@Body() createTypeDto: CreateTypeDto) {
    return this.typesService.create(createTypeDto);
  }

  @Get()
  findAll(@Query() query: GetTypesDto, @Req() req: Request) {
    const tenantShopId = (req as any).tenantShopId as number | undefined;
    return this.typesService.getTypes(query, tenantShopId);
  }

  @Get(':slug')
  getTypeBySlug(@Param('slug') slug: string) {
    return this.typesService.getTypeBySlug(slug);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTypeDto: UpdateTypeDto) {
    return this.typesService.update(+id, updateTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.typesService.remove(+id);
  }
}
