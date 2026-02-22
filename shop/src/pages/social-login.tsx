import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useToken } from '@/lib/hooks/use-token';
import { useAtom } from 'jotai';
import { authorizationAtom } from '@/store/authorization-atom';
import Seo from '@/components/seo/seo';

export default function SocialLoginPage() {
  const router = useRouter();
  const { setToken } = useToken();
  const [, setAuthorized] = useAtom(authorizationAtom);

  useEffect(() => {
    if (!router.isReady) return;

    const token = typeof router.query.token === 'string' ? router.query.token : '';
    const returnTo =
      typeof router.query.return_to === 'string' ? router.query.return_to : '/';

    if (token) {
      setToken(token);
      setAuthorized(true);
      router.replace(returnTo);
      return;
    }

    router.replace('/');
  }, [router, setAuthorized, setToken]);

  return (
    <>
      <Seo noindex={true} nofollow={true} />
      <div className="flex min-h-screen items-center justify-center bg-gray-100 text-sm text-body">
        Signing you in...
      </div>
    </>
  );
}
