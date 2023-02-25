import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ManufacturersService } from './manufacturers.service';
import {
  ManufacturersController,
  TopManufacturersController,
} from './manufacturers.controller';
import { Manufacturer, ManufacturerSchema } from './schemas/manufacturer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Manufacturer.name, schema: ManufacturerSchema }]),
  ],
  controllers: [ManufacturersController, TopManufacturersController],
  providers: [ManufacturersService],
})
export class ManufacturersModule {}
