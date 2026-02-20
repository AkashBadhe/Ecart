import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaxesService } from './taxes.service';
import { TaxesController } from './taxes.controller';
import { Tax, TaxSchema } from './schemas/tax.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Tax.name, schema: TaxSchema }])],
  controllers: [TaxesController],
  providers: [TaxesService],
})
export class TaxesModule {}
