import { NextResponse } from 'next/server';

export async function resetPassword(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email field is required.' }, { status: 400 });
    }

    const LFrappeUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;
    const LTargetEndpoint = `${LFrappeUrl}/api/method/frappe.core.doctype.user.user.reset_password`;

    // Whitelisted methods in Frappe expect standard form urlencoding parameter matching 'user'
    const LdPayloadBody = new URLSearchParams({ user: email }).toString();

    const LdResponse = await fetch(LTargetEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: LdPayloadBody,
    });

    // We proceed cleanly regardless of whether user exists to mitigate email enumeration vulnerabilities
    if (!LdResponse.ok) {
      console.error(`Frappe password reset interaction failure status: ${LdResponse.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (idError) {
    console.error('Server error during password reset processing:', idError);
    return NextResponse.json(
      { error: 'An unexpected backend connection error occurred.' },
      { status: 500 }
    );
  }
}