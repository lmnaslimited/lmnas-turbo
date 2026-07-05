import { NextRequest, NextResponse } from 'next/server';

export async function verifyAuthenticity(request: NextRequest) {

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  const LFrappeUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;
  
  // 1. First Check: Look for 'sid' inside the incoming cookies
  const LdsidCookie = request.cookies.get('sid');
  if (!LdsidCookie || !LdsidCookie.value) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const LdCookieHeader = request.headers.get('cookie') || '';

  try {
    // 2. Step 1: Use get_logged_user to check if they are a valid, active user
    const LdAuthCheck = await fetch(`${LFrappeUrl}/api/method/frappe.auth.get_logged_user`, {
      method: 'GET',
      headers: {
        'Cookie': LdCookieHeader,
        'Accept': 'application/json',
      },
      cache: 'no-store'
    });

    if (!LdAuthCheck.ok) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const LdAuthData = await LdAuthCheck.json();
    const LUserEmail = LdAuthData.message;

    // Safety guard: If Frappe responds with 'Guest' or empty, reject right here
    if (!LUserEmail || LUserEmail === 'Guest') {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const LdParams = new URLSearchParams({
      doctype: "User",
      filters: JSON.stringify({
        name: LUserEmail,
      }),
      fieldname: JSON.stringify(["full_name", "user_image"]),
    });
    
    
    // 3. Step 2: Now that they are 100% verified, fetch their lightweight open profile
    const LdProfileResponse = await fetch(
      `${LFrappeUrl}/api/method/frappe.client.get_value?${LdParams.toString()}`, 
      {
        method: 'GET',
        headers: {
          'Cookie': LdCookieHeader,
          'Accept': 'application/json',
        },
        cache: 'no-store'
      }
    );

    if (!LdProfileResponse.ok) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const LdProfileData = await LdProfileResponse.json();
    const LdUserInfo = LdProfileData.message || {};

    // Clean UI output mapping
    return NextResponse.json({
      user: {
        email: LUserEmail,
        name: LdUserInfo.full_name || LUserEmail.split('@')[0], 
        picture: LdUserInfo.user_image ? `${LdUserInfo.user_image}` : null,
      }
    });

  } catch (err) {
    console.error('BFF Multi-stage validation exception:', err);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}