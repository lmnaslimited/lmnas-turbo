import { NextRequest, NextResponse } from 'next/server';

export async function verifyAuthenticity(request: NextRequest) {

  // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  const LFrappeUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;
  
  const LdsidCookie = request.cookies.get('sid');
  // Reject unauthenticated requests before making any backend calls.
  if (!LdsidCookie || !LdsidCookie.value) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const LdCookieHeader = request.headers.get('cookie') || '';

  try {
    // Verify that the session cookie still represents an authenticated Frappe user.
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

   // Treat missing or guest sessions as unauthenticated.
    if (!LUserEmail || LUserEmail === 'Guest') {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // construct the params for fetching full_name and profile picture
    // of the authorized user from Frappe site
    const LdParams = new URLSearchParams({
      doctype: "User",
      filters: JSON.stringify({
        name: LUserEmail,
      }),
      fieldname: JSON.stringify(["full_name", "user_image"]),
    });
    
    
    // Retrieve the minimal profile information required by the frontend.
    // like full_name and profile picture
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

    // Return a frontend-friendly representation of the authenticated user.
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