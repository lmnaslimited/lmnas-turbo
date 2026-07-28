'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Tbutton, TLoginTarget } from '@repo/middleware/types';
import { Button } from '@repo/ui/components/ui/button';
import Link from 'next/link';
import { getIconComponent } from '@repo/ui/lib/icon';
import { useReCaptcha } from "next-recaptcha-v3"
import { validateRecaptcha } from '@repo/ui/api/newsletter/recaptcha';

type FormMode = 'login' | 'signup' | 'forgot';

// Manages the complete authentication flow, including login, registration,
// password recovery, and post-action success states.
export default function LoginForm({ idLogin }: { idLogin: TLoginTarget }) {
  // Tracks the currently active authentication flow.
  const [Lmode, fnSetMode] = useState<FormMode>('signup');

  // Stores user input for each authentication form.
  const [LUsername, fnSetUsername] = useState('');
  const [LEmail, fnSetEmail] = useState('');
  const [LPassword, fnSetPassword] = useState('');

  // Controls UI feedback during form submission.
  const [LbSubmitting, fnSetSubmitting] = useState(false);
  const [LError, fnSetError] = useState<string | null>(null);
  const [LSuccess, fnSetSuccess] = useState<string | null>(null);

  // Controls password visibility within the login form.
  const [LbShowPassword, fnSetShowPassword] = useState(false);

  const { executeRecaptcha } = useReCaptcha();

  // Switches between authentication modes while resetting transient form state.
  const fnSwitchMode = (iNewMode: FormMode) => {
    fnSetMode(iNewMode);
    fnSetError(null);
    fnSetSuccess(null);
    fnSetPassword('');
  };

  // Initiates Google OAuth authentication.
  function fnHandleGoogleLogin() {
    window.location.href = '/api/auth/google';
  }

  // Processes authentication requests for the active form mode.
  async function fnHandleSubmit(idEvent: React.FormEvent) {
    idEvent.preventDefault();
    fnSetSubmitting(true);
    fnSetError(null);
    fnSetSuccess(null);
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
        fnSetSuccess(idLogin.loginAndSignUp.resetPwdSuccessMessage || 'If this email is registered with us, we have sent password reset instructions to it. Please check your inbox.');
      } else if (Lmode === 'signup') {
        fnSetSuccess(idLogin.loginAndSignUp.signupSuccessMessage || 'Account created successfully! Redirecting...');
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
    if (LSuccess && (Lmode === 'signup' || Lmode === 'forgot')) {
      // Dynamically map sentence text chunks into individual sequential rows
      const LdStepLines = LSuccess.split(/(?<=[.!])\s+/).filter((line) => line.trim().length > 0);
  
      return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-background">
          <div className="w-full max-w-lg p-8 bg-card text-card-foreground border border-border rounded-2xl shadow-xl text-center animate-in fade-in zoom-in-95 duration-300">
            
            {/* Action Success Header Icon Accent */}
            <div className="mx-auto w-16 h-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-5">
              <CheckCircle2 className="w-10 h-10 stroke-[1.5]" />
            </div>
  
            <h2 className="text-2xl font-bold text-foreground tracking-tight mb-8">
              {Lmode === 'signup' ? idLogin.loginAndSignUp.signupSuccessTitle || 'Registration Complete' : idLogin.loginAndSignUp.resetSuccessTitle || 'Action Required'}
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
        
        {/* Header Block */}
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">{LdUiConfig.title}</h2>
          <p className="text-sm text-muted-foreground mt-1 text-center">{LdUiConfig.subtitle}</p>
        </div>
        
        <form onSubmit={fnHandleSubmit} className="flex flex-col gap-5">
          {/* Status Banners */}
          {LError && <FormMessage variant="error" msg={LError} />}
          {LSuccess && <FormMessage variant="success" msg={LSuccess} />}

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
    </div>
  );
}

// Reusable input field used throughout the authentication forms.
function FormInput({ label, type, value, onChange, placeholder }: {
  label: string;
  type: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      <input
        type={type}
        required
        value={value}
        onChange={(Le) => onChange(Le.target.value)}
        placeholder={placeholder}
        className="h-11 px-3.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
      />
    </div>
  );
}

// Reusable status message component for success and error notifications.
function FormMessage({ variant, msg }: { variant: 'error' | 'success'; msg: string }) {
  const LIsError = variant === 'error';
  
  const LContainerStyles = LIsError 
    ? 'bg-destructive/5 text-destructive border-destructive/20' 
    : 'bg-emerald-500/10 text-primary border-emerald-500/20';

  const Icon = LIsError ? AlertCircle : CheckCircle2;

  // Split lines based on punctuation
  const LaLines = msg
    .split(/(?<=[.!])\s+/)
    .filter((line) => line.trim().length > 0);

  // Separate the first line to act as a title, and the rest as body
  const [LTitle, ...LaBodyLines] = LaLines;

  return (
    <div className={`p-4 text-sm rounded-xl border flex items-start gap-3 animate-in fade-in-50 duration-200 ${LContainerStyles}`}>
      {/* Icon aligns perfectly with the bold title */}
      <Icon className="w-5 h-5 shrink-0 mt-0.5" /> 
      
      <div className="flex-1 text-left flex flex-col gap-1 leading-relaxed">
        {/* Render the first line slightly more emphasized */}
        <span className="block font-semibold">
          {LTitle}
        </span>
        
        {/* Render the rest of the lines with a slightly softer font weight */}
        {LaBodyLines.map((iLine, iIndex) => (
          <span key={iIndex} className="block font-medium text-sm opacity-90 mt-0.5">
            {iLine}
          </span>
        ))}
      </div>
    </div>
  );
}