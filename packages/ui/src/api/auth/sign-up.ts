import { TEnvSource } from '@repo/middleware/types';
import { NextResponse } from 'next/server';

export async function signUp(request: Request, iEnv:TEnvSource) {

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  const LFrappeUrl = iEnv.env.platformUrl || process.env.NEXT_PUBLIC_FRAPPE_URL;

  try {
    const { username, email } = await request.json();

    // Frappe whitelist method for sign up, here full_name, email and redirect_to is mandatory
    const LdFrappeResponse = await fetch(`${LFrappeUrl}/api/method/frappe.core.doctype.user.user.sign_up`, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ 
        full_name: username, 
        email,
        redirect_to: "" // by default frappe avoid sub or other domain redirect internally and fall back it redirect back to desk 
      }),
    });

    if (!LdFrappeResponse.ok) {
      // Preserve the error returned by Frappe so the frontend receives the original failure reason.
      const errorData = await LdFrappeResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Failed to create account" }, 
        { status: LdFrappeResponse.status }
      );
    }
    // Forward Frappe's successful registration response without modification.
    const LdData = await LdFrappeResponse.json();
    return NextResponse.json(LdData);

  } catch (err) {
    console.error('BFF Sign Up Proxy Failure:', err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
