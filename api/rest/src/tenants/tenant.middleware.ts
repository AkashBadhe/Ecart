import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantsService } from './tenants.service';

/**
 * TenantMiddleware
 * ────────────────
 * Runs on every incoming request. Resolves the current tenant from:
 *   1. `x-tenant-slug` header   (set by the frontend)
 *   2. `?tenant=<slug>` query   (dev mode / testing)
 *   3. Host header subdomain    (production with wildcard DNS)
 *
 * When resolved, it attaches `req['tenantShopId']` so downstream
 * controllers / services can scope their queries.
 *
 * If no tenant is found the request continues *without* a tenant —
 * this keeps the existing marketplace behaviour working and lets
 * the migration happen gradually.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly tenantsService: TenantsService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    let tenant = null;

    // 1. Explicit header (preferred – frontend sets this via TenantProvider)
    const headerSlug = req.headers['x-tenant-slug'] as string | undefined;
    if (headerSlug) {
      tenant = await this.tenantsService.resolveBySlug(headerSlug);
    }

    // 2. Query param (?tenant=start-quick)
    if (!tenant && req.query.tenant) {
      tenant = await this.tenantsService.resolveBySlug(
        req.query.tenant as string,
      );
    }

    // 3. Subdomain / custom domain from Host header
    if (!tenant) {
      const host = req.headers.host;
      if (host) {
        tenant = await this.tenantsService.resolveByHost(host);
      }
    }

    // Attach to request object for downstream use
    if (tenant) {
      (req as any).tenantShopId = tenant.shop_id;
      (req as any).tenantSlug = tenant.slug;
    }

    next();
  }
}
