"use server";

import { z } from "zod";
import { TapiResponse } from "@repo/middleware/types";
import { linkFrappeRecordByEmailToPostHog } from "@repo/ui/api/crm/posthog-link";
import { PostHog } from "posthog-node";

const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
});

// Function to verify reCAPTCHA token using Google's siteverify API
async function fnVerifyRecaptcha(
  iToken: string,
): Promise<{ isHuman: boolean; score: number }> {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  const LSecretKey = process.env.RECAPTCHA_SECRET_KEY;
  const LRecaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${LSecretKey}&response=${iToken}`;

  try {
    const LdResponse = await fetch(LRecaptchaUrl, { method: "POST" });
    const LdData = await LdResponse.json();
    return {
      isHuman: LdData.success && LdData.score >= 0.5,
      score: LdData.score ?? 0,
    };
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return { isHuman: false, score: 0 };
  }
}

// Schema validation for the appointment booking form using Zod
const LdAppointmentSchema = z.object({
  date: z.string(),
  time: z.string(),
  timezone: z.string(),
  contact: z.object({
    name: z.string(),
    phone: z.string(),
    email: z.string().email(),
    notes: z.string().optional(),
  }),
  recaptchaToken: z.string(),
});

/**
 * Handles appointment booking by:
 * 1. Verifying reCAPTCHA token to prevent bot submissions
 * 2. Validating input data
 * 3. Sending booking data to the LENS API
 */
export async function bookAppointmentAction(
  idFormData: z.infer<typeof LdAppointmentSchema>,
): Promise<TapiResponse> {
  // Prepare API headers including authentication and session cookies
  const ldHeaders = new Headers({
    Authorization: `${process.env.AUTH_BASE_64}`,
    "Content-Type": "application/json",
    Cookie:
      "full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_image=",
  });

  const { date, time, timezone, contact, recaptchaToken } = idFormData;

  // Verify if the form submission is made by a human
  const { isHuman, score } = await fnVerifyRecaptcha(recaptchaToken);

  // Capture reCAPTCHA result tied to the person's email
  posthog.capture({
    distinctId: contact.email,
    event: "booking_recaptcha_verified",
    properties: {
      recaptcha_score: String(score),
      recaptcha_passed: isHuman,
      $set: {
        email: contact.email,
        name: contact.name,
        phone: contact.phone,
      },
    },
  });

  if (!isHuman) {
    return { error: "reCAPTCHA verification failed" };
  }

  try {
    // Prepare the payload to be sent to the LENS booking endpoint
    const LdPayload = {
      date,
      time,
      tz: timezone,
      contact: JSON.stringify(contact),
    };

    const LBookingUrl = `${process.env.SUBSCRIBE_URL}/api/method/erpnext.www.book_appointment.index.create_appointment`;

    // Send the appointment request
    const LdResponse = await fetch(LBookingUrl, {
      method: "POST",
      headers: ldHeaders,
      redirect: "follow",
      body: JSON.stringify(LdPayload),
    });

    // If request fails, return error details
    if (!LdResponse.ok) {
      const lErrorText = await LdResponse.text();
      return { error: lErrorText };
    }

    // On success, return the booking confirmation
    const LdResult = await LdResponse.json();
    await linkFrappeRecordByEmailToPostHog(contact.email);

    return {
      message: "Booking confirmed successfully",
      data: LdResult,
    };
  } catch (error) {
    console.error("Booking error:", error);
    return { error: "Server error occurred" };
  }
}
