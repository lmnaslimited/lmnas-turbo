import { NextResponse } from 'next/server';

export async function login(request: Request) {

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


  const LFrappeUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;

  try {
    const { usr, pwd } = await request.json();

    const LdFrappeResponse = await fetch(`${LFrappeUrl}/api/method/login`, {
      method: 'POST',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ usr, pwd }),
    });

    if (!LdFrappeResponse.ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const LdCookies = LdFrappeResponse.headers.getSetCookie(); 
    let LdSidValue: string = ''; 
    let LdMaxAgeSeconds: number = 612000; // Default to 7 days fallback

    const LdFinalResponse = NextResponse.json({ 
      success: true, 
      message: "Logged in", 
      sid: '', 
      expiresInSeconds: LdMaxAgeSeconds 
    });

    // 1. First pass to find the sid and compute exact expiration window
    for (const cookie of LdCookies) {
      if (cookie.trim().startsWith('sid=')) {
        const LdMaxAgeMatch = cookie.match(/Max-Age=(\d+)/i);
        if (LdMaxAgeMatch && LdMaxAgeMatch[1]) {
          LdMaxAgeSeconds = parseInt(LdMaxAgeMatch[1], 10);
        }
        break;
      }
    }

    // 2. Generate the explicit absolute Date object based on the max-age lifespan
    const LdAbsoluteExpiryDate = new Date(Date.now() + LdMaxAgeSeconds * 1000);

    // 3. Loop over every cookie string to drop them cleanly into your browser storage
    for (const cookie of LdCookies) {
      const LdCleanCookie = cookie.trim();
      if (!LdCleanCookie) continue;

      const LdMainParts = LdCleanCookie.split(';');
      const LdKeyValuePair = LdMainParts[0];
      
      if (LdKeyValuePair) {
        const [LdKey, LdValue] = LdKeyValuePair.split('=');
        
        if (LdKey && LdValue) {
          const LdTargetKey = LdKey.trim();
          const LdTargetValue = LdValue.trim();
          const LdIsHttpOnly = LdTargetKey === 'sid';

          if (LdTargetKey === 'sid') {
            LdSidValue = LdTargetValue;
          }

          LdFinalResponse.cookies.set(LdTargetKey, LdTargetValue, {
            path: '/',
            httpOnly: LdIsHttpOnly,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: LdMaxAgeSeconds,      // Relative duration in seconds
            expires: LdAbsoluteExpiryDate, // Absolute expiration timestamp target
          });
        }
      }
    }

    if (!LdSidValue || LdSidValue === '') {
      return NextResponse.json({ error: "Session token not provided by backend" }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Logged in", 
      sid: LdSidValue,
      expiresInSeconds: LdMaxAgeSeconds 
    }, {
      headers: LdFinalResponse.headers 
    });

  } catch (err) {
    console.error('BFF Login Proxy Failure:', err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}