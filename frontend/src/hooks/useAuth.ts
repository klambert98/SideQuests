import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Decode JWT without verification (client-side check only)
function decodeJWT(token: string): { exp?: number; userId?: string } | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;

  // Check if token expires in next 5 minutes (for safety margin)
  const expirationTime = decoded.exp * 1000;
  const now = Date.now();
  return now >= expirationTime - 5 * 60 * 1000;
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.log(error);
      }
    },
    [key, storedValue]
  );

  // Load from localStorage on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      }
    } catch (error) {
      console.log(error);
    }
  }, [key]);

  return [storedValue, setValue] as const;
}

export function useAuth() {
  const [token, setToken] = useLocalStorage<string | null>('auth_token', null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (token) {
      // Check if token is expired before verifying
      if (isTokenExpired(token)) {
        console.warn('Token expired, logging out');
        setToken(null);
        setUser(null);
        router.push('/login');
        return;
      }

      // Verify token is still valid by fetching user
      const verifyAuth = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            setToken(null);
            setUser(null);
            if (response.status === 401 || response.status === 403) {
              router.push('/login');
            }
          }
        } catch (error) {
          console.error('Auth verification failed:', error);
        }
      };

      verifyAuth();

      // Set up automatic logout when token expires
      const decoded = decodeJWT(token);
      if (decoded?.exp) {
        const expirationTime = decoded.exp * 1000;
        const now = Date.now();
        const timeUntilExpiration = expirationTime - now;

        if (timeUntilExpiration > 0) {
          const logoutTimer = setTimeout(() => {
            console.warn('Token expired, logging out');
            setToken(null);
            setUser(null);
            router.push('/login');
          }, timeUntilExpiration);

          return () => clearTimeout(logoutTimer);
        }
      }
    } else {
      setUser(null);
    }
  }, [token, setToken, router]);

  return { token, user, isAuthenticated: !!token };
}
