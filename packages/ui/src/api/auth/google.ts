import { NextResponse } from 'next/server';

export async function loginViaGoogle(request:Request) {
  try {
    const LFrappeUrl = process.env.NEXT_PUBLIC_FRAPPE_DOMAIN;
    // Determine the current application origin so users can be redirected back after authentication.
    const { origin } = new URL(request.url); 
    const LRedirectToUrl = `${origin}/`;
    
    // Request a Google OAuth authorization URL from Frappe.
    // Frappe generates the required OAuth state and validates the post-login redirect.
    const LdResponse = await fetch(
      `${LFrappeUrl}/api/method/lenscloud.api.integration.get_google_auth_link?i_redirect_to_nextjs=${encodeURIComponent(LRedirectToUrl)}`
    );
    const LdResult = await LdResponse.json();
    
    if (LdResult.message && LdResult.message.auth_url) {
      // Redirect the user to Google's OAuth consent screen using the generated authorization URL.
      return NextResponse.redirect(LdResult.message.auth_url);
    }
    
    // Fall back to a controlled error when an authorization URL cannot be generated.
    return NextResponse.redirect(`${origin}?error=google_auth_failed`);
  } catch (idError) {
    // Handle unexpected failures while communicating with the backend.
    console.error("OAuth generation failure:", idError);
    return NextResponse.redirect(`${origin}?error=connection_error`);
  }
}