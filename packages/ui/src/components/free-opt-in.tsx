"use client"

import { CircleCheckBig, CircleX,CheckCircle2, X, Loader2, Clock } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useEffect, useState } from "react";
import posthog from "posthog-js";
import { useRouter } from "next/navigation";
import { fnCheckUserApproval } from "../api/crm/check-user-approval";
import { useApproval } from "./auth/approvalContext";

type TApprovalStatus = "verifying" | "approved" | "review_pending" | "unapproved";
export default function FreeOptIn({ idContent }: Record<string, any>) { 
    // Retrieves the current locale from the route parameters.
    const LdParams = useParams();
    // Extract the locale value from the route parameters.
    const LLocale = LdParams.locale as string;
    const LCurrentLocale = (LLocale && LLocale in idContent) ? LLocale : 'en';
    const router = useRouter();
    // Fallback to English if the requested locale doesn't exist
    const LdContent = idContent[LCurrentLocale] || idContent.en;
    const [Email, fnSetEmail] = useState("")
    const [LIsSuccess, fnSetIsSuccess] = useState(false);
    const [LError, fnSetError] = useState("");
    const [LHasConsent, fnSetHasConsent] = useState(false);
    const [LIsSubmitting, fnSetIsSubmitting] = useState(false);
     // store success message
     const [LdSuccessMessage, fnSetSuccessMessage] = useState<{
        label: string;
        description: string;
    }>({
        label: "",
        description: "",
    })

    const LDistinctId = posthog.get_distinct_id();
    // Distinct ID verification states
    const [LApprovalStatus, fnSetApprovalStatus] = useState<TApprovalStatus>("verifying");
    const [LIsCustomer, fnSetIsCustomer] = useState(false);
    const { status, isCustomer, refetch } = useApproval()

    // Setting up correct Flow based on the identifed email
    // during the mount
    useEffect(() => {
        async function fnAutoCheckApproval() {
          try {
            fnSetError("");
           
            if (status === 'approved') {
               
                fnSetIsCustomer(!!isCustomer);
                fnSetApprovalStatus("approved");
            } else if (status === 'review_pending') {
                fnSetApprovalStatus("review_pending");
            } else {
                fnSetApprovalStatus("unapproved");
            }
          } catch (idError) {
            console.error('Automated approval check failure:', idError);
          }
        }
    
        if(LDistinctId){
          fnSetEmail(LDistinctId?.includes("@")? LDistinctId : "");
          fnAutoCheckApproval();
        }
      }, [LDistinctId]);
    

    async function fnHandleOptIn() {
        // Reset previous messages.
        fnSetError("");
        fnSetSuccessMessage({
            label: "",
            description: "",
        });

        const LTrimmedEmail = Email.trim().toLowerCase();

        // Stop if the email is empty.
        if (!LTrimmedEmail) return;

        fnSetIsSubmitting(true);

        // Identify the user.
        posthog.identify(LTrimmedEmail, {
        email: LTrimmedEmail,
        });

        await refetch(LTrimmedEmail);
        
        // Navigate to login.
        router.push(`/${LLocale}/login`);
    
        // fnSetIsSubmitting(false);

    }
    // Determine Button Label safely based on PostHog approval status
    const fnGetButtonLabel = () => {
        if (LApprovalStatus === "approved") {
            return isCustomer 
                ? (LdContent.btnContinueLogin || "Continue to Sign In") 
                : (LdContent.btnContinueSignUp || "Continue to Sign Up");
        }
        return LdContent.btnSecureSpot || "Secure My Spot";
    };
    return (
        <section className="relative  flex items-center overflow-hidden border-b border-border/40 bg-background py-20 md:py-24">
            {/* Background Glow Overlay */}
            <div className="pointer-events-none absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[140px]" />
            <div className="pointer-events-none absolute -bottom-40 -left-20 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />

            <div className="relative w-full px-4 md:px-8 mx-auto max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">

                    {/* Left Column - Dynamic Form View */}
                    <div className="lg:col-span-6 space-y-8">
                        {/* <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-primary backdrop-blur-sm shadow-xs">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            <span>{LdContent.earlyAccess}</span>
                        </div> */}

                        <h2 className="text-4xl font-bold text-foreground md:text-5xl lg:text-5xl leading-1">
                            {LdContent.titleMain}{" "}
                            <span className="text-primary">
                                {LdContent.titleAccent}
                            </span>
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                            {LdContent.description}
                        </p>
                        {/* 2. REVIEW PENDING STATE */}
                        {LApprovalStatus === "review_pending" && (
                            <div className="space-y-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 backdrop-blur-xs">
                                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-sm">
                                    <Clock className="h-5 w-5 shrink-0" />
                                    <span>
                                        {LdContent?.reviewPending?.titlePending || "Access Request Under Review"}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {LdContent?.reviewPending?.descriptionPending || 
                                     "Your request is currently being reviewed. You will receive an email update once approved."}
                                </p>
                            </div>
                        )}
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
                            {LdSuccessMessage.label || ""}
                          </h4>
                          {/* Displaying the confirmed email right under the title */}
                          <p className="inline-block text-xs font-medium bg-primary/10 text-primary rounded-full px-3 py-1 mt-1">
                            {Email.trim().toLowerCase()}
                          </p>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {LdSuccessMessage.description || ""}
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

                          {/* <div className="flex items-start gap-2 mt-2 mb-2"> */}
                              {/* <input
                                id="terms-consent"
                                type="checkbox"
                                required
                                checked={LHasConsent}
                                onChange={(e) => fnSetHasConsent(e.target.checked)}
                                className="mt-1"
                              /> */}

                              {/* <label
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
                              </label> */}
                            {/* </div> */}
                            <button
                              type="submit"
                              className="h-12 px-4 bg-primary text-primary-foreground font-medium rounded-lg flex items-center justify-center"
                            >
                             {LIsSubmitting ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                </>
                              ) : (
                                // <span>{LdContent.btnSecureSpot}</span>
                                <span>{fnGetButtonLabel()}</span>
                                
                              )}
                              
                            </button>
                         </div>
                        </form>
                        </>
                      )}
                        {/* Signals list */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
                            {LdContent.signals.map((iSignal: string) => (
                                <div
                                    key={iSignal}
                                    className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground font-medium"
                                >
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                                    <span>{iSignal}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Pricing Card */}
                    <div className="lg:col-span-5 w-full max-w-md mx-auto">
                        <div className="relative overflow-hidden rounded-3xl border border-border bg-card/80 transition-all duration-300 hover:shadow-primary/5">
                            <div className="bg-primary py-2.5 text-center">
                                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-foreground">
                                    {LdContent.ribbonText}
                                </span>
                            </div>
                            <div className="p-6 sm:p-8 space-y-6">
                                <div className="flex items-start justify-between border-b border-border/60 pb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-foreground">
                                            {LdContent.planName}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {LdContent.freeForever}
                                        </p>
                                    </div>
                                    <div className="text-right leading-none">
                                        <span className="text-4xl sm:text-5xl font-black text-foreground">
                                            $0
                                        </span>
                                        <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                                            {LdContent.perMonth}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                        {LdContent.whatsIncluded}
                                    </h4>
                                    <ul className="space-y-2.5 text-xs sm:text-sm">
                                        <li className="flex items-start gap-3 rounded-2xl bg-accent/50 border border-border/50 p-3.5 transition-colors hover:bg-accent">
                                            <CircleCheckBig className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                                            <span>
                                                <strong className="font-semibold text-foreground">{LdContent.incInstanceTitle} </strong>
                                                <span className="text-muted-foreground">{LdContent.incInstanceDesc}</span>
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3 rounded-2xl bg-accent/50 border border-border/50 p-3.5 transition-colors hover:bg-accent">
                                            <CircleCheckBig className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                                            <span>
                                                <strong className="font-semibold text-foreground">{LdContent.incPlatformTitle} </strong>
                                                <span className="text-muted-foreground">{LdContent.incPlatformDesc}</span>
                                            </span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                        {LdContent.capabilities}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2">
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
                                                    className={`flex items-center justify-between gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                                                        available
                                                            ? "bg-accent/40 border-border/60 text-foreground"
                                                            : "bg-muted/30 border-border/30 text-muted-foreground/60"
                                                    }`}
                                                >
                                                    <span className="truncate">{label}</span>
                                                    {available ? (
                                                        <CircleCheckBig className="h-3.5 w-3.5 shrink-0 text-primary" />
                                                    ) : (
                                                        <CircleX className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </div>
                                    <p className="text-center text-xs text-muted-foreground pt-4">
                                        {LdContent.noCreditCard}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

