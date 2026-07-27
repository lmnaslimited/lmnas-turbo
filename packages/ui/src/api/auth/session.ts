import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'lmnas_session';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

export type SessionPayload = {
  email: string;
  name: string;
  picture: string | null;
  exp: number;
};

function requiredSecret(): string {
  const LSecret = process.env.LMNAS_SESSION_SECRET;

  if (!LSecret) {
    throw new Error('LMNAS_SESSION_SECRET is not configured');
  }

  return LSecret;
}

function sign(value: string): string {
  return createHmac('sha256', requiredSecret())
    .update(value)
    .digest('base64url');
}

export function setLmnasSession(
  response: NextResponse,
  user: {
    email: string;
    name: string;
    picture: string | null;
  },
): void {
  const LdPayload: SessionPayload = {
    email: user.email,
    name: user.name,
    picture: user.picture,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };

  const LdEncoded = Buffer.from(
    JSON.stringify(LdPayload),
  ).toString('base64url');

  const LToken = `${LdEncoded}.${sign(LdEncoded)}`;

  response.cookies.set(SESSION_COOKIE, LToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export function getLmnasSession(
  request: NextRequest,
): SessionPayload | null {
  const LToken = request.cookies.get(SESSION_COOKIE)?.value;

  if (!LToken) {
    return null;
  }

  const [LEncoded, LSuppliedSignature] = LToken.split('.');

  if (!LEncoded || !LSuppliedSignature) {
    return null;
  }

  const LExpectedSignature = sign(LEncoded);

  const LSupplied = Buffer.from(LSuppliedSignature);
  const LExpected = Buffer.from(LExpectedSignature);

  if (
    LSupplied.length !== LExpected.length ||
    !timingSafeEqual(LSupplied, LExpected)
  ) {
    return null;
  }

  try {
    const LdPayload = JSON.parse(
      Buffer.from(LEncoded, 'base64url').toString('utf8'),
    ) as SessionPayload;

    if (
      !LdPayload.email ||
      !LdPayload.exp ||
      LdPayload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return LdPayload;
  } catch {
    return null;
  }
}

export function clearLmnasSession(
  response: NextResponse,
): void {
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });
}