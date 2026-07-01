import { NextRequest, NextResponse } from 'next/server';

export async function logout(request: NextRequest) {
  // Disables local SSL verification issues during development
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  
  const LFrappeUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;
  const LClientId = process.env.NEXT_PUBLIC_FRAPPE_CLIENT_ID;
  const LClientSecret = process.env.FRAPPE_CLIENT_SECRET;
  
  const { origin } = new URL(request.url);
  const LRefreshToken = request.cookies.get('refresh_token')?.value;

  if (LRefreshToken) {
    try {
      // Pass client credentials to authorize token deletion from a server context
      const LRevokeParams = new URLSearchParams({
        token: LRefreshToken,
        client_id: LClientId!,
        client_secret: LClientSecret!,
        token_type_hint: 'refresh_token' // Helps Frappe locate the token instantly
      });

      await fetch(
        `${LFrappeUrl}/api/method/frappe.integrations.oauth2.revoke_token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: LRevokeParams.toString(),
        }
      );
    } catch (error) {
      console.error('Refresh token revocation failed:', error);
    }
  }

  // Clear local cookies and bounce back home
  const LdResponse = NextResponse.redirect(new URL('/', origin));
  LdResponse.cookies.delete('website_session');
  LdResponse.cookies.delete('refresh_token');
  
  return LdResponse;
}