import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant, TenantDocument } from './schemas/tenant.schema';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
  ) {}

  /* ── CRUD ────────────────────────────────────────── */

  async create(dto: CreateTenantDto): Promise<Tenant> {
    const last = await this.tenantModel.findOne().sort({ id: -1 }).exec();
    const nextId = (last?.id ?? 0) + 1;
    return this.tenantModel.create({ ...dto, id: nextId, is_active: dto.is_active ?? true });
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantModel.find().exec();
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    return this.tenantModel.findOne({ slug, is_active: true }).exec();
  }

  async findByCustomDomain(domain: string): Promise<Tenant | null> {
    return this.tenantModel.findOne({ custom_domain: domain, is_active: true }).exec();
  }

  async update(id: number, dto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.tenantModel.findOneAndUpdate(
      { id },
      { $set: dto },
      { new: true },
    ).exec();
    if (!tenant) throw new NotFoundException(`Tenant #${id} not found`);
    return tenant;
  }

  async remove(id: number): Promise<void> {
    await this.tenantModel.deleteOne({ id }).exec();
  }

  /* ── Resolve: the key method used by the middleware & frontend ── */

  /**
   * Given a hostname (e.g. "start-quick.ecart.local" or "freshmart.com"),
   * resolve it to a shop_id.
   *
   * Resolution order:
   *   1. Exact custom_domain match
   *   2. First subdomain segment treated as slug
   *   3. Query param fallback (handled by controller)
   */
  async resolveByHost(hostname: string): Promise<Tenant | null> {
    // Strip port
    const host = hostname.split(':')[0];

    // 1. Try custom domain first
    const byDomain = await this.findByCustomDomain(host);
    if (byDomain) return byDomain;

    // 2. Extract slug from subdomain   e.g. "start-quick.ecart.local" → "start-quick"
    const parts = host.split('.');
    if (parts.length >= 2) {
      const slug = parts[0];
      // Skip common non-tenant subdomains
      if (!['www', 'api', 'admin', 'mail', 'localhost'].includes(slug)) {
        const bySlug = await this.findBySlug(slug);
        if (bySlug) return bySlug;
      }
    }

    return null;
  }

  /**
   * Resolve by slug directly (used for ?tenant=slug query param or frontend dev mode)
   */
  async resolveBySlug(slug: string): Promise<Tenant | null> {
    return this.findBySlug(slug);
  }
}
