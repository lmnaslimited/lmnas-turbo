"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import {
  subscribeNewsletter,
  type TnewsletterSubscriptionState,
} from "@repo/ui/api/newsletter/create-subscription";
import { TNewsletterSubscriptionProps } from "@repo/middleware/types";
import posthog from "posthog-js";
import { useEffect, useState } from "react";
import { ReCaptchaProvider, useReCaptcha } from "next-recaptcha-v3"

const LdVariants = {
  sm: {
    form: "flex gap-2",
    input: "max-w-xs",
    button: "",
    buttonSize: "sm" as const,
  },
  lg: {
    form: "flex flex-col gap-4 sm:flex-row sm:items-center",
    input: "h-11 flex-1",
    button: "h-11 px-6",
    buttonSize: "default" as const,
  },
};

export function NewsletterSubscriptionForm({
  placeholder,
  buttonLabel,
  buttonPendingLabel = "Subscribing...",
  variant = "lg",
  source
}: TNewsletterSubscriptionProps) {

  const { executeRecaptcha } = useReCaptcha()
  const [LPosthogReady, fnSetPosthogReady] = useState(false)

  // Ensure PostHog is fully initialized before enabling newsletter subscriptions,
  // so identify and capture events are not lost during SDK startup.
  // This code was provided by posthog AI
  useEffect(() => {
    // posthog.loaded is true if already initialized
    if ((posthog as any).__loaded) {
      fnSetPosthogReady(true);
    } else {
      // Wait for the loaded callback
      const checkLoaded = setInterval(() => {
        if ((posthog as any).__loaded) {
          fnSetPosthogReady(true);
          clearInterval(checkLoaded);
        }
      }, 50);
      return () => clearInterval(checkLoaded);
    }
  }, []);

  // Tracks form submission loading state and API response status/message
  const [LPending, fnSetPending] = useState(false);
  const [LState, fnSetState] =
    useState<TnewsletterSubscriptionState>({
      message: "",
      status: "error",
    });

  // Handles newsletter form submission:
  // - Prevents default form submit behavior
  // - Ensures reCAPTCHA is ready and generates token
  // - Collects and normalizes email input
  // - Sends analytics events to PostHog (identify + capture)
  // - Submits data to newsletter subscription API
  // - Updates UI state based on success or failure
  const fnHandleSubmit = async (
    idEvent: React.FormEvent<HTMLFormElement>,
  ) => {
    idEvent.preventDefault();
    const LForm = idEvent.currentTarget;

    if (!executeRecaptcha) {
      fnSetState({
        message: "reCAPTCHA not ready",
        status: "error",
      });
      return;
    }
  
    try {
      fnSetPending(true);
  
      const LToken = await executeRecaptcha("newsletter");
  
      const LdFormData = new FormData(LForm);
      const LEmail = LdFormData.get("email");
  
      LdFormData.append("recaptchaToken", LToken);
  
      if (typeof LEmail === "string" && LEmail.trim()) {
        // Posthog analytics
        const LNormalizedEmail =
          LEmail.trim().toLowerCase();
  
        posthog.identify(LNormalizedEmail, {
          email: LNormalizedEmail,
          newsletterOptIn: true,
        });
  
        posthog.capture("newsletter_submitted",{
          email: LNormalizedEmail,
          source
        });
      }
      // subscription apis
      const LdResult = await subscribeNewsletter(
        { message: "", status: "error" },
        LdFormData,
      );
  
      fnSetState(LdResult);
    } catch (error) {
      console.log(error)
      fnSetState({
        message: "Something went wrong",
        status: "error",
      });
    } finally {
      fnSetPending(false);
    }
  };

  const LVariant = LdVariants[variant];

  return (
    <>
      <form
        onSubmit={fnHandleSubmit}
        className={LVariant.form}
      >
        <Input
          type="email"
          name="email"
          placeholder={placeholder}
          required
          className={LVariant.input}
        />

        <Button
          type="submit"
          disabled={LPending || !LPosthogReady}
          size={LVariant.buttonSize}
          className={LVariant.button}
        >
          {LPending ? buttonPendingLabel : buttonLabel}
        </Button>
      </form>

      {LState?.message ? (
        <p className="mt-2 text-sm text-primary">{LState.message}</p>
      ) : null}
    </>
  );
}

export function NewsletterSubscription(
  props: TNewsletterSubscriptionProps,
) {
  return (
    <ReCaptchaProvider
      reCaptchaKey={
        process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ""
      }
    >
      <NewsletterSubscriptionForm {...props} />
    </ReCaptchaProvider>
  );
}