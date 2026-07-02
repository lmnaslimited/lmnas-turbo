'use client';

import { TAuthContextProps, TUserProfile } from '@repo/middleware/types';
import posthog from 'posthog-js';
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

const AuthContext = createContext<TAuthContextProps>({
  user: null,
  loading: true,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, fnSetUser] = useState<TUserProfile | null>(null);
  const [loading, fnSetLoading] = useState<boolean>(true);
  const LdLastIdentifiedEmailRef = useRef<string | null>(null);

  // Sync PostHog Identity
  useEffect(() => {
    if (user && user.email) {
      if (LdLastIdentifiedEmailRef.current !== user.email) {
        posthog.identify(user.email, {
          email: user.email,
          name: user.name,
          avatar: user.picture || ''
        });
        LdLastIdentifiedEmailRef.current = user.email;
      }
    } else {
      posthog.reset();
      LdLastIdentifiedEmailRef.current = null;
    }
  }, [user]);

  // Main validator targeting your Next.js BFF proxy
  async function fnCheckAuthStatus() {
    try {
      const LdResult = await fetch('/api/auth/me', { cache: 'no-store' });
      
      if (!LdResult.ok) {
        fnSetUser(null);
        return;
      }
      
      const LdData = await LdResult.json();
      fnSetUser(LdData.user);
    } catch (err) {
      console.error('Auth verification failure:', err);
      fnSetUser(null);
    } finally {
      fnSetLoading(false);
    }
  }

  function logout() {
    if (user) {
      posthog.capture('user_logged_out', { email: user.email, name: user.name });
    } else {
      posthog.capture('user_logged_out');
    }
    window.location.href = '/api/auth/logout';
  }

  useEffect(() => {
    fnCheckAuthStatus();
  
    let LLastRefreshTime = 0;
    function fnHandleVisibilityOrFocus() {
      if (document.visibilityState !== 'visible') return;
  
      const LNow = Date.now();
      if (LNow - LLastRefreshTime < 2000) return;
      LLastRefreshTime = LNow;
  
      fnCheckAuthStatus();
    }
  
    window.addEventListener('focus', fnHandleVisibilityOrFocus);
    document.addEventListener('visibilitychange', fnHandleVisibilityOrFocus);
  
    return () => {
      window.removeEventListener('focus', fnHandleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', fnHandleVisibilityOrFocus);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);