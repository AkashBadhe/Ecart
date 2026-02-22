import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TenantDocument = Tenant & Document;

@Schema({ timestamps: true, strict: false })
export class Tenant {
  @Prop({ type: Number, index: true, unique: true, sparse: true })
  id: number;

  /** Numeric shop id this tenant maps to */
  @Prop({ type: Number, required: true, index: true })
  shop_id: number;

  /** Shop slug — also serves as the subdomain identifier */
  @Prop({ type: String, required: true, unique: true, index: true })
  slug: string;

  /** Optional custom domain (e.g. "freshmart.com") */
  @Prop({ type: String, sparse: true, unique: true })
  custom_domain?: string;

  /** Whether this tenant storefront is active */
  @Prop({ type: Boolean, default: true })
  is_active: boolean;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);
