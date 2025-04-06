'use server'

type IapiResponse = {
  message?: string
  data?: any
  error?: string
}

export async function fetchTimezones(): Promise<IapiResponse> {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

  const headers = {
    Authorization: `${process.env.AUTH_BASE_64}`,
    'Content-Type': 'application/json',
    Cookie: 'full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_image=',
  }

  try {
    const res = await fetch(
      `${process.env.SUBSCRIBE_URL}/api/method/erpnext.www.book_appointment.index.get_timezones`,
      {
        method: 'GET',
        headers,
        redirect: 'follow',
      }
    )

    if (!res.ok) {
      throw new Error('Failed to fetch timezones')
    }

    const json = await res.json()

    return {
      message: 'Timezones fetched successfully',
      data: json.message,
    }
  } catch (error: any) {
    return { error: error.message || 'Something went wrong' }
  }
}
