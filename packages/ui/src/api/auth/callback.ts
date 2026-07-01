import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function callback(request: NextRequest) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
  const { searchParams, origin } = new URL(request.url);
  const LCode = searchParams.get('code');
  const LState = searchParams.get('state');

  const LSavedState = request.cookies.get('oauth_state')?.value;
  if (!LState || LState !== LSavedState) {
    return NextResponse.json({ error: 'Security verification failed' }, { status: 403 });
  }

  if (!LCode) {
    return NextResponse.json({ error: 'Authorization code missing' }, { status: 400 });
  }

  const LFrappeUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;
  const LRedirectUri = `${origin}/api/auth/callback`;

  try {
    // Exchange temporary code for actual secure tokens
    const LdTokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code: LCode,
      redirect_uri: LRedirectUri,
      client_id: process.env.NEXT_PUBLIC_FRAPPE_CLIENT_ID!,
      client_secret: process.env.FRAPPE_CLIENT_SECRET!,
    });

    const LTokenResponse = await fetch(`${LFrappeUrl}/api/method/frappe.integrations.oauth2.get_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: LdTokenParams.toString(),
    });

    const LdTokenData = await LTokenResponse.json();

    const LAccessToken = LdTokenData.access_token;

    if (!LAccessToken) {
      return NextResponse.json({ error: 'Access token exchange failed' }, { status: 400 });
    }

    // Resolve user data structure map from Frappe
    const LProfileResponse = await fetch(`${LFrappeUrl}/api/method/frappe.integrations.oauth2.openid_profile`, {
      headers: { Authorization: `Bearer ${LAccessToken}` },
    });
    const LdUserData = await LProfileResponse.json();
    const LExpiresIn = LdTokenData.expires_in || 3600; 
    
    // Encrypt identity parameters inside a localized session payload
    const LLocalSessionToken = jwt.sign(
      { email: LdUserData.email, name: LdUserData.name || LdUserData.given_name, picture: LdUserData.picture, },
      process.env.JWT_SECRET!,
      { expiresIn: LExpiresIn }
    );

    const LdResponse = NextResponse.redirect(new URL('/', request.url));
    
    // Drop secure session cookie matching the Identity lifespan
    LdResponse.cookies.set('website_session', LLocalSessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: LExpiresIn,
      path: '/',
    });
    if (LdTokenData.refresh_token) {
      LdResponse.cookies.set('refresh_token', LdTokenData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
    }
    LdResponse.cookies.delete('oauth_state');
    return LdResponse;
  } catch (error) {
    console.error('SSO Process exception:', error);
    return NextResponse.json({ error: 'Internal system fault' }, { status: 500 });
  }
}