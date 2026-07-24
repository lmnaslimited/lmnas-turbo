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
  // Track the last identified user to avoid sending duplicate identify events to PostHog.
  const LdLastIdentifiedEmailRef = useRef<string | null>(null);

  // Sync PostHog Identity
  useEffect(() => {
    if (user && user.email) {
      // Identify the user only when the authenticated account changes.
      if (LdLastIdentifiedEmailRef.current !== user.email) {
        posthog.identify(user.email, {
          email: user.email,
          name: user.name,
          avatar: user.picture || ''
        });
        // Remember the current user to prevent repeated identify calls.
        LdLastIdentifiedEmailRef.current = user.email;
      }
    } 
    // else {
      // posthog.reset();
      // LdLastIdentifiedEmailRef.current = null;
    // }
  }, [user]);

  // Retrieve the latest signed-in user from the backend.
  async function fnCheckAuthStatus() {
    try {
      const LdResult = await fetch('/api/auth/me', { cache: 'no-store' });
      
      // No valid session was found, so treat the visitor as signed out.
      if (!LdResult.ok) {
        fnSetUser(null);
        return;
      }
      
      const LdData = await LdResult.json();
      // Store the authenticated user's details for use throughout the application.
      fnSetUser(LdData.user);
    } catch (err) {
      // Assume the user is signed out if the authentication check fails.
      console.error('Auth verification failure:', err);
      fnSetUser(null);
    } finally {
      // Finish the initial authentication check so the application can render.
      fnSetLoading(false);
    }
  }

  function logout() {
    // Record the logout event before ending the user's session.
    if (user) {
      posthog.capture('user_logged_out', { email: user.email, name: user.name });
    } else {
      posthog.capture('user_logged_out');
    }

    // Redirect to the logout endpoint to terminate the current session.
    window.location.href = '/api/auth/logout';
  }

  // Check the user's sign-in status when the application loads
  // and whenever it becomes active again.
  useEffect(() => {
    fnCheckAuthStatus();
    
    // // Prevent multiple authentication checks from running within a short time.
    // let LLastRefreshTime = 0;

    // // Refresh the user's sign-in status when the browser tab becomes active.
    // function fnHandleVisibilityOrFocus() {
    //   // Ignore refresh requests while the browser tab is hidden.
    //   if (document.visibilityState !== 'visible') return;
  
    //   const LNow = Date.now();
    //   // Skip repeated refreshes triggered by rapid focus and visibility events.
    //   if (LNow - LLastRefreshTime < 2000) return;
    //   LLastRefreshTime = LNow;  // Remember when the last authentication check was performed.
  
    //   fnCheckAuthStatus();
    // }
  
    // // Monitor browser focus changes to keep the user's sign-in status up to date.
    // window.addEventListener('focus', fnHandleVisibilityOrFocus);
    // document.addEventListener('visibilitychange', fnHandleVisibilityOrFocus);
  
    // // Clean up event listeners when the provider is removed.
    // return () => {
    //   window.removeEventListener('focus', fnHandleVisibilityOrFocus);
    //   document.removeEventListener('visibilitychange', fnHandleVisibilityOrFocus);
    // };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);