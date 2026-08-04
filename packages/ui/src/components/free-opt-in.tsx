"use client"
import { useReCaptcha } from "next-recaptcha-v3"
import { CircleCheckBig, CircleX, Loader2, X, ArrowRight, Building2, Globe, Users, HelpCircle, CheckCircle2 } from "lucide-react";
import { useParams } from "next/navigation";
import posthog from "posthog-js";
import { useEffect, useRef, useState } from "react";
import { validateRecaptcha } from "../api/newsletter/recaptcha";
import { Input } from "./ui/input";
import { Label } from "@radix-ui/react-label";
import Link from "next/link";
import { fnLeadToOpportunity } from "../api/casestudy/create-lead-opportunity";
import { Textarea } from "./ui/textarea";

type BetaFieldType = "text" | "url" | "textarea" | "select";

type BetaFormField = {
    key: keyof CompanyDetails;
    type: BetaFieldType;
    label: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
};

type CompanyDetails = {
    companyName: string;
    companyDomain: string;
    companyWebsite: string;
    employeeCount: string;
    interestReason: string;
};

export default function FreeOptIn({ idContent }: Record<string, any>) {
    // Stores the user's email address entered in the opt-in form.
    const [Email, fnSetEmail] = useState<string>("")
    const [LCompanyDetails, setLCompanyDetails] = useState({
        companyName: "",
        companyDomain: "",
        companyWebsite: "",
        employeeCount: "",
        interestReason: "",
    });
    // Stores validation or reCAPTCHA error messages displayed to the user.
    const [LError, fnSetError] = useState("");
    const [LHasConsent, fnSetHasConsent] = useState(false);
    // store success and submitting state
    const [LIsSuccess, fnSetIsSuccess] = useState(false);
    const [LIsSubmitting, fnSetIsSubmitting] = useState(false);
    // store success message
    const [LdSuccessMessage, fnSetSuccessMessage] = useState<{
        label: string;
        description: string;
    }>({
        label: "",
        description: "",
    })
    const [LAccessStatus, setLAccessStatus] = useState<
        "initial" | "checking" | "approved" | "request"
    >("initial");
    
    // Provides the function to generate a Google reCAPTCHA v3 token.
    const { executeRecaptcha } = useReCaptcha()
    // Retrieves the current locale from the route parameters.
    const LdParams = useParams();
    // Extract the locale value from the route parameters.
    const LLocale = LdParams.locale as string;

    const [LHasBetaAccess, setLHasBetaAccess] = useState<boolean | null>(null);
    const LIsIdentityCheckedRef = useRef(false);

    useEffect(() => {
        const fnValidateBetaAccess = () => {
            // Ignore anonymous user evaluation
            if (!LIsIdentityCheckedRef.current) {
                return;
            }
            const LFlagValue = Boolean(
                posthog.isFeatureEnabled(
                    "lenscloud-beta-access-granted-user"
                )
            );
    
            setLHasBetaAccess(LFlagValue);
        };
    
        fnValidateBetaAccess();
    
        posthog.onFeatureFlags(fnValidateBetaAccess);
    
    }, []);

    useEffect(() => {

        if (LHasBetaAccess === true) {
    
            fnSetSuccessMessage({
                label: LdContent.successExistLabel || "Welcome!",
                description: LdContent.successExistDescript ||
                    "Your platform experience has started. Please sign in using 'Get Started for Free' in the top right corner.",
            });
    
            fnSetIsSuccess(true);
    
            setLAccessStatus("initial");
        }
    
    
        if (LHasBetaAccess === false) {
    
            setLAccessStatus("request");
    
            posthog.updateEarlyAccessFeatureEnrollment(
                "new-pricing-beta",
                true
            );
        }
    
    
    }, [LHasBetaAccess]);

    // Handles the beta opt-in process, including email validation,
    // reCAPTCHA verification, PostHog tracking.
    const fnHandleOptIn = async () => {
        fnSetError("");
        fnSetSuccessMessage({
            label: "",
            description: "",
        })
        // Normalize the email before processing.
        const LTrimmedEmail = Email.trim().toLowerCase()
        // Stop if the email field is empty.
        if (!LTrimmedEmail) return
        fnSetIsSubmitting(true);
        
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
                fnSetError(
                    LdContent.errorMessage || LdResponse.message
                );
                fnSetHasConsent(false)
                return
            }
            // Start checking
            setLAccessStatus("checking");
            setLHasBetaAccess(null);


            // Switch identity
            posthog.identify(LTrimmedEmail, {
                email: LTrimmedEmail,
            });


            posthog.setPersonPropertiesForFlags({
                email: LTrimmedEmail,
            });

            LIsIdentityCheckedRef.current = true;
            // Fetch latest flag value
            posthog.reloadFeatureFlags();

        } catch (error) {
            console.error(error);
        } finally {
            fnSetIsSubmitting(false);
        }
    }

    const fnSubmitBetaRequest = async () => {
        if (!LdContent.LeadProcess.IsNeeded) return
        fnSetIsSubmitting(true)
        const LTrimmedEmail = Email.trim().toLowerCase();

        const LEmailPrefix = LTrimmedEmail.split("@")[0];
        const LGeneratedName = LEmailPrefix
            ? LEmailPrefix
                .split(/[\._\-]/)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")
            : "";
        const LRecaptchaToken = await executeRecaptcha("beta_request");

        const LdLeadResult = await fnLeadToOpportunity({
            email: LTrimmedEmail,
            name: LGeneratedName,
            recaptchaToken: LRecaptchaToken,
            companyName: LCompanyDetails.companyName,
            companyDomain: LCompanyDetails.companyDomain,
            companyWebsite: LCompanyDetails.companyWebsite,
            employeeCount: LCompanyDetails.employeeCount,
            interestReason: LCompanyDetails.interestReason,
            createOpportunity: true,
            sendEmail: true,
            emailTemplate: LdContent.LeadProcess.emailTemplate,
            humanVerfied: true,
            opportType: LdContent.LeadProcess.opportType,
            source: LdContent.LeadProcess.source,
            campaign: LdContent.campaign,
            itemName: LdContent.itemName,
        });

        if (LdLeadResult.message === "success") {
            fnSetSuccessMessage({ label: LdContent.successNewLabel || "Spot Secured!", description: LdContent.successNewDescrip || "Thank you for opting in. We will review your application and reach out to you shortly." })
            fnSetIsSuccess(true);
        }
        fnSetIsSubmitting(false)
        setLCompanyDetails({
            companyName: "",
            companyDomain: "",
            companyWebsite: "",
            employeeCount: "",
            interestReason: "",
        })
    };

    const LCurrentLocale = (LLocale && LLocale in idContent) ? LLocale : 'en';
    // Fallback to English if the requested locale doesn't exist
    const LdContent = idContent[LCurrentLocale] || idContent.en;

    const renderField = (field: BetaFormField) => {
        const value = LCompanyDetails[field.key];
    
        const updateValue = (value: string) => {
            setLCompanyDetails({
                ...LCompanyDetails,
                [field.key]: value,
            });
        };
    
    
        switch (field.type) {
    
            case "text":
            case "url":
                return (
                    <Input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={value}
                        required={field.required}
                        onChange={(e) => updateValue(e.target.value)}
                        className="h-10 rounded-lg text-sm bg-muted"
                    />
                );
    
    
            case "textarea":
                return (
                    <Textarea
                        placeholder={field.placeholder}
                        value={value}
                        required={field.required}
                        rows={3}
                        onChange={(e) => updateValue(e.target.value)}
                        className="rounded-lg text-sm bg-muted resize-none"
                    />
                );
    
    
            case "select":
                return (
                    <select
                        value={value}
                        required={field.required}
                        onChange={(e) => updateValue(e.target.value)}
                        className="flex h-10 w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm"
                    >
                        <option value="">
                            {field.placeholder}
                        </option>
    
                        {field.options?.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                );
    
    
            default:
                return null;
        }
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

                        <div className="w-full max-w-xl">
                            {LIsSuccess ? (
                                /* Success Card */
                                <div className="relative rounded-2xl bg-card border border-primary/20 p-8 shadow-xl backdrop-blur-md space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            fnSetIsSuccess(false);
                                            fnSetEmail("");
                                            fnSetHasConsent(false);
                                            setLAccessStatus("initial");
                                        }}
                                        className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                                        aria-label="Close success message"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                        <CircleCheckBig className="h-8 w-8 text-primary" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h4 className="text-xl font-bold text-foreground">
                                            {LdSuccessMessage.label || "Success!"}
                                        </h4>
                                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
                                            <span>{Email.trim().toLowerCase()}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed pt-2">
                                            {LdSuccessMessage.description || ""}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                /* Interactive Form Section */
                                <div className="space-y-6">
                                    {LAccessStatus === "checking" && (
                                        <div className="flex items-center justify-center py-6">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span className="ml-2">
                                                {LdContent.loadingText || "Checking your beta access..."}
                                            </span>
                                        </div>
                                    )}
                                    {LAccessStatus === "initial" && (
                                        <form
                                            onSubmit={async (e) => {
                                                e.preventDefault();
                                                await fnHandleOptIn();
                                            }}
                                            className="space-y-4"
                                        >
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                                                    {LdContent.emailLabel || "Business Email Address"}
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    name="opt-in-email"
                                                    required
                                                    autoComplete="off"
                                                    placeholder={LdContent.placeholderEmail || "name@company.com"}
                                                    value={Email}
                                                    onChange={(e) => fnSetEmail(e.target.value)}
                                                    className="h-14 rounded-xl border border-primary bg-muted px-4 text-base text-foreground transition-all duration-200 placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-background"
                                                />
                                            </div>

                                            <div className="flex items-center gap-3 py-1">
                                                <input
                                                    id="terms-consent"
                                                    type="checkbox"
                                                    required
                                                    checked={LHasConsent}
                                                    onChange={(e) => fnSetHasConsent(e.target.checked)}
                                                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary/30 accent-primary cursor-pointer"
                                                />
                                                <label
                                                    htmlFor="terms-consent"
                                                    className="text-xs text-muted-foreground leading-normal cursor-pointer select-none"
                                                >
                                                    {LdContent.agreeLabel || "I agree to the"}{" "}
                                                    <Link href={`/${LLocale}/terms-and-conditions`} target="_blank" className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors">
                                                        {LdContent.termsLabel || "Terms of service"}
                                                    </Link>{" "}
                                                    &{" "}
                                                    <Link href={`/${LLocale}/privacy-policy`} target="_blank" className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors">
                                                        {LdContent.policyLabel || "Privacy Policy"}
                                                    </Link>
                                                    .
                                                </label>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={LIsSubmitting}
                                                className="w-full h-12 px-6 bg-primary text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {LIsSubmitting ? (
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                ) : (
                                                    <>
                                                        <span>{LdContent.btnSecureSpot || "Secure Your Spot"}</span>
                                                        <ArrowRight className="h-4 w-4" />
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    )}

                                    {LAccessStatus === "request" && (
                                        <form
                                            onSubmit={async (e) => {
                                                e.preventDefault();
                                                await fnSubmitBetaRequest();
                                            }}
                                            className="space-y-5 animate-in fade-in duration-300"
                                        >
                                            <div className="border-b border-border pb-3">
                                                <h3 className="text-lg font-semibold text-foreground"> {LdContent.betaVerification.title || "Verification Required" }</h3>
                                                <p className="text-sm text-muted-foreground mt-1"> {LdContent.betaVerification.description ||
                                                    "Please provide additional details so we can verify and approve your access request." }
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {LdContent.betaVerification.fields.map((field: BetaFormField) => (
                                                <div
                                                    key={field.key}
                                                    className={
                                                        field.type === "textarea"
                                                            ? "sm:col-span-2 space-y-1.5"
                                                            : "space-y-1.5"
                                                    }
                                                >
                                                    <Label>
                                                        {field.label}
                                                    </Label>

                                                    {renderField(field)}
                                                </div>
                                            ))}
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={LIsSubmitting}
                                                className="w-full h-11 px-4 bg-primary text-primary-foreground font-semibold rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all shadow-md disabled:opacity-50"
                                            >
                                                {LIsSubmitting ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <span>{ LdContent.betaVerification.submitButton || "Submit Verification Request"}</span>
                                                )}
                                            </button>
                                        </form>
                                    )}

                                    {LError && (
                                        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs font-medium text-destructive flex items-center gap-2">
                                            <CircleX className="h-4 w-4 shrink-0" />
                                            <span>{LError}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

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

