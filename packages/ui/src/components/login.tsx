'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { Tbutton, TLoginTarget } from '@repo/middleware/types';
import { Button } from '@repo/ui/components/ui/button';
import Link from 'next/link';
import { getIconComponent } from '@repo/ui/lib/icon';
import { useReCaptcha } from "next-recaptcha-v3"
import { validateRecaptcha } from '@repo/ui/api/newsletter/recaptcha';
import { fnLeadToOpportunity } from "../api/casestudy/create-lead-opportunity";
import { fnCheckUserApproval } from "../api/crm/check-user-approval";
import { Textarea } from "./ui/textarea";
import posthog from "posthog-js";
import { useParams } from 'next/navigation';
import { Input } from './ui/input';


type FormMode = 'login' | 'signup' | 'forgot';
type AccessStage = 'verify_email' | 'approved_form' | 'request_details' | 'review_pending';

// Manages the complete authentication flow, including login, registration,
// password recovery, and post-action success states.
export default function LoginForm({ idLogin }: { idLogin: TLoginTarget }) {
  const [LAccessStage, fnSetAccessStage] = useState<AccessStage>('verify_email');
  const [LHasConsent, fnSetHasConsent] = useState(false);

  // Tracks the currently active authentication flow.
  const [Lmode, fnSetMode] = useState<FormMode>('signup');

  // Stores user input for each authentication form.
  const [LUsername, fnSetUsername] = useState('');
  const [LEmail, fnSetEmail] = useState('');
  const [LPassword, fnSetPassword] = useState('');

  // Controls UI feedback during form submission.
  const [LbSubmitting, fnSetSubmitting] = useState(false);
  const [LError, fnSetError] = useState<string | null>(null);
  // const [LSuccess, fnSetSuccess] = useState<string | null>(null);
  const [LdSuccessMsg, fnSetSuccessMsg] = useState<{ title: string; description: string } | null>(null);
  const [LdAccessMsg, fnSetAccessMsg] = useState<{ title: string; description: string } | null>(null)

  // Controls password visibility within the login form.
  const [LbShowPassword, fnSetShowPassword] = useState(false);

  const [LdCompanyDetails, fnSetCompanyDetails] = useState({
    companyName: "",
    companyDomain: "",
    companyWebsite: "",
    employeeCount: "",
    interestReason: "",
  });

  // Retrieves the current locale from the route parameters.
  const LdParams = useParams();
  // Extract the locale value from the route parameters.
  const LLocale = LdParams.locale as string;

  // Extract content safely from cms
  const LAccessContent = idLogin?.loginAndSignUp?.accessVerifyContent;

  const LCurrentLocale = (LLocale && LAccessContent && LLocale in LAccessContent) 
    ? LLocale 
    : 'en';

  const LdContent = (LAccessContent?.[LCurrentLocale] || LAccessContent?.en) as Record<string, any>

  const { executeRecaptcha } = useReCaptcha();

  // Switches between authentication modes while resetting transient form state.
  const fnSwitchMode = (iNewMode: FormMode) => {
    fnSetMode(iNewMode);
    fnSetError(null);
    fnSetSuccessMsg(null);
    fnSetPassword('');
  };

  // Initiates Google OAuth authentication.
  function fnHandleGoogleLogin() {
    window.location.href = '/api/auth/google';
  }

  /**
 * Verifies whether the entered email already has beta access.
 *
 * Flow:
 * 1. Validates the email and verifies reCAPTCHA.
 * 2. Identifies the user in PostHog for analytics.
 * 3. Checks the user's approval status from CRM.
 * 4. Routes the user based on the result:
 *    - Approved → Show Sign In / Sign Up form.
 *    - Pending Review → Display review pending message.
 *    - Not Found → Open the additional details request form and enroll for the beta flow.
 */
  async function fnHandleVerifyEmail(idEvent: React.FormEvent) {
    // state clean up
    idEvent.preventDefault();
    fnSetError(null);
    fnSetAccessMsg(null)
    fnSetSuccessMsg(null)

    // trim the email
    const LTrimmedEmail = LEmail.trim().toLowerCase();
    if (!LTrimmedEmail) return;

    fnSetSubmitting(true);
    try {
      // Recaptcha verification
      const LRecaptchaToken = await executeRecaptcha("verify_access_email");
      const LdRecaptcha = await validateRecaptcha(LRecaptchaToken);
      
      if (!LdRecaptcha.success) {
        fnSetError(LdContent.errorMessages.recaptchaFailed || "Sorry, we couldn't verify you're human, please try again.");
        return;
      }
      // Identify the user in PostHog for future analytics.
      posthog.identify(LTrimmedEmail, {
          email: LTrimmedEmail,
      })

      const LApprovalResult = await fnCheckUserApproval(LTrimmedEmail);

      if (LApprovalResult.approved) {
        // CRM Approved -> Unlock Sign In / Sign Up form
        fnSetAccessMsg({
          title: LdContent.accessGrantedBanner.title || "Access Granted!",
          description: LdContent.accessGrantedBanner.description || "Your email has been verified. Please sign in or register your account below."
        });
        fnSetAccessStage('approved_form');
      } else if (LApprovalResult.reason === "NOT_QUALIFIED") {
        // Lead exists, but opp is not qualified -> Review message
        fnSetSuccessMsg({
          title: LdContent.reviewPending.titlePending || "Request Pending!",
          description: LdContent.reviewPending.descriptionPending || "Your request has been pending in review! Our team will send an update to your email."
        });
        fnSetAccessStage('review_pending');
      } else {
        // Lead Not Found -> Open More Details Form
        fnSetAccessStage('request_details');
        posthog.updateEarlyAccessFeatureEnrollment(
            "new-pricing-beta",
            true
        );
      }
    } catch (idError) {
      console.error('Email verification failure:', idError);
      fnSetError(idLogin.loginAndSignUp.errDefaultFallback || 'An unexpected connection error occurred.');
    } finally {
      fnSetSubmitting(false);
    }
  }

  /**
 * Submits a beta access request for users who are not yet approved.
 *
 * Flow:
 * 1. Generates a display name from the entered email.
 * 2. Verifies the user with reCAPTCHA.
 * 3. Creates or updates a CRM Lead and Opportunity with the provided company details.
 * 4. Sends the beta access request for review.
 * 5. Displays a success message if submitted, otherwise shows an error.
 */
  async function fnHandleBetaRequest(idEvent: React.FormEvent) {
    // state clean up
    idEvent.preventDefault();
    fnSetError(null);
    fnSetAccessMsg(null)
    fnSetSubmitting(true);

    try {
      const LTrimmedEmail = LEmail.trim().toLowerCase();
      const LEmailPrefix = LTrimmedEmail.split("@")[0];
      const LGeneratedName = LEmailPrefix
        ? LEmailPrefix.split(/[\._\-]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
        : "";

      if(LdContent.LeadProcess.IsNeeded){
        const LRecaptchaToken = await executeRecaptcha("beta_request");
      
        const LdLeadResult = await fnLeadToOpportunity({
          email: LTrimmedEmail,
              name: LGeneratedName,
              recaptchaToken: LRecaptchaToken,
              companyName: LdCompanyDetails.companyName,
              companyDomain: LdCompanyDetails.companyDomain,
              companyWebsite: LdCompanyDetails.companyWebsite,
              employeeCount: LdCompanyDetails.employeeCount,
              interestReason: LdCompanyDetails.interestReason,
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
          fnSetSuccessMsg({
            title: LdContent.reviewPending.titleSubmitted || "Application Submitted Successfully!",
            description: LdContent.reviewPending.descriptionSubmitted || "Thank you for applying. Our team will review your details and notify you via email once access is approved."
          });
          fnSetAccessStage('review_pending');
        } else {
          fnSetError(LdContent.errorMessages.requestFailed || "Failed to submit verification request. Please try again.");
        }
      }
    } catch (idError) {
      console.error('Beta request failure:', idError);
      fnSetError(idLogin.loginAndSignUp.errDefaultFallback || 'An unexpected connection error occurred.');
    } finally {
      fnSetSubmitting(false);
    }
  }


  // Processes authentication requests for the active form mode.
  async function fnHandleSubmit(idEvent: React.FormEvent) {
    idEvent.preventDefault();
    fnSetSubmitting(true);
    fnSetError(null);
    fnSetAccessMsg(null)
    fnSetSuccessMsg(null);
    try{
        // Generate a reCAPTCHA token for bot verification.
        const LRecaptchaToken = await executeRecaptcha("ogin_and_signup")

        // Endpoint configuration
        const LEndpoints: Record<FormMode, string> = {
            login: '/api/auth/login',
            signup: '/api/auth/signup',
            forgot: '/api/auth/reset-pwd',
            };

        // payload configuration
        const LPayloads: Record<FormMode, object> = {
            login: { usr: LEmail, pwd: LPassword },
            signup: { username: LUsername, email: LEmail },
            forgot: { email: LEmail },
            };

       // Verify the generated reCAPTCHA token with the backend.
       const LdRecaptcha = await validateRecaptcha(LRecaptchaToken)

       // Stop the flow if reCAPTCHA verification fails.
       if (!LdRecaptcha.success) {
         fnSetError("Sorry, we couldn't verfiy your human, please try again");
         return
       }
      const LdResponse = await fetch(LEndpoints[Lmode], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(LPayloads[Lmode]),
      });
      
      if (!LdResponse.ok) {
        const LdErrData = await LdResponse.json();
        throw new Error(LdErrData.error || `Invalid request during ${Lmode}`);
      }
      
      if (Lmode === 'forgot') {
        // fnSetSuccess(idLogin.loginAndSignUp.resetPwdSuccessMessage || 'If this email is registered with us, we have sent password reset instructions to it. Please check your inbox.');
        fnSetSuccessMsg({
          title: idLogin.loginAndSignUp.resetSuccessTitle || 'Action Required',
          description: idLogin.loginAndSignUp.resetPwdSuccessMessage || 'If this email is registered with us, we have sent password reset instructions to it.'
        });
      } else if (Lmode === 'signup') {
        // fnSetSuccess(idLogin.loginAndSignUp.signupSuccessMessage || 'Account created successfully! Redirecting...');
        fnSetSuccessMsg({
          title: idLogin.loginAndSignUp.signupSuccessTitle || 'Registration Complete',
          description: idLogin.loginAndSignUp.signupSuccessMessage || 'Account created successfully! Redirecting...'
        });
        // setTimeout(() => { window.location.href = '/'; }, 1500);
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

  // Resolves and renders the configured icon component.
  const fnRenderIcon = (iIcon: Tbutton['icon']) => {
      const iconName = typeof iIcon === "string" ? iIcon : "Home";
      const IconComponent = getIconComponent(iconName);
      return <IconComponent className="w-5 h-5" />;
    };
  
  // Centralizes mode-specific UI labels and button text.
  const LdUiConfig = {
    login: {
      title: idLogin.loginAndSignUp.loginTitle || 'Welcome Back',
      subtitle: idLogin.loginAndSignUp.loginSubtitle || 'Please enter your details to sign in',
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
      subtitle:  idLogin.loginAndSignUp.resetSubtitle || 'Enter your email address to receive a recovery link',
      submitBtn:  idLogin.loginAndSignUp.resetSubmitButton || 'Send Reset Link',
      submittingBtn:  idLogin.loginAndSignUp.resestSubmittingButton || 'Sending Link...',
    },
  }[Lmode];

    // Displays the completion screen after successful registration or password recovery.
    if (LdSuccessMsg && (Lmode === 'signup' || Lmode === 'forgot')) {
      // Dynamically map sentence text chunks into individual sequential rows
      const LdStepLines = LdSuccessMsg.description.split(/(?<=[.!])\s+/).filter((line) => line.trim().length > 0);
  
      return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-background">
          <div className="w-full max-w-lg p-8 bg-card text-card-foreground border border-border rounded-2xl shadow-xl text-center animate-in fade-in zoom-in-95 duration-300">
            {/* Action Success Header Icon Accent */}
            <div className="mx-auto w-16 h-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-5">
              <CheckCircle2 className="w-10 h-10 stroke-[1.5]" />
            </div>
  
            <h2 className="text-2xl font-bold text-foreground tracking-tight mb-8">
              {/* {Lmode === 'signup' ? idLogin.loginAndSignUp.signupSuccessTitle || 'Registration Complete' : idLogin.loginAndSignUp.resetSuccessTitle || 'Action Required'} */}
              {LdSuccessMsg.title}
            </h2>
  
            {/* Checklist Dynamic Stack */}
            <div className="flex flex-col gap-3.5 text-left mb-8">
              {LdStepLines.map((line, index) => (
                <div 
                  key={index} 
                  className="p-4 rounded-xl border border-border bg-muted/40 flex items-start gap-3.5 transition-colors hover:bg-muted/60"
                >
                  {/* Numeric Completion Step Badge */}
                  <span className="w-6 h-6 shrink-0 bg-primary/10 text-primary rounded-full text-xs font-bold flex items-center justify-center mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-sm font-medium leading-relaxed text-foreground/90">
                    {line}
                  </p>
                </div>
              ))}
            </div>
  
            {/* Centralized Home Action Trigger */}
            <Link href={idLogin.loginAndSignUp.redirectButton.href || "/"}>
            <Button
              
              className="w-full h-11 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {fnRenderIcon(idLogin.loginAndSignUp.redirectButton.icon)}
             {idLogin.loginAndSignUp.redirectButton.label || "Go Back Home"}
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
        {/* PHASE 1: INITIAL EMAIL & TERMS CHECKPOINT                 */}
        {/* ========================================================= */}
        {LAccessStage === 'verify_email' && (
          <div>
            <div className="flex flex-col items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">{LdContent?.accessVerification?.title ?? "Verify Access"}</h2>
              <p className="text-sm text-muted-foreground mt-1 text-center">{LdContent?.accessVerification?.subtitle ?? "Enter your email address to check your status."}</p>
            </div>

            <form onSubmit={fnHandleVerifyEmail} className="flex flex-col gap-5">
              {LError && <FormMessage 
                variant="error" 
                title="" 
                description={LError} 
              />}
              <FormInput
                label={idLogin.loginAndSignUp.emailLabel || "Email Address"}
                type="email"
                value={LEmail}
                onChange={fnSetEmail}
                placeholder="name@company.com"
              />
              {/* TERMS & PRIVACY CONSENT CHECKBOX */}
              {LdContent?.accessVerification?.termsConsent && (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="checkbox"
                    id="terms-consent"
                    required
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary/30 accent-primary cursor-pointer"
                  />
                  <label htmlFor="terms-consent" className="text-xs text-muted-foreground leading-none cursor-pointer">
                    {LdContent.accessVerification.termsConsent.label}{' '}
                    <a href="/terms" target="_blank" className="text-primary underline hover:text-primary/80">
                      {LdContent.accessVerification.termsConsent.termsLinkText}
                    </a>{' '}
                    &{' '}
                    <a href="/privacy" target="_blank" className="text-primary underline hover:text-primary/80">
                      {LdContent.accessVerification.termsConsent.privacyLinkText}
                    </a>
                  </label>
                </div>
              )}
              <Button
                type="submit"
                disabled={LbSubmitting}
                className="h-11 mt-2 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
              >
                {LbSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><span>{(LdContent?.accessVerification?.submitButton ?? "Continue")}</span><ArrowRight className="h-4 w-4" /></>}
              </Button>
            </form>
          </div>
        )}
        {/* ========================================================= */}
        {/* PHASE 2: MORE DETAILS FORM (Lead Not Found)               */}
        {/* ========================================================= */}
        {LAccessStage === 'request_details' && (
          <div>
            <div className="border-b border-border pb-3 mb-5">
              <h3 className="text-lg font-semibold text-foreground">{ LdContent?.additionalDetailsForm?.title || "Verification Required"}</h3>
              <p className="text-sm text-muted-foreground mt-1">{ LdContent?.additionalDetailsForm?.subtitle || "Please provide additional details so we can verify and approve your access request"}</p>
            </div>

            <form onSubmit={fnHandleBetaRequest} className="space-y-4">
              {LError && <FormMessage 
                variant="error" 
                title="" 
                description={LError} 
              />}
              
              {LdContent?.additionalDetailsForm?.fields?.map((field: any) => (
                <FormInput
                  key={field.name || field.key}
                  label={field.label}
                  type={field.type}
                  placeholder={field.placeholder}
                  required={field.required}
                  options={field.options}
                  value={(LdCompanyDetails as Record<string, any>)[field.name || field.key] || ''}
                  onChange={(val) =>
                    fnSetCompanyDetails((idPrev) => ({
                      ...idPrev,
                      [field.name || field.key]: val,
                    }))
                  }
                />
              ))}

              <Button
                type="submit"
                disabled={LbSubmitting}
                className="w-full h-11 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
              >
                {LbSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (LdContent?.additionalDetailsForm?.submitButton ?? "Submit Application")}
              </Button>
            </form>
          </div>
        )}
        {LAccessStage === 'approved_form' && (
          <div>
            {LdAccessMsg && (
              <div className='mb-2'>
                <FormMessage 
                  variant="success" 
                  title={LdAccessMsg.title} 
                  description={LdAccessMsg.description} 
                />
              </div>
            )}
        {/* Header Block */}
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">{LdUiConfig.title}</h2>
          <p className="text-sm text-muted-foreground mt-1 text-center">{LdUiConfig.subtitle}</p>
        </div>
        
        <form onSubmit={fnHandleSubmit} className="flex flex-col gap-5">
          {/* Status Banners */}
          {LError && <FormMessage 
              variant="error" 
              title="" 
              description={LError} 
            />}
          {LdSuccessMsg && <FormMessage 
            variant="success" 
            title={LdSuccessMsg.title} 
            description={LdSuccessMsg.description} 
          />}

          {/* Form Fields Rendering Contextually based on Mode */}
          {Lmode === 'signup' && (
            <FormInput
              label={idLogin.loginAndSignUp.usernameLabel}
              type="text"
              value={LUsername}
              onChange={fnSetUsername}
              placeholder="johndoe"
            />
          )}

          <FormInput
            label={idLogin.loginAndSignUp.emailLabel}
            type="email"
            value={LEmail}
            onChange={fnSetEmail}
            placeholder="name@company.com"
          />

          {Lmode === 'login' && (
            <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {idLogin.loginAndSignUp.passwordLabel}
                </label>
                <button
                  type="button"
                  onClick={() => fnSwitchMode('forgot')}
                  className="text-xs font-medium text-primary hover:underline focus:outline-none"
                >
                  {idLogin.loginAndSignUp.resetLabel || "Forget Password"}
                </button>
              </div>
              <div className="relative flex items-center">
                <input
                  type={LbShowPassword ? 'text' : 'password'}
                  required
                  value={LPassword}
                  onChange={(Le) => fnSetPassword(Le.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-3.5 pr-11 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                />
                <Button
                  variant="ghost"
                  onClick={() => fnSetShowPassword(!LbShowPassword)}
                  className="absolute right-3 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors focus:outline-none"
                  title={LbShowPassword ? 'Hide password' : 'Show password'}
                >
                  {LbShowPassword ? <EyeOff className="w-4 h-4 stroke-[2]" /> : <Eye className="w-4 h-4 stroke-[2]" />}
                </Button>
              </div>
            </div>
          )}

          {/* Main Action Submit Button */}
          <Button
            type="submit"
            disabled={LbSubmitting}
            className="h-11 mt-2 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center disabled:opacity-50 shadow-sm"
          >
            {LbSubmitting ? LdUiConfig.submittingBtn : LdUiConfig.submitBtn}
          </Button>
        </form>

        {/* Social Authentication Layer */}
        {/* {Lmode !== 'forgot' && (
          <div className="mt-5 flex flex-col gap-4">
            <div className="relative flex items-center justify-center my-1 text-xs uppercase">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <span className="relative bg-card px-2 text-muted-foreground">
                {idLogin.loginAndSignUp.dividerText}
              </span>
            </div>

            <Button
              variant="outline"
              onClick={fnHandleGoogleLogin}
              className="h-11 w-full bg-background hover:bg-muted/50 border border-border text-foreground text-sm font-medium rounded-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 shadow-sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {idLogin.loginAndSignUp.googleButtonText}
            </Button>
          </div>
        )} */}

        {/* Global Footer Sub-navigation */}
        <div className="mt-6 text-center text-sm text-muted-foreground border-t border-border pt-4">
          {Lmode === 'login' && (
            <p>
              {idLogin.loginAndSignUp.loginFooterText}{' '}
              <button onClick={() => fnSwitchMode('signup')} className="font-semibold text-primary hover:underline focus:outline-none">
                {idLogin.loginAndSignUp.loginFooterAction}
              </button>
            </p>
          )}
          {Lmode === 'signup' && (
            <p>
              {idLogin.loginAndSignUp.signupFooterText}{' '}
              <button onClick={() => fnSwitchMode('login')} className="font-semibold text-primary hover:underline focus:underline-none">
                {idLogin.loginAndSignUp.signupFooterAction}
              </button>
            </p>
          )}
          {Lmode === 'forgot' && (
            <p>
            {idLogin.loginAndSignUp.resetFooterText}{' '}
            <button type="button" onClick={() => fnSwitchMode('login')} className="font-semibold text-primary hover:underline focus:outline-none">
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

// Reusable input field used throughout the authentication forms.
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
            className={`rounded-lg text-sm bg-muted ${className}`}
          />
        );

      default:
        // Handles text, email, url, password, etc.
        return (
          <Input
            type={type}
            placeholder={placeholder}
            value={value || ''}
            required={required}
            onChange={(e) => onChange(e.target.value)}
            className={`h-10 rounded-lg text-sm bg-muted ${className}`}
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

// Reusable status message component for success and error notifications.
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