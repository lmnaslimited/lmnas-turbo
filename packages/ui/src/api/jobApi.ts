'use server'
import { JobData, JobOpening, MappedResult } from "@repo/middleware";

export async function JobApi(): Promise<MappedResult> {
  const LUrl = process.env.SUBSCRIBE_URL
  const LdHeaders = {
    Authorization: `${process.env.AUTH_BASE_64}`,
    "Cookie": "full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_image="
  }
  try {
    const LdJobResponse = await fetch(
      `${LUrl}/api/resource/Job Opening?fields=["name","job_title","status","designation","description","location","_user_tags","creation", "custom_exert_description"]&limit_page_length=0`,
      {
        method: "GET",
        headers: LdHeaders,
        redirect: "follow",
      }
    );

    const LdJOBResult = await LdJobResponse.json();
    const LaRawData: JobOpening[] = LdJOBResult.data || [];

    // Extract unique values for filters
    const LaUniqueRoles = [...new Set(
      LaRawData.map(idItem => idItem.designation).filter((iRole): iRole is string => Boolean(iRole))
    )];

    const LaUniqueLocations = [...new Set(
      LaRawData.map(idItem => idItem.location).filter((iLocation): iLocation is string => Boolean(iLocation))
    )];

    const LaMappedData: JobData[] = LaRawData.map(item => ({
      id: item.name,
      title: item.job_title,
      location: item.location || "",
      role: item.designation,
      description: item.custom_exert_description || "",
    }));

    return {
      filters: {
        role: LaUniqueRoles,
        location: LaUniqueLocations,
      },
      data: LaMappedData,
    };

  } catch (error) {
    console.error("Error fetching external data:", error);

    return {
      filters: {
        role: [],
        location: [],
      },
      data: [],
    };
  }
}