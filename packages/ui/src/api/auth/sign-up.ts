import { NextResponse } from 'next/server';

export async function signUp(request: Request) {

  // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  const LFrappeUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;

  try {
    const { username, email } = await request.json();

    const LdFrappeResponse = await fetch(`${LFrappeUrl}/api/method/frappe.core.doctype.user.user.sign_up`, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ 
        full_name: username, 
        email,
        redirect_to: ""
      }),
    });

    if (!LdFrappeResponse.ok) {
      const error = await LdFrappeResponse.text(); // or response.json()
      console.log(error);
      const errorData = await LdFrappeResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Failed to create account" }, 
        { status: LdFrappeResponse.status }
      );
    }

    const LdData = await LdFrappeResponse.json();
    return NextResponse.json(LdData);

  } catch (err) {
    console.error('BFF Sign Up Proxy Failure:', err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
