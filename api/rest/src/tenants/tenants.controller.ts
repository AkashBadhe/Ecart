import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  NotFoundException,
  Headers,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

/* ──────────────────────────────────────────────
 *  CRUD – /api/tenants
 * ────────────────────────────────────────────── */
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  @Get()
  findAll() {
    return this.tenantsService.findAll();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.tenantsService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(+id);
  }
}

/* ──────────────────────────────────────────────
 *  Resolve – GET /api/tenant/resolve
 *
 *  Three resolution strategies (tried in order):
 *    1. ?slug=start-quick            (explicit, used by frontend in dev mode)
 *    2. ?domain=freshmart.com        (custom-domain lookup)
 *    3. Host header subdomain parse  (production mode)
 *
 *  Returns: { shop_id, slug, custom_domain?, is_active }
 * ────────────────────────────────────────────── */
@Controller('tenant')
export class TenantResolveController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('resolve')
  async resolve(
    @Query('slug') slug?: string,
    @Query('domain') domain?: string,
    @Headers('host') host?: string,
  ) {
    let tenant = null;

    // Strategy 1: explicit slug
    if (slug) {
      tenant = await this.tenantsService.resolveBySlug(slug);
    }

    // Strategy 2: explicit domain
    if (!tenant && domain) {
      tenant = await this.tenantsService.findByCustomDomain(domain);
    }

    // Strategy 3: derive from Host header
    if (!tenant && host) {
      tenant = await this.tenantsService.resolveByHost(host);
    }

    if (!tenant) {
      throw new NotFoundException(
        'Tenant not found. Use ?slug=<shop-slug> or configure a custom domain.',
      );
    }

    return {
      shop_id: tenant.shop_id,
      slug: tenant.slug,
      custom_domain: tenant.custom_domain,
      is_active: tenant.is_active,
    };
  }
}
