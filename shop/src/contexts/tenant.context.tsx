import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';

/* ──────────────────────────────────────────────
 *  Types
 * ────────────────────────────────────────────── */
export interface TenantInfo {
  shop_id: number;
  slug: string;
  custom_domain?: string;
  is_active: boolean;
}

interface TenantContextValue {
  /** The resolved tenant, or null when running in marketplace mode */
  tenant: TenantInfo | null;
  /** True while the initial resolution request is in-flight */
  isLoading: boolean;
  /** True when the shop is operating as a single-tenant storefront */
  isTenantMode: boolean;
}

const TenantContext = createContext<TenantContextValue>({
  tenant: null,
  isLoading: true,
  isTenantMode: false,
});

/* ──────────────────────────────────────────────
 *  Provider
 * ────────────────────────────────────────────── */
export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function resolve() {
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_REST_API_ENDPOINT || 'http://localhost:5050/api';

        // Determine which slug to resolve.
        //   1. NEXT_PUBLIC_TENANT_SLUG env var  (hardcoded for a branded deployment)
        //   2. ?tenant=slug query param         (dev convenience)
        //   3. Subdomain extracted from window.location.hostname
        let slug: string | undefined =
          process.env.NEXT_PUBLIC_TENANT_SLUG || undefined;

        if (!slug && typeof window !== 'undefined') {
          // Check query param
          const urlParams = new URLSearchParams(window.location.search);
          slug = urlParams.get('tenant') || undefined;

          // Fall back to subdomain
          if (!slug) {
            const hostParts = window.location.hostname.split('.');
            if (hostParts.length >= 2) {
              const candidate = hostParts[0];
              if (!['www', 'localhost', 'admin', 'api'].includes(candidate)) {
                slug = candidate;
              }
            }
          }
        }

        // If we have no slug, we stay in marketplace mode
        if (!slug) {
          setTenant(null);
          setIsLoading(false);
          return;
        }

        const res = await fetch(`${apiBase}/tenant/resolve?slug=${slug}`);
        if (res.ok) {
          const data: TenantInfo = await res.json();
          setTenant(data);
          // Store on window so the Axios interceptor can attach the header
          if (typeof window !== 'undefined') {
            (window as any).__TENANT_SLUG__ = data.slug;
          }
        } else {
          console.warn(`[TenantProvider] Could not resolve tenant "${slug}"`);
          setTenant(null);
        }
      } catch (err) {
        console.error('[TenantProvider] Resolution error:', err);
        setTenant(null);
      } finally {
        setIsLoading(false);
      }
    }

    resolve();
    // Re-resolve when route changes (in case ?tenant= param changes)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.tenant]);

  const value = useMemo<TenantContextValue>(
    () => ({
      tenant,
      isLoading,
      isTenantMode: tenant !== null,
    }),
    [tenant, isLoading],
  );

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}

/* ──────────────────────────────────────────────
 *  Hook
 * ────────────────────────────────────────────── */
export function useTenant() {
  return useContext(TenantContext);
}
