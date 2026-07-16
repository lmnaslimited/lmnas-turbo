"use client"
import { useReCaptcha } from "next-recaptcha-v3"
import { CircleCheckBig, CircleX } from "lucide-react";
import { useParams } from "next/navigation";
import posthog from "posthog-js";
import { useState } from "react";
import { validateRecaptcha } from "../api/newsletter/recaptcha";
import { Input } from "./ui/input";
import { Label } from "@radix-ui/react-label";

// const Li18n = {
//     en: {
//       earlyAccess: "Limited launch slots",
//       titleMain: "LENS ( ERPNext ) Hosting, ",
//       titleAccent: "Zero Overhead.",
//       description: "Opt in to the upcoming LensCloud platform before the general release. Secure early access to our permanently free tier, built for production-grade vanilla Frappe deployments.",
//       placeholderEmail: "Enter your professional email",
//       btnSecureSpot: "Secure My Spot",
//       noCreditCard: "No credit card required. Instance setup links sent on launch day.",
//       signals: ["Start at $0", "Your ERP under 5 minutes", "Cancel anytime"],
//       ribbonText: "Recommended",
//       planName: "Free Plan",
//       freeForever: "Free forever",
//       perMonth: "/month",
//       whatsIncluded: "What's included",
      
//       // Extracted pure text parts clearly
//       incInstanceTitle: "1 Production Instance",
//       incInstanceDesc: " — fully managed and ready for live deployment.",
//       incPlatformTitle: "Unlimited Users",
//       incPlatformDesc: "— Add as many users as your business needs.",
      
//       capabilities: "Capabilities",
//         capabilityList: [
//             { label: "Free SSO", available: true },
//             { label: "ERPNext Hosting", available: true },
//             { label: "Free Migration", available: true },
//             { label: "Free Upgrade", available: true },
//         ],
//     },
//     de: {
//       earlyAccess: "Begrenzte Startplätze",
//       titleMain: "Vanilla ERPNext Hosting, ",
//       titleAccent: "Null Overhead.",
//       description: "Melden Sie sich vor der offiziellen Veröffentlichung für die kommende LensCloud-Plattform an. Sichern Sie sich den frühzeitigen Zugriff auf unsere dauerhaft kostenlose Stufe, die für produktionsbereite Vanilla-Frappe-Bereitstellungen entwickelt wurde.",
//       placeholderEmail: "Geben Sie Ihre geschäftliche E-Mail ein",
//       btnSecureSpot: "Meinen Platz sichern",
//       noCreditCard: "Keine Kreditkarte erforderlich. Links zur Instanz-Einrichtung werden am Starttag gesendet.",
//       signals: ["Ab 0 € starten", "Ihr ERP in unter 5 Minuten", "Jederzeit kündbar"],
//       ribbonText: "Beliebtestens · Frühzeitiger Zugriff",
//       planName: "Starter-Plan",
//       freeForever: "Dauerhaft kostenlos",
//       perMonth: "/Monat",
//       whatsIncluded: "Was enthalten ist",
      
//       // Extracted pure text parts clearly
//       incInstanceTitle: "1 Produktionsinstanz",
//       incInstanceDesc: " — vollständig verwaltet und bereit für den Live-Einsatz.",
//       incPlatformTitle: "Verwaltete Plattform",
//       incPlatformDesc: " — Betriebssystem, Netzwerk und Datenbank werden für Sie übernommen.",
      
//       capabilities: "Funktionen",
//       capabilityList: [
//         { label: "SSO inklusive", available: true },
//         { label: "ERPNext-Hosting", available: true },
//         { label: "Kostenlose Migration", available: true },
//         { label: "Kostenlose Upgrades", available: true },
//       ],
//     }
//   };

export default function FreeOptIn({idContent}:Record<string, any>){
    // Stores the user's email address entered in the opt-in form.
    const [Email, fnSetEmail] = useState<string> ("")
    // Stores validation or reCAPTCHA error messages displayed to the user.
    const [LError, fnSetError] = useState("");

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
                  idContent.errorMessage || LdResponse.message
                );
                // fnSetEmail("")
                return
            }

            // Identify the user in PostHog for future analytics.
            posthog.identify(LTrimmedEmail, {
                email: LTrimmedEmail,
            })
            // Trigger the hidden Site App widget to complete the beta opt-in.
            document.getElementById("new-pricing-beta")?.click()

            // Reset the email field after a successful submission.
            // fnSetEmail("")
        } catch (error) {
            console.error(error);
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
                            {idContent.emailLabel || ""}
                          </Label>

                          <div className="flex flex-col gap-3">
                            <Input
                              id="email"
                              type="email"
                              name="email"
                              required
                              autoComplete="off"
                              placeholder={LdContent.placeholderEmail}
                              value={Email}
                              onChange={(e) => fnSetEmail(e.target.value)}
                              className="h-12 rounded-lg border border-primary bg-background px-4 text-base text-foreground transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                            />

                            <button
                              type="submit"
                              className="h-12 px-4 bg-primary text-primary-foreground font-medium rounded-lg"
                            >
                              {LdContent.btnSecureSpot}
                            </button>
                          </div>
                        </form>

                        {LError && (
                          <p className="text-sm text-destructive">{LError}</p>
                        )}

                        <p className="text-sm text-muted-foreground">
                          {LdContent.noCreditCard}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button id="new-pricing-beta" className="hidden" type="button" />
        </section>
      </>
    );
}