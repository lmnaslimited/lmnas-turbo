"use client"
import { useReCaptcha } from "next-recaptcha-v3"
import { CircleCheckBig, CircleX, Loader2, X } from "lucide-react";
import { useParams } from "next/navigation";
import posthog from "posthog-js";
import { useState } from "react";
import { validateRecaptcha } from "../api/newsletter/recaptcha";
import { Input } from "./ui/input";
import { Label } from "@radix-ui/react-label";
import Link from "next/link";
import { fnLeadToOpportunity } from "../api/casestudy/create-lead-opportunity";

export default function FreeOptIn({idContent}:Record<string, any>){
    // Stores the user's email address entered in the opt-in form.
    const [Email, fnSetEmail] = useState<string> ("")
    // Stores validation or reCAPTCHA error messages displayed to the user.
    const [LError, fnSetError] = useState("");
    const [LHasConsent, fnSetHasConsent] = useState(false);
    // store success and submitting state
    const [LIsSuccess, fnSetIsSuccess] = useState(false);
    const [LIsSubmitting, fnSetIsSubmitting] = useState(false);

    // Provides the function to generate a Google reCAPTCHA v3 token.
    const { executeRecaptcha } = useReCaptcha()
    // Retrieves the current locale from the route parameters.
    const LdParams = useParams();
    // Extract the locale value from the route parameters.
    const LLocale = LdParams.locale as string;
    
    // Handles the beta opt-in process, including email validation,
    // reCAPTCHA verification, PostHog tracking, and launching the Early Access widget.
    const fnHandleOptIn = async () => {
        // Clear any previous error message.
        fnSetError("");
        // Normalize the email before processing.
        const LTrimmedEmail = Email.trim().toLowerCase()
        // Stop if the email field is empty.
        if (!LTrimmedEmail) return

        fnSetIsSubmitting(true);
        // Parse a readable name out of the email string
        // e.g., "jane.doe@example.com" -> "Jane Doe"
        const LEmailPrefix = LTrimmedEmail.split("@")[0];
        const LGeneratedName = LEmailPrefix
          ? LEmailPrefix
              .split(/[\._\-]/)
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")
          : "";
        // Generate a reCAPTCHA token for bot verification.
        const LRecaptchaToken = await executeRecaptcha("beta_opt_in")
        try {
            // Verify the generated reCAPTCHA token with the backend.
            const LdResponse = await validateRecaptcha(LRecaptchaToken)
            // Capture the verification result in PostHog for analytics.
            posthog.capture("opt-in-recaptcha",{
                recaptcha_score: String(LdResponse.score),
                recaptcha_passed: LdResponse.success,
                $set: {
                email: LTrimmedEmail,
        },
            })
            // Stop the flow if reCAPTCHA verification fails.
            if (!LdResponse.success) {
                //reset the email
                // fnSetError(LdResponse.message ?? "reCAPTCHA verification failed.");
                fnSetError(
                  LdContent.errorMessage || LdResponse.message
                );
                fnSetHasConsent(false)
                // fnSetEmail("")
                return
            }

            // Identify the user in PostHog for future analytics.
            posthog.identify(LTrimmedEmail, {
                email: LTrimmedEmail,
            })
            // Trigger the hidden Site App widget to complete the beta opt-in.
            // document.getElementById("new-pricing-beta")?.click()

            // custom posthog beta early access, instead of default pop up model
            posthog.updateEarlyAccessFeatureEnrollment("new-pricing-beta", true)

            // Reset the email field after a successful submission.
            // fnSetEmail("")

            // Show success state
            fnSetIsSuccess(true)

            //call the backend to handle creation of
            // Lead --> opportunity --> email
            fnLeadToOpportunity({
              email: LTrimmedEmail,
              name: LGeneratedName,
              recaptchaToken: LRecaptchaToken,
              createOpportunity: true,
              sendEmail: true,
              emailTemplate: "LensCloud Beta Welcome",
              humanVerfied: true
          }).catch((err) => {
              // Logs silently to server monitor if Frappe goes down, 
              // without breaking the user's optimistic success UI state.
              console.error("Background Frappe synchronization failed:", err);
          });

        } catch (error) {
            console.error(error);
        }finally {
        // Always turn off the spinner, even on failures
        fnSetIsSubmitting(false);
      }
    }
    const LCurrentLocale = (LLocale && LLocale in idContent) ? LLocale : 'en';
    // Fallback to English if the requested locale doesn't exist
    const LdContent = idContent[LCurrentLocale] || idContent.en;

    return (
      <>
        {/* Early Access Opt-In Section */}
        <section className="relative  flex items-center overflow-hidden border-b border-border/40 bg-background py-20 md:py-24">
          <div className="pointer-events-none absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[140px]" />
          <div className="pointer-events-none absolute -bottom-40 -left-20 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />

          <div className="relative w-full px-4 md:px-24 lg:px-8 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 lg:items-center">
              {/* Left Column */}
              <div className="space-y-7">
                <div className="flex w-fit items-center gap-2 rounded-full bg-accent border border-border px-3 py-1 text-sm shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span className="font-medium">{LdContent.earlyAccess}</span>
                </div>

                <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl leading-[1.1]">
                  {LdContent.titleMain}
                  <span className="text-primary">{LdContent.titleAccent}</span>
                </h2>

                <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                  {LdContent.description}
                </p>

                <div className="flex flex-wrap gap-x-6 gap-y-3 pt-2">
                  {LdContent.signals.map((iSignal: string) => (
                    <div
                      key={iSignal}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <CircleCheckBig className="h-4 w-4 shrink-0 text-primary" />
                      <span>{iSignal}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column */}
              <div className="mx-auto w-full max-w-md">
                <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
                  <div className="bg-primary py-2.5 text-center">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-background">
                      {LdContent.ribbonText}
                    </span>
                  </div>

                  <div className="p-8">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-3xl font-bold text-foreground">
                          {LdContent.planName}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {LdContent.freeForever}
                        </p>
                      </div>
                      <div className="text-right leading-none">
                        <span className="text-5xl font-bold text-foreground">
                          $0
                        </span>
                        <p className="text-sm text-muted-foreground mt-1">
                          {LdContent.perMonth}
                        </p>
                      </div>
                    </div>

                    <div className="mt-8">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        {LdContent.whatsIncluded}
                      </h4>
                      <ul className="space-y-3 text-sm text-foreground">
                        <li className="flex items-start gap-3 rounded-xl bg-accent border border-border p-4">
                          <CircleCheckBig className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                          <span>
                            <strong>{LdContent.incInstanceTitle}</strong>
                            {LdContent.incInstanceDesc}
                          </span>
                        </li>
                        <li className="flex items-start gap-3 rounded-xl bg-accent border border-border p-4">
                          <CircleCheckBig className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                          <span>
                            <strong>{LdContent.incPlatformTitle}</strong>
                            {LdContent.incPlatformDesc}
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div className="mt-8">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        {LdContent.capabilities}
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {LdContent.capabilityList.map(
                          ({
                            label,
                            available,
                          }: {
                            label: string;
                            available: boolean;
                          }) => (
                            <div
                              key={label}
                              className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 ${
                                available
                                  ? "bg-accent border-border"
                                  : "bg-muted/40 border-border"
                              }`}
                            >
                              <span
                                className={
                                  available
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                                }
                              >
                                {label}
                              </span>

                              {available ? (
                                <CircleCheckBig className="h-4 w-4 shrink-0 text-primary" />
                              ) : (
                                <CircleX className="h-4 w-4 shrink-0 text-muted-foreground" />
                              )}
                            </div>
                          )
                        )}
                      </div>
                      <div className="max-w-lg space-y-6 mt-8">
                      {LIsSuccess ? (
                        /* Dedicated Success State Layout - Clears form clutter completely */
                        <div className="relative rounded-xl bg-primary/5 border border-primary/20 p-6 text-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
                          {/* Close Button */}
                          <button
                            type="button"
                            onClick={() => {
                              fnSetIsSuccess(false);
                              fnSetEmail("");
                              fnSetHasConsent(false);
                            }}
                            className="absolute top-3 right-3 p-1 rounded-md text-muted-foreground bg-accent hover:text-foreground transition-colors"
                            aria-label="Close success message"
                          >
                            <X className="h-4 w-4 text-primary" />
                          </button>
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <CircleCheckBig className="h-6 w-6 text-green-600" />
                          </div>
                          <h4 className="text-lg font-semibold text-foreground">
                            {LdContent.successTitle || "Spot Secured!"}
                          </h4>
                          {/* Displaying the confirmed email right under the title */}
                          <p className="inline-block text-xs font-medium bg-primary/10 text-primary rounded-full px-3 py-1 mt-1">
                            {Email.trim().toLowerCase()}
                          </p>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {LdContent.successMessage || "Thank you for opting in! We’ll send you an email when LensCloud launches. Please check your spam folder if you don't see it in your inbox."}
                          </p>
                        </div>
                      ) : (
                        /* Interactive Form State */
                        <>
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            await fnHandleOptIn();
                          }}
                          className="flex flex-col gap-3"
                        >
                          <Label
                            htmlFor="email"
                            className="text-sm text-muted-foreground"
                          >
                            {LdContent.emailLabel || ""}
                          </Label>

                          <div className="flex flex-col gap-3">
                            <Input
                              id="email"
                              type="email"
                              name="opt-in-email"
                              required
                              autoComplete="off"
                              placeholder={LdContent.placeholderEmail}
                              value={Email}
                              onChange={(e) => fnSetEmail(e.target.value)}
                              className="h-12 rounded-lg border border-primary bg-background px-4 text-base text-foreground transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                            />

                          <div className="flex items-start gap-2 mt-2 mb-2">
                              <input
                                id="terms-consent"
                                type="checkbox"
                                required
                                checked={LHasConsent}
                                onChange={(e) => fnSetHasConsent(e.target.checked)}
                                className="mt-1"
                              />

                              <label
                                htmlFor="terms-consent"
                                className="text-sm text-muted-foreground"
                              >
                                { LdContent.agreeLabel || "I agree to the"}{" "}
                                <Link href={`/${LLocale}/terms-and-conditions`} target="_blank" className="underline">
                                  { LdContent.termsLabel || "Terms of service"}
                                </Link>{" "}
                                &{" "}
                                <Link href={`/${LLocale}/privacy-policy`} target="_blank" className="underline">
                                  { LdContent.policyLabel || "Privacy Policy" }
                                </Link>
                                .
                              </label>
                            </div>

                            <button
                              type="submit"
                              className="h-12 px-4 bg-primary text-primary-foreground font-medium rounded-lg flex items-center justify-center"
                            >
                             {LIsSubmitting ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                </>
                              ) : (
                                <span>{LdContent.btnSecureSpot}</span>
                              )}
                              
                            </button>
                          </div>
                        </form>

                        {LError && (
                          <p className="text-sm text-destructive">{LError}</p>
                        )}

                        <p className="text-sm text-muted-foreground">
                          {LdContent.noCreditCard}
                        </p>
                        </>
                      )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* <button id="new-pricing-beta" className="hidden" type="button" /> */}
        </section>
      </>
    );
}