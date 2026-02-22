import type { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import '@/assets/css/main.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { ModalProvider } from '@/components/ui/modal/modal.context';
import ManagedModal from '@/components/ui/modal/managed-modal';
import ManagedDrawer from '@/components/ui/drawer/managed-drawer';
import DefaultSeo from '@/components/seo/default-seo';
import { SearchProvider } from '@/components/ui/search/search.context';
import PrivateRoute from '@/lib/private-route';
import { CartProvider } from '@/store/quick-cart/cart.context';
import { NextPageWithLayout } from '@/types';
import QueryProvider from '@/framework/client/query-provider';
import { getDirection } from '@/lib/constants';
import { useRouter } from 'next/router';
import { TenantProvider } from '@/contexts/tenant.context';

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function CustomApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page);
  const authenticationRequired = Component.authenticationRequired ?? false;
  const { locale } = useRouter();
  const dir = getDirection(locale);

  return (
    <div dir={dir}>
      <QueryProvider pageProps={pageProps}>
        <TenantProvider>
          <SearchProvider>
            <ModalProvider>
              <CartProvider>
                <>
                  <DefaultSeo />
                  {authenticationRequired ? (
                    <PrivateRoute>{getLayout(<Component {...pageProps} />)}</PrivateRoute>
                  ) : (
                    getLayout(<Component {...pageProps} />)
                  )}
                  <ManagedModal />
                  <ManagedDrawer />
                  <ToastContainer autoClose={2000} theme="colored" />
                </>
              </CartProvider>
            </ModalProvider>
          </SearchProvider>
        </TenantProvider>
      </QueryProvider>
    </div>
  );
}

export default appWithTranslation(CustomApp);
