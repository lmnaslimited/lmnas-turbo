import { createHmac, randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getLmnasSession } from './session';
import { TEnvSource } from '@repo/middleware/types';

function requiredEnv(name: string, iEnv?:TEnvSource): string {
  const LValue = iEnv?.env.platformUrl || process.env[name];

  if (!LValue) {
    throw new Error(`${name} is not configured`);
  }

  return LValue;
}

export async function openPlatform(request: NextRequest, iEnv:TEnvSource) {
  const LdSession = getLmnasSession(request);

  if (!LdSession) {
    return NextResponse.redirect(
      new URL('/login', request.url),
    );
  }

  const LInternalUrl = requiredEnv('NEXT_PUBLIC_FRAPPE_URL', iEnv)
    .replace(/\/+$/, '');

  const LPublicUrl = requiredEnv('NEXT_PUBLIC_FRAPPE_DOMAIN', iEnv)
    .replace(/\/+$/, '');

  const LSecret = requiredEnv(
    'LENSCLOUD_TRUSTED_LOGIN_SECRET', 
  );


  const LTimestamp = Math.floor(
    Date.now() / 1000,
  ).toString();

  const LNonce = randomBytes(24).toString('hex');


  // Use email from LMNAS session
  const LMessage = `${LTimestamp}\n${LNonce}\n${LdSession.email}`;


  const LSignature = createHmac(
    'sha256',
    LSecret,
  )
    .update(LMessage)
    .digest('hex');


  const LdResponse = await fetch(
    `${LInternalUrl}/api/method/lenscloud.api.trusted_login.issue_login_code`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',

        'X-LMNAS-Timestamp': LTimestamp,
        'X-LMNAS-Nonce': LNonce,
        'X-LMNAS-Signature': LSignature,
      },

      body: JSON.stringify({
        user: LdSession.email,
      }),

      cache: 'no-store',
    },
  );


  if (!LdResponse.ok) {
    console.error(
      'LensCloud login-code request failed:',
      LdResponse.status,
    );

    return NextResponse.redirect(
      new URL(
        '/?platform_error=unavailable',
        request.url,
      ),
    );
  }


  const LdData = await LdResponse.json();


  const LCode = LdData.message?.code;


  if (!LCode) {
    return NextResponse.redirect(
      new URL(
        '/?platform_error=invalid_response',
        request.url,
      ),
    );
  }


  const callback = new URL(
    '/api/method/lenscloud.api.trusted_login.consume_login_code',
    LPublicUrl,
  );


  callback.searchParams.set(
    'code',
    LCode,
  );


  return NextResponse.redirect(callback);
}