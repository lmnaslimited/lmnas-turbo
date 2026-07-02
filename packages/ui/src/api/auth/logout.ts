import { NextRequest, NextResponse } from 'next/server';

export async function logout(request: NextRequest) {
  if (process.env.NODE_ENV !== 'production') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  }

  const LFrappeUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;
  const { origin } = new URL(request.url);
  
  // Capture all incoming browser cookies to pass the session payload to Frappe
  const LdCookieHeader = request.headers.get('cookie') || '';

  // Setup the clean redirection response back to the landing homepage '/'
  const LdResponse = NextResponse.redirect(new URL('/', origin));

  try {
    // 1. Tell Frappe's backend session manager to instantly destroy the server session
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

  // 2. Define the exact cookie names that were set during login
  const LdCookiesToClear = [
    'sid',
    'system_user',
    'full_name',
    'user_id',
    'user_lang'
  ];

  // 3. Loop over the array and explicitly expire each one from the browser storage
  for (const cookieName of LdCookiesToClear) {
    LdResponse.cookies.set(cookieName, '', {
      path: '/',
      expires: new Date(0), // Sets expiration to Jan 1, 1970, forcing instant deletion
      httpOnly: cookieName === 'sid', // Keep httpOnly matching your login constraints
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
  }
  
  return LdResponse;
}