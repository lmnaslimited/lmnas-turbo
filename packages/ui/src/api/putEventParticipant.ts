'use server'

export async function UpdateEventParticipant(iEventId: string, iContactId: string) {
    const LUrl = process.env.SUBSCRIBE_URL; // URL for the API
    const LdHeaders = {
        Authorization: `${process.env.AUTH_BASE_64}`,
        "Cookie": "full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_image="
    };

    try {
        // Step 1: Fetch the existing event data using the event ID
        const LdEventResponse = await fetch(
            `${LUrl}/api/resource/Event/${iEventId}`,
            {
                method: "GET", // Fetch the current event data
                headers: LdHeaders,
                redirect: "follow",
            }
        );

        // Parse the JSON response to get the event data
        const LdEventResult = await LdEventResponse.json();

        // Check if event_participants field exists and is an array, otherwise initialize it
        const LaExistingParticipants = LdEventResult.data.event_participants || [];

        // Step 2: Append the new participant to the existing participants array
        LaExistingParticipants.push({
            "name": "",
            "reference_doctype": "Contact",
            "reference_docname": `${iContactId}`
        });

        // Step 3: Update the event with the modified event_participants
        const LdPayload = {
            "event_participants": LaExistingParticipants
        };

        // Send a PUT request to update the event with the new participant
        const LdUpdateResponse = await fetch(
            `${LUrl}/api/resource/Event/${iEventId}`,
            {
                method: "PUT",
                headers: LdHeaders,
                body: JSON.stringify(LdPayload),
                redirect: "follow",
            }
        );

        // Parse the update response
        const LdUpdateResult = await LdUpdateResponse.json();

        // Return the updated data
        return {
            data: LdUpdateResult,
            message: "Updated Successfully"
        };

    } catch (error) {
        console.error("Error updating event participants:", error);

        // Return empty data structure in case of error
        return {
            data: [],
            message: "error"
        };
    }
}