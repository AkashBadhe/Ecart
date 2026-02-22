import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTenantDto {
  @IsNumber()
  shop_id: number;

  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  custom_domain?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
