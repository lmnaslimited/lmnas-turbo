import { NextResponse } from 'next/server';

export async function login(request: Request) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
  const LFrappeUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;
  const LClientId = process.env.NEXT_PUBLIC_FRAPPE_CLIENT_ID;
  
  // Dynamically extract current app domain (handles localhost port variance across monorepo apps)
  const { origin } = new URL(request.url);
  const LRedirectUri = `${origin}/api/auth/callback`;

  // Protect against CSRF tampering
  const LState = Math.random().toString(36).substring(2, 15);

  const LParams = new URLSearchParams({
    client_id: LClientId!,
    redirect_uri: LRedirectUri,
    response_type: 'code',
    scope: 'openid all',
    state: LState,
  });

  const LAuthUrl = `${LFrappeUrl}/api/method/frappe.integrations.oauth2.authorize?${LParams.toString()}`;
  const LdResponse = NextResponse.redirect(LAuthUrl);

  // Cache the temporary validation state string
  LdResponse.cookies.set('oauth_state', LState, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 5, // 5 minutes
    path: '/',
  });

  return LdResponse;
}