import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';
import { Address, AddressSchema } from './schemas/address.schema';

@Module({
  imports: [MongooseModule.forFeature([{name: Address.name, schema: AddressSchema}])],
  controllers: [AddressesController],
  providers: [AddressesService],
})
export class AddressesModule {}
