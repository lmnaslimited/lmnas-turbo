'use client';
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { Tbutton, TLoginTarget } from '@repo/middleware/types';
import { Button } from '@repo/ui/components/ui/button';
import Link from 'next/link';
import { getIconComponent } from '@repo/ui/lib/icon';
import { useReCaptcha } from "next-recaptcha-v3";
import { validateRecaptcha } from '@repo/ui/api/newsletter/recaptcha';
import { Textarea } from "./ui/textarea";
import posthog from "posthog-js";
import { useParams } from 'next/navigation';
import { Input } from './ui/input';
import { TApprovalStatus, useApproval } from './auth/approvalContext';


type FormMode = 'login' | 'signup' | 'forgot';
type AccessStage = 'verifying' | 'approved_form' | 'request_details' | 'review_pending';

export default function LoginForm({ idLogin }: { idLogin: TLoginTarget }) {
  const [LAccessStage, fnSetAccessStage] = useState<AccessStage>('verifying');
  const [Lmode, fnSetMode] = useState<FormMode>('signup');
  
  // User Credentials / Inputs
  const [LUsername, fnSetUsername] = useState('');
  const [LEmail, fnSetEmail] = useState('');
  const [LPassword, fnSetPassword] = useState('');

  // UI State
  // Phase state for unapproved users: 1 = Email Check, 2 = Extra Details, 3 = Success
  const [LPhase, setLPhase] = useState<1 | 2 | 3>(1);

  const [LbSubmitting, fnSetSubmitting] = useState(false);
  const [LError, fnSetError] = useState<string | null>(null);
  const [LdSuccessMsg, fnSetSuccessMsg] = useState<{ title: string; description: string } | null>(null);
  const [LdAccessMsg, fnSetAccessMsg] = useState<{ title: string; description: string } | null>(null);
  const [LbShowPassword, fnSetShowPassword] = useState(false);

  const [LdCompanyDetails, fnSetCompanyDetails] = useState<Record<string, string>>({
    companyName: "",
    companyDomain: "",
    companyWebsite: "",
    employeeCount: "",
    interestReason: "",
  });

  const fnGetCompanyNameFromEmail = (iEmail: string) => {
  const LEmail = iEmail.trim().toLowerCase();

  if (!LEmail.includes("@")) return "";

  const LDomain = LEmail.split("@")[1];

  if (!LDomain) return "";

  // Ignore common personal email providers
  const LPublicEmailDomains = [
    "gmail.com",
    "yahoo.com",
    "yahoo.co.in",
    "outlook.com",
    "hotmail.com",
    "live.com",
    "icloud.com",
    "protonmail.com",
    "aol.com",
  ];

  if (LPublicEmailDomains.includes(LDomain)) {
    return "";
  }

  // Remove common TLDs
  const LCompanyName = (LDomain.split(".")[0] || "")
  .replace(/[-_]/g, " ")
  .trim();
  if (!LCompanyName) return "";

  // Convert to title case
  return LCompanyName
    .split(" ")
    .map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
};

  useEffect(() => {
  const LCompanyName = fnGetCompanyNameFromEmail(LEmail);

  if (LCompanyName) {
    fnSetCompanyDetails((idPrev) => ({
      ...idPrev,
      companyName: LCompanyName,
    }));
  }
}, [LEmail]);
  // Retrieves route parameters and query parameters
  const LdParams = useParams();
  // Extract the locale value from the route parameters.
  const LLocale = LdParams.locale as string;

  // Extract content safely from cms
  const LdAccessContent = idLogin?.loginAndSignUp?.accessVerifyContent;

  const LCurrentLocale = (LLocale && LdAccessContent && LLocale in LdAccessContent) 
    ? LLocale 
    : 'en';
  const LdContent = (LdAccessContent?.[LCurrentLocale] || LdAccessContent?.en) as Record<string, any>;

  const { executeRecaptcha } = useReCaptcha();

  const LDistinctId = posthog.get_distinct_id();

  const { status, isCustomer, refetch } = useApproval()

 // =========================================================
  // AUTOMATED MOUNT CHECK BASED ON POSTHOG & URL PARAMS
  // =========================================================
  useEffect(() => {
    // Single view router for applying status
    const fnApplyRoute = (iStatus: TApprovalStatus, iIsCustomer: boolean) => {
      switch (iStatus) {
        case 'approved':
          fnSetMode(iIsCustomer ? 'login' : 'signup');
          fnSetAccessStage('approved_form');
          break;

        case 'review_pending':
          fnSetSuccessMsg({
            title: LdContent?.reviewPending?.titlePending || "Request Pending!",
            description: LdContent?.reviewPending?.descriptionPending || "Your request is under review. Our team will send an update to your email."
          });
          fnSetAccessStage('review_pending');
          break;

        case 'unapproved':
        default:
          fnSetAccessStage('request_details');
          break;
      }
    };

    // Extract 'email' directly from window URL query parameters (no Suspense needed)
    let LUrlEmail = '';
    if (typeof window !== 'undefined') {
      const LSearchParams = new URLSearchParams(window.location.search);
      LUrlEmail = LSearchParams.get('email')?.trim().toLowerCase() || '';
    }

    const LbPostHogIdentified = !!(LDistinctId && LDistinctId.includes('@'));

    // CASE 1: No PostHog identity AND email in URL -> FORCE CRM FETCH
    if (!LbPostHogIdentified && LUrlEmail) {
      fnSetEmail(LUrlEmail);
      posthog.identify(LUrlEmail, { email: LUrlEmail });
      const fnRunCheck = async () => {
        try {
          const LResult = await refetch(LUrlEmail);
          if (LResult?.status) {
            fnApplyRoute(LResult.status, !!LResult.isCustomer);
          } else {
            fnSetAccessStage('request_details');
            setLPhase(1);
          }
        } catch (idError) {
          console.error('Forced CRM check failure:', idError);
          fnSetAccessStage('request_details');
          setLPhase(1);
        }
      };

      fnRunCheck();
      return;
    }

    // CASE 2, 3 & 4: (Identified or No Email in URL) -> USE CACHED CONTEXT
    const LTargetEmail = LUrlEmail || (LbPostHogIdentified ? LDistinctId : '');
    if (LTargetEmail) {
      fnSetEmail(LTargetEmail);
    }

    fnApplyRoute(status, isCustomer);
  }, [LDistinctId, status, isCustomer]);

  const fnSwitchMode = (iNewMode: FormMode) => {
    fnSetMode(iNewMode);
    fnSetError(null);
    fnSetSuccessMsg(null);
    fnSetPassword('');
  };

  // Verify the user's email against CRM to determine whether they can 
  // sign in, sign up, submit an access request, or wait for approval.
  const fnHandleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const LTrimmedEmail = LEmail.trim().toLowerCase();
    if (!LTrimmedEmail) return;

    fnSetSubmitting(true);
    try {
      posthog.identify(LTrimmedEmail, { email: LTrimmedEmail });
      const result = await refetch(LTrimmedEmail);
      if (result?.status === 'approved') {
        if (result?.isCustomer) {
          fnSetMode('login');
        } else {
          fnSetMode('signup');
        }
        fnSetAccessStage('approved_form');
      }else if (result?.status === 'review_pending') {
        fnSetSuccessMsg({
          title: LdContent?.reviewPending?.titlePending || "Request Pending!",
          description: LdContent?.reviewPending?.descriptionPending || "Your request is under review. Our team will send an update to your email."
        });
        fnSetAccessStage('review_pending')
      } else {
        // If still unapproved, proceed to Phase 2 (Extra Details)
        setLPhase(2);
      }
    } catch (err) {
      console.error(err);
      setLPhase(2);
    } finally {
      fnSetSubmitting(false);
    }
  };

  /**
   * Submits a beta access request for new users.
   */
  async function fnHandleBetaRequest(idEvent: React.FormEvent) {
    idEvent.preventDefault();
    fnSetError(null);
    fnSetAccessMsg(null);

    const LTrimmedEmail = LEmail.trim().toLowerCase();
    if (!LTrimmedEmail) {
      fnSetError("Please enter a valid email address.");
      return;
    }

    fnSetSubmitting(true);
    try {
      const LEmailPrefix = LTrimmedEmail.split("@")[0];
      const LGeneratedName = LEmailPrefix
        ? LEmailPrefix.split(/[\._\-]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
        : "";

      const LRecaptchaToken = await executeRecaptcha("beta_opt_in");
      
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
          return
      }
      // Identify and opt-in to beta access in posthog
      posthog.identify(LTrimmedEmail, { email: LTrimmedEmail });

      posthog.updateEarlyAccessFeatureEnrollment("new-pricing-beta", true);

      if (LdContent?.LeadProcess?.IsNeeded) {
        // creation of Lead-> opportunity->notes -> email
        // the /api/crm is located in braccoli-site
        const LdLeadResponse = await fetch("/api/crm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data:{
            email: LTrimmedEmail,
            name: LGeneratedName,
            companyName: LdCompanyDetails.companyName,
            companyDomain: LdCompanyDetails.companyDomain,
            companyWebsite: LdCompanyDetails.companyWebsite,
            employeeCount: LdCompanyDetails.employeeCount,
            interestReason: LdCompanyDetails.interestReason,
            createOpportunity: true,
            sendEmail: true,
            emailTemplate: LdContent.LeadProcess.emailTemplate,
            opportType: LdContent.LeadProcess.opportType,
            source: LdContent.LeadProcess.source,
            campaign: LdContent.campaign,
            itemName: LdContent.itemName,
            doctype: idLogin?.loginAndSignUp?.doctypeDetails
            },
            locale: LLocale
          }),
        });
        const LdLeadResult = await LdLeadResponse.json()
        if (LdLeadResult?.message === "success") {
          // REFETCH CRM STATUS NOW THAT OPPORTUNITY IS CREATED
          await refetch(LTrimmedEmail);
          fnSetSuccessMsg({
            title: LdContent?.reviewPending?.titleSubmitted || "Application Submitted Successfully!",
            description: LdContent?.reviewPending?.descriptionSubmitted || "Thank you for applying. Our team will review your details and notify you via email once access is approved."
          });
          fnSetAccessStage('review_pending');
        } else {
          fnSetError(LdContent?.errorMessages?.requestFailed || "Failed to submit request. Please try again.");
        }
      }
    } catch (idError) {
      console.error('Beta request failure:', idError);
      fnSetError(idLogin.loginAndSignUp.errDefaultFallback || 'An unexpected error occurred.');
    } finally {
      fnSetSubmitting(false);
    }
  }

  // Handles actual login/signup authentication
  async function fnHandleSubmit(idEvent: React.FormEvent) {
    idEvent.preventDefault();
    fnSetSubmitting(true);
    fnSetError(null);
    fnSetAccessMsg(null);
    fnSetSuccessMsg(null);

    try {
      const LRecaptchaToken = await executeRecaptcha("login_and_signup");
      const LEndpoints: Record<FormMode, string> = {
        login: '/api/auth/login',
        signup: '/api/auth/signup',
        forgot: '/api/auth/reset-pwd',
      };

      const LPayloads: Record<FormMode, object> = {
        login: { usr: LEmail, pwd: LPassword },
        signup: { username: LUsername, email: LEmail },
        forgot: { email: LEmail },
      };

      const LdRecaptcha = await validateRecaptcha(LRecaptchaToken);
      if (!LdRecaptcha.success) {
        fnSetError("ReCAPTCHA verification failed. Please try again.");
        return;
      }

      const LdResponse = await fetch(LEndpoints[Lmode], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(LPayloads[Lmode]),
      });
      
      if (!LdResponse.ok) {
        const LdErrData = await LdResponse.json();
        fnSetError(LdErrData.error || `Invalid request during ${Lmode}`);
        // throw new Error(LdErrData.error || `Invalid request during ${Lmode}`);
        return
        }
      if (Lmode === 'forgot') {
        fnSetSuccessMsg({
          title: idLogin.loginAndSignUp.resetSuccessTitle || 'Action Required',
          description: idLogin.loginAndSignUp.resetPwdSuccessMessage || 'Password reset instructions have been sent to your email.'
        });
      } else if (Lmode === 'signup') {
        fnSetSuccessMsg({
          title: idLogin.loginAndSignUp.signupSuccessTitle || 'Registration Complete',
          description: idLogin.loginAndSignUp.signupSuccessMessage || 'Account created successfully! Redirecting...'
        });
      } else {
        window.location.href = '/';
      }
    } catch (idError: unknown) {
      console.error('Submission processing failure:', idError);
      fnSetError(idLogin.loginAndSignUp.errDefaultFallback || 'An unexpected connection error occurred.');
    } finally {
      fnSetSubmitting(false);
    }
  }

  const fnRenderIcon = (iIcon: Tbutton['icon']) => {
    const iconName = typeof iIcon === "string" ? iIcon : "Home";
    const IconComponent = getIconComponent(iconName);
    return <IconComponent className="w-5 h-5" />;
  };

  const LdUiConfig = {
    login: {
      title: idLogin.loginAndSignUp.loginTitle || 'Welcome Back',
      subtitle: idLogin.loginAndSignUp.loginSubtitle || 'Please enter your password to sign in',
      submitBtn: idLogin.loginAndSignUp.loginSubmitButton || 'Sign In',
      submittingBtn: idLogin.loginAndSignUp.loginSubmittingButton || 'Signing In...',
    },
    signup: {
      title: idLogin.loginAndSignUp.signupTitle || 'Create an Account',
      subtitle: idLogin.loginAndSignUp.signupSubtitle || 'Fill out the details below to register',
      submitBtn: idLogin.loginAndSignUp.signupSubmitButton || 'Sign Up',
      submittingBtn: idLogin.loginAndSignUp.signupSubmittingButton || 'Registering...',
    },
    forgot: {
      title: idLogin.loginAndSignUp.resetTitle || 'Reset Password',
      subtitle: idLogin.loginAndSignUp.resetSubtitle || 'Enter your email address to receive a recovery link',
      submitBtn: idLogin.loginAndSignUp.resetSubmitButton || 'Send Reset Link',
      submittingBtn: idLogin.loginAndSignUp.resestSubmittingButton || 'Sending Link...',
    },
  }[Lmode];

  // Track current step for Phase 2 sub-forms (1-based index)
  const [LSubStep, setLSubStep] = useState(1);

  // Group CMS fields into chunks of 3 fields per step
  const LFormFields = LdContent?.additionalDetailsForm?.fields || [];
  const LChunkSize = 3;
  const LTotalSubSteps = Math.ceil(LFormFields.length / LChunkSize) || 1;

  const LCurrentStepFields = LFormFields.slice(
    (LSubStep - 1) * LChunkSize,
    LSubStep * LChunkSize
  );

  // Validate required fields for the active step before advancing
  const fnCanAdvanceSubStep = () => {
    return LCurrentStepFields.every((field: any) => {
      if (!field.required) return true;
      const keyName = field.name || field.key;
      const val = LdCompanyDetails[keyName];
      return val && val.toString().trim().length > 0;
    });
  };

  // Overall progress: Email verification + additional detail steps
  const LTotalSteps = LTotalSubSteps + 1;

  const LCurrentProgressStep =
    LPhase === 1 ? 1 : LSubStep + 1;

  const LProgressPercentage =
    (LCurrentProgressStep / LTotalSteps) * 100;

  // Completion / Success Screen
  if (LdSuccessMsg && (Lmode === 'signup' || Lmode === 'forgot' || LAccessStage === 'review_pending')) {
    const LdStepLines = LdSuccessMsg.description.split(/(?<=[.!])\s+/).filter((line) => line.trim().length > 0);

    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-background">
        <div className="w-full max-w-lg p-8 bg-card text-card-foreground border border-border rounded-2xl shadow-xl text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto w-16 h-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-5">
            <CheckCircle2 className="w-10 h-10 stroke-[1.5]" />
          </div>

          <h2 className="text-2xl font-bold text-foreground tracking-tight mb-8">
            {LdSuccessMsg.title}
          </h2>

          <div className="flex flex-col gap-3.5 text-left mb-8">
            {LdStepLines.map((line, index) => (
              <div 
                key={index} 
                className="p-4 rounded-xl border border-border bg-muted/40 flex items-start gap-3.5 transition-colors hover:bg-muted/60"
              >
                <span className="w-6 h-6 shrink-0 bg-primary/10 text-primary rounded-full text-xs font-bold flex items-center justify-center mt-0.5">
                  {index + 1}
                </span>
                <p className="text-sm font-medium leading-relaxed text-foreground/90">
                  {line}
                </p>
              </div>
            ))}
          </div>

          <Link href={idLogin.loginAndSignUp.redirectButton?.href || "/"}>
            <Button className="w-full h-11 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm">
              {fnRenderIcon(idLogin.loginAndSignUp.redirectButton?.icon)}
              {idLogin.loginAndSignUp.redirectButton?.label || "Go Back Home"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="w-full max-w-lg p-8 bg-card text-card-foreground border border-border rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl">
        {/* ========================================================= */}
        {/* AUTOMATED VERIFYING LOADING STATE                         */}
        {/* ========================================================= */}
        {LAccessStage === "verifying" && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">
              {LdContent.loadingLabel || "Verifying access status..."}
            </p>
          </div>
        )}

        {/* ========================================================= */}
        {/* REQUEST DETAILS FORM (Combined Email + Company Details)   */}
        {/* ========================================================= */}
        {LAccessStage === "request_details" && (
          <div>
            <div className="border-b border-border pb-3 mb-5 flex flex-col">
              <div className="mb-2">
                <h3 className="text-2xl font-bold tracking-tight text-foreground">
                  {" "}
                  {LdContent?.additionalDetailsForm?.title ||
                    "Verification Required"}
                </h3>
                <p className="text-sm font-medium text-muted-foreground mt-1.5 mb-1.5">
                  {" "}
                  {LdContent?.additionalDetailsForm?.subtitle ||
                    "Please provide your details so we can verify and approve your access request."}
                </p>
              </div>
              {/* STEP COUNTER BADGE */}

              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300 ease-in-out"
                  style={{ width: `${LProgressPercentage}%` }}
                />
              </div>
            </div>

            {/* PHASE 1: EMAIL VERIFICATION */}
            {LPhase === 1 ? (
              <form onSubmit={fnHandleVerifyEmail} className="space-y-4">
                {LError && <FormMessage variant="error" description={LError} />}

                <FormInput
                  label={idLogin.loginAndSignUp.emailLabel || "Email Address"}
                  type="email"
                  required
                  value={LEmail}
                  onChange={fnSetEmail}
                  placeholder="name@company.com"
                />

                <Button
                  type="submit"
                  disabled={LbSubmitting}
                  className="w-full h-11 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  {LbSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Continue"
                  )}
                </Button>
              </form>
            ) : (
              /* PHASE 2: EXTRA DETAILS  */
              <form onSubmit={fnHandleBetaRequest} className="space-y-4">
                {LError && <FormMessage variant="error" description={LError} />}

                {/* DYNAMIC FIELDS  */}
                {LCurrentStepFields.map((field: any) => {
                  const keyName = field.name || field.key;
                  return (
                    <FormInput
                      key={keyName}
                      label={field.label}
                      type={field.type}
                      placeholder={field.placeholder}
                      required={field.required}
                      options={field.options}
                      rows={field.rows}
                      value={LdCompanyDetails[keyName] || ""}
                      onChange={(val) =>
                        fnSetCompanyDetails((idPrev) => ({
                          ...idPrev,
                          [keyName]: val,
                        }))
                      }
                    />
                  );
                })}

                {/* TERMS CONSENT CHECKBOX (FINAL STEP ONLY) */}
                {LSubStep === LTotalSubSteps &&
                  LdContent?.accessVerification?.termsConsent && (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="checkbox"
                        id="terms-consent"
                        required
                        className="h-4 w-4 rounded border-input text-primary focus:ring-primary/30 accent-primary cursor-pointer"
                      />
                      <label
                        htmlFor="terms-consent"
                        className="text-xs text-muted-foreground leading-none cursor-pointer"
                      >
                        {LdContent.accessVerification.termsConsent.label}{" "}
                        <a
                          href={`/${LLocale}/terms-and-conditions`}
                          target="_blank"
                          className="text-primary underline hover:text-primary/80"
                        >
                          {
                            LdContent.accessVerification.termsConsent
                              .termsLinkText
                          }
                        </a>{" "}
                        &{" "}
                        <a
                          href={`/${LLocale}/privacy-policy`}
                          target="_blank"
                          className="text-primary underline hover:text-primary/80"
                        >
                          {
                            LdContent.accessVerification.termsConsent
                              .privacyLinkText
                          }
                        </a>
                      </label>
                    </div>
                  )}

                {/* NAVIGATION BUTTONS */}
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (LSubStep > 1) {
                        setLSubStep((prev) => prev - 1);
                      } else {
                        setLPhase(1); // Go back to Phase 1 Email
                      }
                    }}
                    className="w-2/4 h-11 text-xs font-semibold"
                  >
                    {LdContent.backBtnLabel || "Back"}
                  </Button>

                  {LSubStep < LTotalSubSteps ? (
                    <Button
                      type="button"
                      onClick={() => {
                        if (fnCanAdvanceSubStep()) {
                          fnSetError(null);
                          setLSubStep((prev) => prev + 1);
                        } else {
                          fnSetError(
                            "Please fill out all required fields before proceeding.",
                          );
                        }
                      }}
                      className="w-2/4 h-11 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      {LdContent.nextBtnLabel || "Next"}
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={LbSubmitting}
                      className="w-2/3 h-11 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                    >
                      {LbSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        (LdContent?.additionalDetailsForm?.submitButton ??
                        "Submit Application")
                      )}
                    </Button>
                  )}
                </div>
              </form>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* APPROVED FORM (Sign In / Register Mode)                   */}
        {/* ========================================================= */}
        {LAccessStage === "approved_form" && (
          <div>
            {LdAccessMsg && (
              <div className="mb-4">
                <FormMessage
                  variant="success"
                  title={LdAccessMsg.title}
                  description={LdAccessMsg.description}
                />
              </div>
            )}

            <div className="flex flex-col items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">
                {LdUiConfig.title}
              </h2>
              <p className="text-sm text-muted-foreground mt-1 text-center">
                {LdUiConfig.subtitle}
              </p>
            </div>

            <form onSubmit={fnHandleSubmit} className="flex flex-col gap-5">
              {LError && <FormMessage variant="error" description={LError} />}

              {/* EMAIL FIELD WITH CHANGE OPTION */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {idLogin.loginAndSignUp.emailLabel || "Email Address"}
                  </label>
                  {/* CHANGE EMAIL ACTION */}
                  <button
                    type="button"
                    onClick={() => {
                      fnSetAccessStage("request_details");
                      fnSetAccessMsg(null);
                    }}
                    className="text-xs font-medium text-primary hover:underline focus:outline-none"
                  >
                    {LdContent.emailChange || "Change Email"}
                  </button>
                </div>
                <Input
                  type="email"
                  required
                  disabled
                  value={LEmail}
                  onChange={(e) => fnSetEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="h-10 rounded-lg text-sm bg-muted"
                />
              </div>
              {Lmode === "signup" && (
                <FormInput
                  label={idLogin.loginAndSignUp.usernameLabel || "Username"}
                  type="text"
                  required
                  value={LUsername}
                  onChange={fnSetUsername}
                  placeholder="Full Name"
                />
              )}

              {Lmode === "login" && (
                <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {idLogin.loginAndSignUp.passwordLabel || "Password"}
                    </label>
                    <button
                      type="button"
                      onClick={() => fnSwitchMode("forgot")}
                      className="text-xs font-medium text-primary hover:underline focus:outline-none"
                    >
                      {idLogin.loginAndSignUp.resetLabel || "Forgot Password?"}
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type={LbShowPassword ? "text" : "password"}
                      required
                      value={LPassword}
                      onChange={(Le) => fnSetPassword(Le.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 pl-3.5 pr-11 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    />
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => fnSetShowPassword(!LbShowPassword)}
                      className="absolute right-3 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors focus:outline-none"
                    >
                      {LbShowPassword ? (
                        <EyeOff className="w-4 h-4 stroke-[2]" />
                      ) : (
                        <Eye className="w-4 h-4 stroke-[2]" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={LbSubmitting}
                className="h-11 mt-2 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center disabled:opacity-50 shadow-sm"
              >
                {LbSubmitting ? LdUiConfig.submittingBtn : LdUiConfig.submitBtn}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground border-t border-border pt-4">
              {Lmode === "login" && (
                <p>
                  {idLogin.loginAndSignUp.loginFooterText}{" "}
                  <button
                    onClick={() => fnSwitchMode("signup")}
                    className="font-semibold text-primary hover:underline focus:outline-none"
                  >
                    {idLogin.loginAndSignUp.loginFooterAction}
                  </button>
                </p>
              )}
              {Lmode === "signup" && (
                <p>
                  {idLogin.loginAndSignUp.signupFooterText}{" "}
                  <button
                    onClick={() => fnSwitchMode("login")}
                    className="font-semibold text-primary hover:underline focus:outline-none"
                  >
                    {idLogin.loginAndSignUp.signupFooterAction}
                  </button>
                </p>
              )}
              {Lmode === "forgot" && (
                <p>
                  {idLogin.loginAndSignUp.resetFooterText}{" "}
                  <button
                    type="button"
                    onClick={() => fnSwitchMode("login")}
                    className="font-semibold text-primary hover:underline focus:outline-none"
                  >
                    {idLogin.loginAndSignUp.resetFooterAction}
                  </button>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable input field component
function FormInput({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  options = [],
  rows = 3,
  className = '',
}: {
  label?: string;
  type?: 'text' | 'email' | 'url' | 'password' | 'textarea' | 'select' | string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  options?: string[];
  rows?: number;
  className?: string;
}) {
  const renderControl = () => {
    switch (type) {
      case 'select':
        return (
          <select
            value={value || ''}
            required={required}
            onChange={(e) => onChange(e.target.value)}
            className={`flex h-10 w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${className}`}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case 'textarea':
        return (
          <Textarea
            placeholder={placeholder}
            value={value || ''}
            required={required}
            rows={rows}
            onChange={(e) => onChange(e.target.value)}
            className={`rounded-lg text-sm bg-muted resize-y min-h-[80px] ${className}`}
          />
        );
      default:
        return (
          <Input
            type={type}
            placeholder={placeholder}
            value={value || ''}
            required={required}
            onChange={(e) => onChange(e.target.value)}
            className={`h-10 rounded-lg text-sm bg-muted placeholder:text-muted-foreground/60 ${className}`}
          />
        );
    }
  };

  return (
    <div className="flex flex-col gap-1.5 animate-in fade-in duration-200">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
      )}
      {renderControl()}
    </div>
  );
}

// Reusable message banner
function FormMessage({ 
  variant, 
  title, 
  description 
}: { 
  variant: 'error' | 'success'; 
  title?: string; 
  description: string; 
}) {
  const LIsError = variant === 'error';
  
  const LContainerStyles = LIsError 
    ? 'bg-destructive/5 text-destructive border-destructive/20' 
    : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
  const Icon = LIsError ? AlertCircle : CheckCircle2;

  return (
    <div className={`p-4 text-sm rounded-xl border flex items-start gap-3 animate-in fade-in-50 duration-200 ${LContainerStyles}`}>
      <Icon className="w-5 h-5 shrink-0 mt-0.5" /> 
      <div className="flex-1 text-left flex flex-col gap-0.5 leading-relaxed">
        {title && (
          <h3 className="font-bold text-sm tracking-tight">
            {title}
          </h3>
        )}
        <p className="font-medium text-xs opacity-90">
          {description}
        </p>
      </div>
    </div>
  );
}