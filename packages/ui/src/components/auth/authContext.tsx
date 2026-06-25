'use client';

import posthog from 'posthog-js';
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { boolean } from 'zod';

interface IUserProfile {
  name: string;
  email: string;
  picture: string;
}

interface AuthContextProps {
  user: IUserProfile | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, fnSetUser] = useState<IUserProfile | null>(null);
  const [loading, fnSetLoading] = useState<boolean>(true);
 
  const LdTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cache to track the last identified user and prevent repetitive PostHog calls during token rotation
  const LdLastIdentifiedEmailRef = useRef<string | null>(null);

  // ------------------------------------------------------------------------
  // POSTHOG INITIALISATION & SYNCHRONISATION LOOP
  // ------------------------------------------------------------------------
  useEffect(() => {
    if (user && user.email) {
      // Trigger identification ONLY if it's a new login or page reload
      if (LdLastIdentifiedEmailRef.current !== user.email) {
        posthog.identify(user.email, {
          email: user.email,
          name: user.name,
          avatar: user.picture || ''
        });
        
        // Lock it in so background 10-second updates skip this execution block
        LdLastIdentifiedEmailRef.current = user.email;
      }
    } else {
      // Clear identity on logout so subsequent actions are untracked/anonymous
      posthog.reset();
      LdLastIdentifiedEmailRef.current = null;
    }
  }, [user]);
  // ------------------------------------------------------------------------


// async function fnRefreshAuthLifecycle(forceRefresh = false) {
//     try {
//       // 1. Target endpoint changes based on whether this call was scheduled or an initial mount
//       const LTargetUrl = forceRefresh ? '/api/auth/me?force=true' : '/api/auth/me';
//       const LdResult = await fetch(LTargetUrl, { cache: 'no-store' });
      
//       if (LdResult.ok) {
//         const LdData = await LdResult.json();
//         fnSetUser(LdData.user);
  
//         // 2. Tighten cushion window for 1-minute test cycles
//         const LSafetyCushionSeconds = 60; 
//         const LDelayMs = (LdData.expiresInSeconds - LSafetyCushionSeconds) * 1000;
  
//         if (LdTimeoutRef.current) clearTimeout(LdTimeoutRef.current);
  
//         if (LDelayMs > 0) {
//           LdTimeoutRef.current = setTimeout(() => {
//             fnRefreshAuthLifecycle(true); // 3. Trigger true token rotation on timeout fire
//           }, LDelayMs);
//         } else {
//           // 4. Defensive boundary: if network lag puts us past the cushion, wait 10 seconds before retry
//           LdTimeoutRef.current = setTimeout(() => {
//             fnRefreshAuthLifecycle(true);
//           }, 10000);
//         }
//       } else {
//         fnSetUser(null);
//       }
//     } catch (err) {
//       console.error('Lifecycle dynamic manager failure:', err);
//       fnSetUser(null);
//     }
//   }

// Inside your AuthProvider component in apps/web/context/AuthContext.tsx

  async function fnRefreshAuthLifecycle(forceRefresh = false) {
    try {
      const LTargetUrl = `/api/auth/me${forceRefresh ? '?force=true' : ''}`;
      const LdResult = await fetch(LTargetUrl, { cache: 'no-store' });
      
      // 1. Guard Clause: If server errors or user is missing, clear state and STOP
      if (!LdResult.ok) {
        fnSetUser(null);
        fnSetLoading(false); // 2. Turn off loading if call fails
        return;
      }
      
      const LdData = await LdResult.json();
      fnSetUser(LdData.user);
      fnSetLoading(false); // 3. Turn off loading when user data finishes resolving

      if (!LdData.user) return;

      // 2. Clear old timer
      if (LdTimeoutRef.current) clearTimeout(LdTimeoutRef.current);

      // // 3. One-Line Timer: Refresh 60 seconds early. If time is already up, fallback to 10 seconds.
      // const LDelayMs = (LdData.expiresInSeconds - 60) * 1000;
      // const LSafeDelayMs = LDelayMs > 0 ? LDelayMs : 10000;

      // LdTimeoutRef.current = setTimeout(() => fnRefreshAuthLifecycle(true), LSafeDelayMs);
      const LSecondsLeft = LdData.expiresInSeconds;

      // 🌟 THE SLEEP BUG FIX:
      if (LSecondsLeft > 60) {
        // Safe zone: Schedule a background refresh exactly 60 seconds before expiration
        const LDelayMs = (LSecondsLeft - 60) * 1000;
        LdTimeoutRef.current = setTimeout(() => fnRefreshAuthLifecycle(true), LDelayMs);
      } else {
        // Critical zone: Laptop just woke up from sleep and token is expiring right now.
        // Instantly force a true rotation cycle instead of waiting or looping!
        fnRefreshAuthLifecycle(true);
      }

    } catch (err) {
      console.error('Lifecycle dynamic manager failure:', err);
      fnSetUser(null);
      fnSetLoading(false); // 4. Turn off loading if network crashes
    }
  }

  function logout() {
    // Explicitly track the logout action inside PostHog with user traits attached
    if (user) {
      posthog.capture('user_logged_out', {
        email: user.email,
        name: user.name
      });
    } else {
      posthog.capture('user_logged_out');
    }

    if (LdTimeoutRef.current) clearTimeout(LdTimeoutRef.current);
    window.location.href = '/api/auth/logout';
  }

  useEffect(() => {
    fnRefreshAuthLifecycle();
  
    let LLastRefreshTime = 0;
  
    // Revalidate authentication whenever the user returns to the tab.
    // This protects against missed refresh timers caused by laptop sleep
    // or browser tab suspension.
    // function fnHandleVisibilityOrFocus() {
    //   if (document.visibilityState !== 'visible') return;
  
    //   const LNow = Date.now();
  
    //   // Prevent duplicate refresh requests when focus and visibility events
    //   // fire back-to-back during the same tab activation.
    //   if (LNow - LLastRefreshTime < 2000) return;
  
    //   LLastRefreshTime = LNow;
  
    //   // Force a server-side auth verification using the refresh token if needed.
    //   fnRefreshAuthLifecycle(true);
    // }

    function fnHandleVisibilityOrFocus() {
      if (document.visibilityState !== 'visible') return;
  
      const LNow = Date.now();
      // Throttle rapid double-firing from browser tab switching
      if (LNow - LLastRefreshTime < 2000) return;
      LLastRefreshTime = LNow;
  
      // TAB FOCUS FIX: Check current session state naturally. 
      // Do not hard-force a rotation unless the lifecycle manager above evaluates a true need.
      fnRefreshAuthLifecycle(false);
    }
  
    window.addEventListener('focus', fnHandleVisibilityOrFocus);
    document.addEventListener('visibilitychange', fnHandleVisibilityOrFocus);
  
    return () => {
      if (LdTimeoutRef.current) {
        clearTimeout(LdTimeoutRef.current);
      }
  
      // window.removeEventListener('focus', fnHandleVisibilityOrFocus);
      // document.removeEventListener('visibilitychange', fnHandleVisibilityOrFocus);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);


