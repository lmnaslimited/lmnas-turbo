import { NextResponse } from 'next/server';

export async function loginViaGoogle(request:Request) {
  try {
    const LFrappeUrl = process.env.NEXT_PUBLIC_FRAPPE_DOMAIN;
    // Dynamically capture the base domain executing this request
    const { origin } = new URL(request.url); 
    const LRedirectToUrl = `${origin}/`;
    
    // 1. Fetch the absolute URL containing the valid, encoded state from Frappe
    const LdResponse = await fetch(
      `${LFrappeUrl}/api/method/brandkit.setup.get_google_auth_link?redirect_to_nextjs=${encodeURIComponent(LRedirectToUrl)}`
    );
    const LdResult = await LdResponse.json();
    
    if (LdResult.message && LdResult.message.auth_url) {
      // 2. Perform a clean server-side redirection straight to Google
      return NextResponse.redirect(LdResult.message.auth_url);
    }
    
    // 2. Controlled failure: If Frappe responds but doesn't give a URL
    return NextResponse.redirect(`${origin}?error=google_auth_failed`);
  } catch (idError) {
    console.error("OAuth generation failure:", idError);
    return NextResponse.redirect(`${origin}?error=connection_error`);
  }
}