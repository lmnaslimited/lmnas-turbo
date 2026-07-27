import { NextRequest, NextResponse } from "next/server";
import { setLmnasSession } from "@repo/ui/api/auth/session";

export async function googleCallback(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const LCode = searchParams.get("code");

  if (!LCode) {
    return NextResponse.redirect(
      new URL("/login?error=missing_code", request.url)
    );
  }

  const LFrappeUrl = process.env.NEXT_PUBLIC_FRAPPE_DOMAIN;

  if (!LFrappeUrl) {
    return NextResponse.redirect(
      new URL("/login?error=config", request.url)
    );
  }

  const LdExchangeResponse = await fetch(
    `${LFrappeUrl}/api/method/lenscloud.api.integration.exchange_google_code?code=${encodeURIComponent(LCode)}`,
    {
      cache: "no-store",
    }
  );

  if (!LdExchangeResponse.ok) {
    return NextResponse.redirect(
      new URL("/login?error=invalid_code", request.url)
    );
  }

  const LdResult = await LdExchangeResponse.json();

  const LdProfile = LdResult.message;


  if (!LdProfile.email) {
    return NextResponse.redirect(
      new URL("/login?error=user_not_found", request.url)
    );
  }

  const LdResponse = NextResponse.redirect(
    new URL("/", request.url)
  );

    setLmnasSession(LdResponse, {
    email: LdProfile.email,
    name: LdProfile.name,
    picture: LdProfile.picture,
    });

  return LdResponse;
}