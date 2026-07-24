import { NextRequest, NextResponse } from 'next/server';

export async function logout(request: NextRequest) {

  // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  const LFrappeUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;
  const { origin } = new URL(request.url);
  
  // Forward the current browser session so Frappe can identify which user to log out.
  const LdCookieHeader = request.headers.get('cookie') || '';

  // Prepare the response that returns the user to the application's landing page.
  const LdResponse = NextResponse.redirect(new URL('/', origin));

  try {
     // Invalidate the authenticated session on the Frappe server before clearing local cookies.
    await fetch(`${LFrappeUrl}/api/method/logout`, {
      method: 'POST',
      headers: {
        'Cookie': LdCookieHeader,
        'Accept': 'application/json',
      }
    });
  } catch (err) {
    console.error('Frappe native logout signaling failure:', err);
  }

  // Clear all cookies created during authentication to remove the local session.
  const LdCookiesToClear = [
    'sid',
    'system_user',
    'full_name',
    'user_id',
    'user_lang'
  ];

  // Expire each authentication cookie so the browser removes it immediately.
  for (const cookieName of LdCookiesToClear) {
    LdResponse.cookies.set(cookieName, '', {
      path: '/',
      expires: new Date(0), // Force immediate cookie expiration.
      httpOnly: cookieName === 'sid', // Keep httpOnly matching your login constraints
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
  }
  
  return LdResponse;
}