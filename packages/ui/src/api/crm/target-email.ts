'use server';

export async function fnGetLeadDetailsForCampaignTarget(
  target: string
) {
  if (!target) {
    return null;
  }

  // Fetch lead details from Frappe CRM based on the provided campaign target.
  const LdResponse = await fetch(
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
 // Check if the response is successful; if not, throw an error with the status code.
  if (!LdResponse.ok) {
    throw new Error(
      `LENS CRM request failed: ${LdResponse.status}`
    );
  }
  // Parse the response JSON and extract the email and lead ID, returning them in a structured format.
  const LdData = await LdResponse.json();
  return {
    email: LdData?.message?.email || null,
    lead: LdData?.message?.lead || null,
  };
}