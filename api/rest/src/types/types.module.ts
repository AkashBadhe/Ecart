import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypesService } from './types.service';
import { TypesController } from './types.controller';
import { Type, TypeSchema } from './schemas/type.schema';
import { Product, ProductSchema } from '../products/schemas/products.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Type.name, schema: TypeSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [TypesController],
  providers: [TypesService],
})
export class TypesModule {}
