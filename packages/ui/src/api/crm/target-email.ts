'use server';

export async function fnGetLeadDetailsForCampaignTarget(
  iTarget: string
) {
  if (!iTarget) {
    return null;
  }
  
  // Fetch lead details from Frappe CRM based on the provided campaign target.
  // await for the fetch call to complete and return the response object, which contains the HTTP response details.
  // Assign the response to the variable LdResponse for further processing.
  const LdResponse = await fetch(
    process.env.LENS_CRM_API_URL!,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${process.env.LENS_CRM_AUTH_BASE64}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: iTarget,
      }),
      cache: 'no-store',
    }
  );
 // Check if the response is successful; if not, throw an error with the status code)
 // This ensures that any issues with the request are logged and can be handled appropriately.
 // LdResponse.ok is a boolean that indicates whether the HTTP response status code is in the range 200-299, which signifies a successful request.
  if (!LdResponse.ok) {
    throw new Error(
      `LENS CRM request failed: ${LdResponse.status}`
    );
  }

  // Parse the response JSON and extract the email and lead ID, returning them in a structured format as expected and needed.
  const LdData = await LdResponse.json();

  return {
    email: LdData?.message?.email || null,
    lead: LdData?.message?.lead || null,
  };
}

//END OF API FUNCTION