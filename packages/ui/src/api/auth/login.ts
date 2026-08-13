import { NextRequest, NextResponse } from 'next/server';
import { setLmnasSession } from './session';
import { TEnvSource } from '@repo/middleware/types';

function requiredUrl(iEnv: TEnvSource): string {
  const LValue = iEnv.env.platformUrl || process.env.NEXT_PUBLIC_FRAPPE_URL;

  if (!LValue) {
    throw new Error('NEXT_PUBLIC_FRAPPE_URL is not configured');
  }

  return LValue.replace(/\/+$/, '');
}

function cookieHeader(setCookies: string[]): string {
  return setCookies
    .map((cookie) => cookie.split(';', 1)[0])
    .filter(Boolean)
    .join('; ');
}

export async function login(request: NextRequest, iEnv: TEnvSource) {
  const LLensCloudUrl = requiredUrl(iEnv);

  try {
    const { usr, pwd } = await request.json();

    if (!usr?.trim() || !pwd) {
      return NextResponse.json(
        {
          error: 'Email and password are required',
        },
        {
          status: 400,
        },
      );
    }

    const LdLoginResponse = await fetch(
      `${LLensCloudUrl}/api/method/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          usr: usr.trim(),
          pwd,
        }),
        cache: 'no-store',
      },
    );


    if (!LdLoginResponse.ok) {
      return NextResponse.json(
        {
          error: 'The email or password you entered is incorrect',
        },
        {
          status: 401,
        },
      );
    }


    const LTemporaryCookies = cookieHeader(
      LdLoginResponse.headers.getSetCookie(),
    );


    if (!LTemporaryCookies) {
      return NextResponse.json(
        {
          error: 'We couldn\'t start your session. Please try again.',
        },
        {
          status: 502,
        },
      );
    }


    // Get authenticated user email
    const LdUserResponse = await fetch(
      `${LLensCloudUrl}/api/method/frappe.auth.get_logged_user`,
      {
        headers: {
          Cookie: LTemporaryCookies,
          Accept: 'application/json',
        },
        cache: 'no-store',
      },
    );


    const LdUserData = await LdUserResponse.json();

    const LEmail = LdUserData.message;


    if (
      !LEmail ||
      LEmail === 'Guest'
    ) {
      return NextResponse.json(
        {
          error: 'We couldn\'t verify your account. Please try again.',
        },
        {
          status: 502,
        },
      );
    }


    // Fetch profile information
    const LdParams = new URLSearchParams({
      doctype: 'User',
      filters: JSON.stringify({
        name: LEmail,
      }),
      fieldname: JSON.stringify([
        'full_name',
        'user_image',
      ]),
    });


    const LdProfileResponse = await fetch(
      `${LLensCloudUrl}/api/method/frappe.client.get_value?${LdParams}`,
      {
        headers: {
          Cookie: LTemporaryCookies,
          Accept: 'application/json',
        },
        cache: 'no-store',
      },
    );


    const LdProfileData = await LdProfileResponse.json();

    const LdProfile = LdProfileData.message || {};


    // Logout temporary Frappe session
    await fetch(
      `${LLensCloudUrl}/api/method/logout`,
      {
        method: 'POST',
        headers: {
          Cookie: LTemporaryCookies,
          Accept: 'application/json',
        },
        cache: 'no-store',
      },
    );


    const LdResponse = NextResponse.json({
      success: true,
      user: {
        email: LEmail,
        name: LdProfile.full_name || LEmail.split('@')[0],
        picture: LdProfile.user_image || null,
      },
    });


    setLmnasSession(LdResponse, {
      email: LEmail,
      name: LdProfile.full_name || LEmail.split('@')[0],
      picture: LdProfile.user_image || null,
    });


    return LdResponse;


  } catch (error) {
    console.error(
      'LMNAS login failure:',
      error,
    );


    return NextResponse.json(
      {
        error: 'Something went wrong while signing you in. Please try again in a moment.',
      },
      {
        status: 500,
      },
    );
  }
}