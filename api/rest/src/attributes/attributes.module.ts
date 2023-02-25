import { Module } from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { AttributesController } from './attributes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Attribute, AttributeSchema } from './schemas/attribute.schema';

@Module({
  imports: [MongooseModule.forFeature([{name: Attribute.name, schema: AttributeSchema}])],
  controllers: [AttributesController],
  providers: [AttributesService],
})
export class AttributesModule {}
