import { NextRequest, NextResponse } from "next/server";
import { setLmnasSession } from "@repo/ui/api/auth/session";
import { TEnvSource } from "@repo/middleware/types";

export async function googleCallback(request: NextRequest, iEnv:TEnvSource) {
  // Read the one-time login code returned by lenscloud after Google authentication.
  const { searchParams } = new URL(request.url);

  const LCode = searchParams.get("code");
  const LProtocol =
      request.headers.get('x-forwarded-proto') ||
      new URL(request.url).protocol.replace(':', '');

  const LHost =
      request.headers.get('x-forwarded-host') ||
      request.headers.get('host');

  const LOrigin = `${LProtocol}://${LHost}`;

  if (!LCode) {
    return NextResponse.redirect(
      new URL("/login?error=missing_code", LOrigin)
    );
  }

  const LFrappeUrl = iEnv.env.platformUrl || process.env.NEXT_PUBLIC_FRAPPE_DOMAIN;

  if (!LFrappeUrl) {
    return NextResponse.redirect(
      new URL("/login?error=config", LOrigin)
    );
  }
   // Exchange the one-time login code for the authenticated user's profile.
  const LdExchangeResponse = await fetch(
    `${LFrappeUrl}/api/method/lenscloud.api.integration.exchange_google_code?code=${encodeURIComponent(LCode)}`,
    {
      cache: "no-store",
    }
  );

  if (!LdExchangeResponse.ok) {
    return NextResponse.redirect(
      new URL("/login?error=invalid_code", LOrigin)
    );
  }
  // Extract the authenticated user's details from the response.
  const LdResult = await LdExchangeResponse.json();

  const LdProfile = LdResult.message;


  if (!LdProfile.email) {
    return NextResponse.redirect(
      new URL("/login?error=user_not_found", LOrigin)
    );
  }
  // Redirect the user to the application home page after successful login.
  const LdResponse = NextResponse.redirect(
    new URL("/", LOrigin)
  );
    // Create the LMNAS session cookie for the authenticated user.
    setLmnasSession(LdResponse, {
    email: LdProfile.email,
    name: LdProfile.name,
    picture: LdProfile.picture,
    });

  return LdResponse;
}