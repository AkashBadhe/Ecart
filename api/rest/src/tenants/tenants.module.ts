import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tenant, TenantSchema } from './schemas/tenant.schema';
import { TenantsService } from './tenants.service';
import { TenantsController, TenantResolveController } from './tenants.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tenant.name, schema: TenantSchema }]),
  ],
  controllers: [TenantsController, TenantResolveController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
