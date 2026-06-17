"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useEffect, useMemo, useState, type ReactElement } from "react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@repo/ui/lib/utils";

import { Button } from "@repo/ui/components/ui/button";
import { Form } from "@repo/ui/components/ui/form";

import { ReCaptchaProvider, useReCaptcha } from "next-recaptcha-v3";

// Reuse the shared contact submit handler — same payload, reCAPTCHA verification,
// newsletter subscription, PostHog link and success/error handling as the
// existing Contact Us form. The shared form component itself is NOT modified.
import { fnSubmitContact } from "@repo/ui/components/form";

import DynamicFormStep from "./DynamicFormStep";
import { fnResolveContactSteps } from "./contact-form.config";
import type { TdynamicContactFormProps } from "./contact-form.types";
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
}: TdynamicContactFormProps): ReactElement {
  const [CurrentStep, fnSetCurrentStep] = useState(0);
  const [IsSubmitting, fnSetIsSubmitting] = useState(false);
  const { executeRecaptcha } = useReCaptcha();

  // Steps are built from the field config coming from Strapi (chunked, 2/step).
  const LaSteps = useMemo(
    () => fnResolveContactSteps(config.fields),
    [config.fields],
  );
  const LTotalSteps = LaSteps.length || 1;
  const LIsFirstStep = CurrentStep === 0;
  const LIsLastStep = CurrentStep >= LTotalSteps - 1;
  const LdCurrentStep = LaSteps[CurrentStep];

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
    ...defaultValues,
  };

  const LdForm = useForm<z.infer<typeof config.schema>>({
    resolver: zodResolver(config.schema),
    defaultValues: LdInitialValues,
    mode: "onTouched",
  });

  // Reset progress if the resolved steps shrink (e.g. config change).
  useEffect(() => {
    if (CurrentStep > LTotalSteps - 1) {
      fnSetCurrentStep(Math.max(0, LTotalSteps - 1));
    }
  }, [LTotalSteps, CurrentStep]);

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
      const LdRecaptchaToken = await executeRecaptcha("submit");
      const LdResponse = await fnSubmitContact(idFormData, LdRecaptchaToken);

      if (LdResponse.error) {
        throw new Error(LdResponse.error);
      }

      await onSuccessfulSubmit?.({
        formData: fnSanitizeFormData(idFormData),
        formId: config.formId,
        formTitle: config.title,
      });

      LdForm.reset(LdInitialValues);
      fnSetCurrentStep(0);
      onSuccess(config.successMessage, config.successTitle);
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

  return (
    <div className={cn("w-full", className)}>
      <Form {...LdForm}>
        <form onSubmit={LdForm.handleSubmit(fnHandleSubmit)}>
          {/* Progress indicator */}
          <div className="mb-6">
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-foreground transition-all duration-300 ease-out"
                style={{ width: `${LProgressPercent}%` }}
              />
            </div>
          </div>

          {LdForm.formState.errors.root && (
            <p className="text-red-500 text-sm mb-4">
              {LdForm.formState.errors.root.message}
            </p>
          )}

          
          {LdCurrentStep && (
            <DynamicFormStep step={LdCurrentStep} control={LdForm.control} />
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
