import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function verfyAuthenticity(request: NextRequest) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    
    // 1. Extract and check for the forced update query parameter
    const { searchParams } = new URL(request.url);
    const LIsForcedRefresh = searchParams.get('force') === 'true';
    
    const LSessionCookie = request.cookies.get('website_session')?.value;
  
    // 2. Add `&& !isForcedRefresh` to ensure we don't recycle unexpired cookies during background updates
    if (LSessionCookie && !LIsForcedRefresh) {
      try {
        const LDecoded = jwt.verify(LSessionCookie, process.env.JWT_SECRET!) as { 
          email: string; 
          name: string; 
          picture?: string;
          exp: number 
        };
        
        const LSecondsLeft = LDecoded.exp - Math.floor(Date.now() / 1000);
  
        return NextResponse.json({ 
          authenticated: true, 
          user: { email: LDecoded.email, name: LDecoded.name, picture: LDecoded.picture, },
          expiresInSeconds: LSecondsLeft 
        });
      } catch (err) {
        // Token expired or invalid, fall through to refresh token verification
      }
    }
  
    // 2. Fallback: Verify the refresh token
    const LRefreshToken = request.cookies.get('refresh_token')?.value;
    if (!LRefreshToken) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
  
    try {
      const LFrappeUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;
  
      const LdTokenParams = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: LRefreshToken,
        client_id: process.env.NEXT_PUBLIC_FRAPPE_CLIENT_ID!,
        client_secret: process.env.FRAPPE_CLIENT_SECRET!,
      });
  
      const LTokenResponse = await fetch(`${LFrappeUrl}/api/method/frappe.integrations.oauth2.get_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: LdTokenParams.toString(),
        cache: 'no-store'
      });
  
      const LTokenData = await LTokenResponse.json();
    
      if (!LTokenData.access_token) {
        throw new Error("Refresh token revoked or expired in Frappe");
      }
  
      const LdProfileResponse = await fetch(`${LFrappeUrl}/api/method/frappe.integrations.oauth2.openid_profile`, {
        headers: { Authorization: `Bearer ${LTokenData.access_token}` },
        cache: 'no-store'
      });
      const LdUserData = await LdProfileResponse.json();
     
      const LExpiresIn = LTokenData.expires_in || 3600;
      
      const LdNewSessionToken = jwt.sign(
        { email: LdUserData.email, name: LdUserData.name || LdUserData.given_name, picture: LdUserData.picture },
        process.env.JWT_SECRET!,
        { expiresIn: LExpiresIn }
      );
  
      const LdResponse = NextResponse.json({
        authenticated: true,
        user: { name: LdUserData.name || LdUserData.given_name, email: LdUserData.email, picture: LdUserData.picture },
        expiresInSeconds: LExpiresIn
      });
  
      LdResponse.cookies.set('website_session', LdNewSessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: LExpiresIn,
        path: '/',
      });

      // Frappe rotates refresh tokens on every refresh request.
      // Persist the latest refresh token so future refresh attempts remain valid.
      if (LTokenData.refresh_token) {
        LdResponse.cookies.set('refresh_token', LTokenData.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
        });
      }
  
      return LdResponse;
    } catch (error) {
      const LdUnAuthResponse = NextResponse.json({ authenticated: false }, { status: 401 });
      LdUnAuthResponse.cookies.delete('website_session');
      LdUnAuthResponse.cookies.delete('refresh_token');
      return LdUnAuthResponse;
    }
  }