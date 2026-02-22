import { CoreEntity } from 'src/common/entities/core.entity';

export class Tenant extends CoreEntity {
  /** Auto-incrementing numeric id */
  id: number;

  /** The shop this tenant maps to (numeric shop id) */
  shop_id: number;

  /** Slug matching the shop's slug – used for subdomain resolution */
  slug: string;

  /** Custom domain (e.g. "myshop.com") — optional */
  custom_domain?: string;

  /** Whether this tenant is currently active */
  is_active: boolean;
}
