"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@repo/ui/lib/utils";

import { Button } from "@repo/ui/components/ui/button";
import { Form } from "@repo/ui/components/ui/form";

import { ReCaptchaProvider, useReCaptcha } from "next-recaptcha-v3";

// Reuse the shared contact submit handler — same payload, reCAPTCHA verification,
// newsletter subscription, PostHog link and success/error handling as the
// existing Contact Us form. The shared form component itself is NOT modified.
import { fnSubmitAppointmentBooking, fnSubmitContact } from "@repo/ui/components/form";
import { fetchTimeSlots } from "@repo/ui/api/appointment/fetch-timeslot";
import { fetchTimezones } from "@repo/ui/api/appointment/fetch-timezone";
import { fetchAppointmentAvailability } from "@repo/ui/api/appointment/fetch-appointment-availability";
import { format } from "date-fns/format";
import type { Tslot } from "@repo/middleware/types";

import DynamicFormStep from "./DynamicFormStep";
import { useDetectedRegion } from "./useDetectedRegion";
import { fnResolveContactSteps, fnDeriveNameFromEmail } from "./contact-form.config";
import type { TdynamicContactFormProps } from "@repo/middleware/types";
import { useKnownVisitorProfile } from "../../hooks/use-known-visitor-profile";

function fnParseCalendarDate(iDate: string): Date {
  return new Date(`${iDate}T00:00:00`);
}

function fnSlotValue(idSlot: Tslot): string {
  return idSlot.time.slice(11, 19);
}
/**
 * Inner multi-step contact form.
 *
 * - react-hook-form is the single source of truth for all field values, so
 *   values persist while navigating forwards/backwards between steps.
 * - Steps are derived from the (Strapi-driven) `config.fields`, max 2 per step.
 * - Per-step validation uses `form.trigger(currentStepFieldNames)`.
 * - Submission reuses `fnSubmitContact`, identical to the shared form.
 */
