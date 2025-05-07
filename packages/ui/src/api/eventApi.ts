'use server'

import { TtrendCardProps } from "@repo/middleware";

export type TsocialAPIPostIds = {
    data: TtrendCardProps[];
};

export async function EventApi(): Promise<TsocialAPIPostIds> {
    const LUrl = process.env.SUBSCRIBE_URL; // URL for the API
    const LdHeaders = {
        Authorization: `${process.env.AUTH_BASE_64}`,
        "Cookie": "full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_image="
    }

    try {
        // Step 1: Fetch the list of events based on the filter "_user_tags like '%webinar%'"
        //here the _user_tags return with "," at start
        const LdEventResponse = await fetch(
            `${LUrl}/api/resource/Event?filters=[["_user_tags", "in", [",webinar"]]]`,
            {
                method: "GET",
                headers: LdHeaders,
                redirect: "follow",
            }
        );

        // Parse the JSON response to get the list of event data
        const LdEventResult = await LdEventResponse.json();
        const LaRawEvents = LdEventResult.data || [];

        // Step 2: Loop through each event and fetch detailed data
        const LaMappedEvents = await Promise.all(
            LaRawEvents.map(async (event: { name: string }) => {
                const eventId = event.name; // Assuming the event name is its unique ID

                // Query each event for its detailed information
                const LdEventDetailsResponse = await fetch(
                    `${LUrl}/api/resource/Event/${eventId}`,
                    {
                        method: "GET",
                        headers: LdHeaders,
                        redirect: "follow",
                    }
                );

                const LdEventDetailsResult = await LdEventDetailsResponse.json();
                const eventData = LdEventDetailsResult.data;

                // Map the event data to the desired format
                return {
                    id: eventData.name,
                    title: eventData.subject,
                    publishedAt: eventData.starts_on,
                    source: eventData._user_tags?.replace(/^,/, '').trim() || '',
                    description: eventData.description?.replace(/<\/?[^>]+(>|$)/g, "").trim() || '' || "",
                    ...(eventData._user_tags === ",webinar" && { formMode: "webinar" })
                };
            })
        );

        console.log(LdEventResult)
        // Return the final array of mapped event data
        return {
            data: LaMappedEvents,
        };

    } catch (error) {
        console.error("Error fetching events:", error);

        // Return empty data structure in case of error
        return {
            data: [],
        };
    }
}