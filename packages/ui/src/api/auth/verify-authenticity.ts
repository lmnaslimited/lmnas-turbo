import { NextRequest, NextResponse } from 'next/server';

export async function verifyAuthenticity(request: NextRequest) {
  if (process.env.NODE_ENV !== 'production') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  }

  const LFrappeUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;
  const LdCookieHeader = request.headers.get('cookie') || '';

  try {
    // 1. Invoke your specific custom endpoint
    const LdAuthCheck = await fetch(`${LFrappeUrl}/api/method/brandkit.setup.current_user`, {
      method: 'GET',
      headers: {
        'Cookie': LdCookieHeader,
        'Accept': 'application/json',
      },
      cache: 'no-store'
    });

    if (!LdAuthCheck.ok) {
      return NextResponse.json({ user: null });
    }

    const LdAuthData = await LdAuthCheck.json();
    const { user: LUserEmail, authenticated: LIsAuthenticated } = LdAuthData.message || {};

    if (!LIsAuthenticated || LUserEmail === 'Guest') {
      return NextResponse.json({ user: null });
    }

    // 2. Resolve complete metadata details for UI execution mapping
    const LdProfileResponse = await fetch(`${LFrappeUrl}/api/resource/User/${LUserEmail}?fields=["full_name","email"]`, {
      method: 'GET',
      headers: {
        'Cookie': LdCookieHeader,
        'Accept': 'application/json',
      },
      cache: 'no-store'
    });

    if (!LdProfileResponse.ok) {
      return NextResponse.json({ user: null });
    }

    const LdProfileData = await LdProfileResponse.json();
    const LdUserDoc = LdProfileData.data;
    return NextResponse.json({
      user: {
        email: LdUserDoc.email,
        name: LdUserDoc.full_name,
        picture: LdUserDoc.user_image || null,
      }
    });

  } catch (err) {
    console.error('BFF Session validation exception:', err);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}