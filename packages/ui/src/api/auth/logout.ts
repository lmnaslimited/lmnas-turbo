import { NextRequest, NextResponse } from 'next/server';
import { clearLmnasSession } from './session';

export async function logout(request: NextRequest) {
  const LProtocol =
      request.headers.get('x-forwarded-proto') ||
      new URL(request.url).protocol.replace(':', '');

    const LHost =
      request.headers.get('x-forwarded-host') ||
      request.headers.get('host');

    const LOrigin = `${LProtocol}://${LHost}`;
  const LdResponse = NextResponse.redirect(new URL('/', LOrigin));

  clearLmnasSession(LdResponse);
  return LdResponse;
}