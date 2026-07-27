import { NextRequest, NextResponse } from 'next/server';
import { getLmnasSession } from './session';


export async function verifyAuthenticity(
  request: NextRequest,
) {
  try {

    const session = getLmnasSession(request);


    if (!session) {
      return NextResponse.json(
        {
          user: null,
        },
      );
    }


    return NextResponse.json({
      user: {
        email: session.email,
        name: session.name,
        picture: session.picture,
      },
    });


  } catch (error) {

    console.error(
      'LMNAS authentication verification failed:',
      error,
    );


    return NextResponse.json(
      {
        user: null,
      },
      {
        status: 500,
      },
    );
  }
}