function InnerDynamicForm({
  config,
  onSuccess,
  onSuccessfulSubmit,
  className = "",
  defaultValues,
}: TdynamicContactFormProps): ReactElement | null {
  const [CurrentStep, fnSetCurrentStep] = useState(0);
  const [IsSubmitting, fnSetIsSubmitting] = useState(false);
  const { executeRecaptcha } = useReCaptcha();
  const { Profile, IsReady: LIsPostHogReady } = useKnownVisitorProfile();
  const LHasAppliedProfile = useRef(false);
  const LHasPrefilledKnownName = useRef(false);

  // Steps are built from the field config coming from Strapi (chunked, 2/step).
  const LaSteps = useMemo(
    () => fnResolveContactSteps(config.fields),
    [config.fields],
  );
  const LTotalSteps = LaSteps.length || 1;
  const LIsFirstStep = CurrentStep === 0;
  const LIsLastStep = CurrentStep >= LTotalSteps - 1;
  const LdCurrentStep = LaSteps[CurrentStep];

  // Email→name autofill — purely client-side. The email field is the one typed
  // as "email"; the target is the name-like field (`name` / `fullName`).
  const LEmailFieldName = useMemo(
    () => config.fields.find((idField) => idField.type === "email")?.name,
    [config.fields],
  );
  const LAutoFillTargetName = useMemo(
    () =>
      config.fields.find((idField) =>
        /^(full[_-]?name|name)$/i.test(idField.name),
      )?.name,
    [config.fields],
  );

  // Region detected from the visitor's browser (client-only, hydration-safe).
  // The dynamic contact form uses only the country code for the phone field;
  // the timezone value is intentionally ignored here (other forms use it).
  const { countryIso: LDetectedCountry, timezone: LDetectedTimezone } = useDetectedRegion();

  const fnSanitizeFormData = (idFormData: Record<string, unknown>) =>
    Object.fromEntries(
      Object.entries(idFormData).filter(
        ([iKey]) => !["recaptchaToken", "timeSlot"].includes(iKey),
      ),
    );

  // Default values for every field; provided defaults win. Mirrors shared form.
  const LdInitialValues = {
    name: "",
    email: "",
    message: "",
    phone: "",
    newsletter: true,
    timezone: "",
    timeSlot: "",
    ...defaultValues,
  };

  const [Timezones, fnSetTimezones] = useState<string[]>([]);
  const [IsLoadingTimezones, fnSetIsLoadingTimezones] = useState(true);
  const [IsEmailSubscribed, setIsEmailSubscribed] = useState<boolean | null>(null);
  const [TimeSlots, fnSetTimeSlots] = useState<Tslot[]>([]);
  const [IsLoadingSlots, fnSetIsLoadingSlots] = useState(false);
  const [ShowTimeSlots, fnSetShowTimeSlots] = useState(false);
  const [AvailableDates, fnSetAvailableDates] = useState<string[]>([]);
  const [BookingRangeStart, fnSetBookingRangeStart] = useState<Date>();
  const [BookingRangeEnd, fnSetBookingRangeEnd] = useState<Date>();
  const [AppointmentDuration, fnSetAppointmentDuration] = useState(60);
  const [IsLoadingAvailability, fnSetIsLoadingAvailability] = useState(false);
  const [AvailabilityError, fnSetAvailabilityError] = useState<string>();

  const LdForm = useForm<z.infer<typeof config.schema>>({
    resolver: zodResolver(config.schema),
    defaultValues: LdInitialValues,
    mode: "onTouched",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const SelectedDate = LdForm.watch("date");
  const SelectedTimezone = LdForm.watch("timezone");

  // Restore identity fields once when a known visitor returns. Marking the
  // attempt complete even for an anonymous visitor prevents a successful
  // submission from immediately refilling the form after it is reset.
  useEffect(() => {
    if (!LIsPostHogReady || LHasAppliedProfile.current) return;

    LHasAppliedProfile.current = true;

    const LdPrefillValues: Record<string, string | undefined> = {
      email: Profile.email,
      name: Profile.name,
      phone: Profile.phone,
    };

    Object.entries(LdPrefillValues).forEach(([LFieldName, LValue]) => {
      if (!LValue) return;
      if (!config.fields.some((idField) => idField.name === LFieldName)) return;
      if (LdForm.getFieldState(LFieldName as never).isDirty) return;
      if (LdForm.getValues(LFieldName as never)) return;

      LdForm.setValue(LFieldName as never, LValue as never, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });

      if (LFieldName === "name") {
        LHasPrefilledKnownName.current = true;
      }
    });
  }, [LIsPostHogReady, Profile, config.fields, LdForm]);

  // Reset progress if the resolved steps shrink (e.g. config change).
  useEffect(() => {
    if (CurrentStep > LTotalSteps - 1) {
      fnSetCurrentStep(Math.max(0, LTotalSteps - 1));
    }
  }, [LTotalSteps, CurrentStep]);

  // Prefill the target field from the email as the user types — but never once
  // the user has edited that field themselves (so a manual value is preserved).
  const LEmailValue = LEmailFieldName
    ? (LdForm.watch(LEmailFieldName as never) as unknown as string | undefined)
    : undefined;

  useEffect(() => {
    if (!LEmailFieldName || !LAutoFillTargetName) return;
    if (LdForm.formState.dirtyFields[LAutoFillTargetName as never]) return;
    if (LHasPrefilledKnownName.current) return;
    LdForm.setValue(
      LAutoFillTargetName as never,
      fnDeriveNameFromEmail(LEmailValue ?? "") as never,
      { shouldValidate: false },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [LEmailValue, LEmailFieldName, LAutoFillTargetName]);

  useEffect(() => {
    if (config.formId !== "booking") return;

    const fnLoadTimezones = async (): Promise<void> => {
      try {
        const LdResult = await fetchTimezones();
        if (LdResult?.data) {
          fnSetTimezones(LdResult.data);
        }
      } catch (error) {
        console.error("Failed to load timezones:", error);
      } finally {
        fnSetIsLoadingTimezones(false);
      }
    };

    fnLoadTimezones();
  }, [config.formId]);

  useEffect(() => {
    if (config.formId !== "booking") return;
    const LCurrentTimezone = LdForm.getValues("timezone");
    // Prefer the visitor-detected timezone when available and present in the
    // backend-provided timezone list. Fall back to a sensible default.
    if (!LCurrentTimezone && Timezones.length > 0) {
      const LPreferred = LDetectedTimezone && Timezones.includes(LDetectedTimezone)
        ? LDetectedTimezone
        : Timezones.find((z) => z.includes("CET")) || "UTC";
      LdForm.setValue("timezone", LPreferred);
    }
  }, [config.formId, Timezones, LDetectedTimezone, LdForm]);

  useEffect(() => {
    if (config.formId !== "booking") return;
    if (!SelectedTimezone) return;

    let LIsCancelled = false;

    const fnLoadAvailability = async (): Promise<void> => {
      fnSetIsLoadingAvailability(true);
      fnSetAvailabilityError(undefined);
      fnSetAvailableDates([]);
      fnSetTimeSlots([]);
      fnSetShowTimeSlots(false);
      LdForm.setValue("date", undefined as never, {
        shouldDirty: false,
        shouldValidate: false,
      });
      LdForm.setValue("timeSlot", "", {
        shouldDirty: false,
        shouldValidate: false,
      });

      const LdResult = await fetchAppointmentAvailability(SelectedTimezone);
      if (LIsCancelled) return;

      if (!LdResult.data) {
        fnSetAvailabilityError(
          LdResult.error ?? "Unable to load appointment availability.",
        );
        fnSetIsLoadingAvailability(false);
        return;
      }

      const LdAvailability = LdResult.data;
      fnSetAvailableDates(LdAvailability.availableDates);
      fnSetBookingRangeStart(fnParseCalendarDate(LdAvailability.rangeStart));
      fnSetBookingRangeEnd(fnParseCalendarDate(LdAvailability.rangeEnd));
      fnSetAppointmentDuration(LdAvailability.settings.appointment_duration);

      const LFirstDate = LdAvailability.availableDates[0];
      if (!LFirstDate) {
        fnSetAvailabilityError("No appointments are available in the booking range.");
        fnSetIsLoadingAvailability(false);
        return;
      }

      const LaFirstDateSlots = LdAvailability.slotsByDate[LFirstDate] ?? [];
      const LdFirstSlot = LaFirstDateSlots.find((idSlot) => idSlot.availability);
      fnSetTimeSlots(LaFirstDateSlots);
      fnSetShowTimeSlots(true);
      LdForm.setValue("date", fnParseCalendarDate(LFirstDate), {
        shouldDirty: false,
        shouldValidate: true,
      });
      if (LdFirstSlot) {
        LdForm.setValue("timeSlot", fnSlotValue(LdFirstSlot), {
          shouldDirty: false,
          shouldValidate: true,
        });
      }
      fnSetIsLoadingAvailability(false);
    };

    fnLoadAvailability();

    return () => {
      LIsCancelled = true;
    };
  }, [config.formId, SelectedTimezone, LdForm]);

  useEffect(() => {
    if (config.formId !== "booking") return;

    let LIsCancelled = false;

    const fnLoadTimeSlots = async (): Promise<void> => {
      if (!SelectedDate || !SelectedTimezone) {
        fnSetShowTimeSlots(false);
        return;
      }

      fnSetIsLoadingSlots(true);
      fnSetShowTimeSlots(true);
      LdForm.setValue("timeSlot", "", {
        shouldDirty: false,
        shouldValidate: false,
      });

      try {
        const LFormattedDate = format(new Date(SelectedDate), "yyyy-MM-dd");
        const LdSlotResult = await fetchTimeSlots(LFormattedDate, SelectedTimezone);
        if (LIsCancelled) return;

        if (LdSlotResult?.data && Array.isArray(LdSlotResult.data)) {
          fnSetTimeSlots(LdSlotResult.data);
          const LdFirstAvailableSlot = LdSlotResult.data.find(
            (idSlot) => idSlot.availability,
          );
          if (LdFirstAvailableSlot) {
            LdForm.setValue("timeSlot", fnSlotValue(LdFirstAvailableSlot), {
              shouldDirty: false,
              shouldValidate: true,
            });
          }
        } else {
          fnSetTimeSlots([]);
        }
      } catch (error) {
        if (!LIsCancelled) {
          console.error("Error loading slots:", error);
          fnSetTimeSlots([]);
        }
      } finally {
        if (!LIsCancelled) {
          fnSetIsLoadingSlots(false);
        }
      }
    };

    fnLoadTimeSlots();

    return () => {
      LIsCancelled = true;
    };
  }, [config.formId, SelectedDate, SelectedTimezone, LdForm]);

  /**
   * Validates only the fields of the current step and advances if they pass.
   */
  const fnHandleNext = async () => {
    const LaFieldNames = (LdCurrentStep?.fields ?? []).map(
      (idField) => idField.name,
    );
    const LIsValid = await LdForm.trigger(LaFieldNames as never);
    if (LIsValid && !LIsLastStep) {
      fnSetCurrentStep((iPrev) => Math.min(iPrev + 1, LTotalSteps - 1));
    }
  };

  const fnHandlePrevious = () => {
    if (!LIsFirstStep) {
      fnSetCurrentStep((iPrev) => Math.max(iPrev - 1, 0));
    }
  };

  /**
   * Submits the contact form — identical flow to the shared <SectionForm />.
   */
  const fnHandleSubmit = async (idFormData: z.infer<typeof config.schema>) => {
    fnSetIsSubmitting(true);
    if (!executeRecaptcha) {
      fnSetIsSubmitting(false);
      return;
    }

    try {
      if (config.formId === "booking") {
        const LSelectedDate = format(new Date(idFormData.date), "yyyy-MM-dd");
        const LSelectedTimezone = String(idFormData.timezone ?? "");
        const LSelectedTimeSlot = String(idFormData.timeSlot ?? "");
        const LdLatestSlots = await fetchTimeSlots(
          LSelectedDate,
          LSelectedTimezone,
        );
        const LIsStillAvailable = LdLatestSlots.data?.some(
          (idSlot) =>
            idSlot.availability && fnSlotValue(idSlot) === LSelectedTimeSlot,
        );

        if (!LIsStillAvailable) {
          throw new Error(
            "This appointment slot is no longer available. Please select another slot.",
          );
        }
      }

      const LdRecaptchaToken = await executeRecaptcha("submit");
      const LdResponse =
        config.formId === "booking"
          ? await fnSubmitAppointmentBooking(idFormData, LdRecaptchaToken, config)
          : await fnSubmitContact(idFormData, LdRecaptchaToken);

      if (LdResponse.error) {
        throw new Error(LdResponse.error);
      }

      if (config.formId === "booking") {
        config.successMessage = LdResponse.message ? LdResponse.message : "";
        // config.successTitle = LdResponse.title ? LdResponse.title : "";
      }

      await onSuccessfulSubmit?.({
        formData: fnSanitizeFormData(idFormData),
        formId: config.formId,
        formTitle: config.title,
      });

      LdForm.reset(LdInitialValues);
      fnSetCurrentStep(0);
      onSuccess(config.successMessage, config.successTitle);
      // hide the form until the page is manually refreshed
      setIsSubmitted(true);
    } catch (error) {
      LdForm.setError("root", {
        type: "manual",
        message:
          error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      fnSetIsSubmitting(false);
    }
  };

  const LProgressPercent = Math.round(((CurrentStep + 1) / LTotalSteps) * 100);

  // Encouraging, locale-safe caption chosen by how many steps remain. Strapi
  // copy wins; English fallbacks keep it working before the CMS fields exist.
  const LStepsRemaining = LTotalSteps - 1 - CurrentStep;
  const LdStepCaptions = config.stepCaptions;
  let LProgressCaption = LdStepCaptions?.almostDone ?? "Almost Done";
  if (LStepsRemaining > 1) {
    LProgressCaption = LdStepCaptions?.fewToComplete ?? "Few Steps To Complete";
  } else if (LStepsRemaining === 1) {
    LProgressCaption = LdStepCaptions?.oneMoreInput ?? "One More Input";
  }

  if (isSubmitted) return null

  return (
    <div className={cn("w-full", className)}>
      <Form {...LdForm}>
        <form onSubmit={LdForm.handleSubmit(fnHandleSubmit)}>
          {/* Progress indicator */}
          <div className="mb-6 mt-4">
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-foreground transition-all duration-300 ease-out"
                style={{ width: `${LProgressPercent}%` }}
              />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {LProgressCaption}
            </p>
          </div>

          {LdForm.formState.errors.root && (
            <p className="text-red-500 text-sm mb-4">
              {LdForm.formState.errors.root.message}
            </p>
          )}

          
            {LdCurrentStep && (
              <DynamicFormStep
                step={LdCurrentStep}
                control={LdForm.control}
                countryIso={LDetectedCountry}
                showTimeSlots={ShowTimeSlots}
                timeSlots={TimeSlots}
                isLoadingSlots={IsLoadingSlots}
                timezones={Timezones}
                isLoadingTimezones={IsLoadingTimezones}
                availableDates={AvailableDates}
                bookingRangeStart={BookingRangeStart}
                bookingRangeEnd={BookingRangeEnd}
                isLoadingAvailability={IsLoadingAvailability}
                availabilityError={AvailabilityError}
                appointmentDuration={AppointmentDuration}
                isEmailSubscribed={IsEmailSubscribed}
                onEmailCheck={(val: boolean) => {
                  setIsEmailSubscribed(val)
                  if (val) {
                    // Already subscribed: the checkbox is hidden, so keep the
                    // underlying value true to reflect the existing subscription.
                    LdForm.setValue("newsletter" as never, true as never, {
                      shouldDirty: false,
                      shouldValidate: false,
                    })
                  }
                }}
              />
            )}

            

          {/* Navigation */}
          <div className="space-y-4 mt-2">
            <div className="flex items-center gap-3">
              {!LIsFirstStep && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 flex-1 rounded-full"
                  onClick={fnHandlePrevious}
                  disabled={IsSubmitting}
                >
                  Previous
                </Button>
              )}

              {!LIsLastStep && (
                <Button
                  type="button"
                  className="h-12 flex-1 rounded-full"
                  onClick={fnHandleNext}
                >
                  Next
                </Button>
              )}

              {LIsLastStep && (
                <Button
                  type="submit"
                  className="h-12 flex-1 rounded-full"
                  disabled={IsSubmitting}
                >
                  {IsSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-background"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    </span>
                  ) : (
                    config.submitText
                  )}
                </Button>
              )}
            </div>

            {config.showTerms && (
              <p className="text-xs text-center text-muted-foreground">
                {config.policyDescription ?? "By submitting, you agree to our"}{" "}
                <Link
                  href={`/${config.terms?.href ?? "terms-and-conditions"}`}
                  className="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {config.terms?.label ?? "Terms"}
                </Link>{" "}
                &{" "}
                <Link
                  href={`/${config.privacy?.href ?? "privacy-policy"}`}
                  className="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {config.privacy?.label ?? "Privacy Policy"}
                </Link>
              </p>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}

/**
 * Public multi-step Contact form. Wraps the inner form with the reCAPTCHA
 * provider and reloads the reCAPTCHA script on locale change — identical to the
 * shared <SectionForm /> wrapper, so reCAPTCHA behaviour is unchanged.
 */
export const DynamicForm = (props: TdynamicContactFormProps): ReactElement => {
  const LdParams = useParams();
  const Locale = LdParams.locale as string;
  const LRecaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

  /*
    On switching the language, useRouter remounts the client component (including
    this form), but ReCaptchaProvider only injects its <script> once. So we
    remove the old script and inject one using the new language.
    github ref: https://github.com/snelsi/next-recaptcha-v3/issues/164
  */
  const fnReloadRecaptchaScript = (iKey: string, iLang: string) => {
    const ExistingScript = document.getElementById("google-recaptcha-v3");
    if (ExistingScript) {
      ExistingScript.remove();
    }

    const LdScript = document.createElement("script");
    LdScript.src = `https://www.google.com/recaptcha/api.js?render=${iKey}&hl=${iLang}`;
    LdScript.id = "google-recaptcha-v3";
    LdScript.async = true;
    LdScript.defer = true;
    document.body.appendChild(LdScript);
  };

  useEffect(() => {
    fnReloadRecaptchaScript(LRecaptchaSiteKey, Locale);
  }, [Locale, LRecaptchaSiteKey]);

  return (
    <ReCaptchaProvider reCaptchaKey={LRecaptchaSiteKey}>
      <InnerDynamicForm {...props} />
    </ReCaptchaProvider>
  );
};

export default DynamicForm;
