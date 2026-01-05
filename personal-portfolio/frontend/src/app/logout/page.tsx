'use client';

import { useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/useAuth';
import { useEffect } from 'react';

export default function LogoutPage() {
  const router = useRouter();
  const [, setToken] = useLocalStorage<string | null>('auth_token', null);

  useEffect(() => {
    setToken(null);
    router.push('/');
  }, [setToken, router]);

  return <div>Logging out...</div>;
}
