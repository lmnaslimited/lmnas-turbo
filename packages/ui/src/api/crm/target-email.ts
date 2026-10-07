'use server';

export async function fnGetLeadDetailsForCampaignTarget(
  target: string
) {
  if (!target) {
    return null;
  }

  const Ldresponse = await fetch(
    process.env.LENS_CRM_API_URL!,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${process.env.LENS_CRM_AUTH_BASE64}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target,
      }),
      cache: 'no-store',
    }
  );

  if (!Ldresponse.ok) {
    throw new Error(
      `Frappe CRM request failed: ${Ldresponse.status}`
    );
  }

  const data = await Ldresponse.json();
  return {
    email: data?.message?.email || null,
    lead: data?.message?.lead || null,
  };
}