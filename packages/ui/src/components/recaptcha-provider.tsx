"use client";

import { ReCaptchaProvider } from "next-recaptcha-v3";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function AppRecaptchaProvider({
  children,
}: {
  children: React.ReactNode;
}) {
    const LdParams = useParams();
    const Locale = LdParams.locale as string;
    /*
    on switching the language using useRouter will remount the client component 
    which include Form component too in app router, but the recaptchaProvider will not re render due
    to its default behaviour of only inserting the <script> once,
    so we need to remove the script and inject with script that use new lang

    github ref: https://github.com/snelsi/next-recaptcha-v3/issues/164
    */
    const fnReloadRecaptchaScript = (ikey: string, iLang: string) => {
        const ExistingScript = document.getElementById("google-recaptcha-v3");
        if (ExistingScript) {
            ExistingScript.remove(); // remove old script
        }

        const LdScript = document.createElement("script");
        LdScript.src = `https://www.google.com/recaptcha/api.js?render=${ikey}&hl=${iLang}`;
        LdScript.id = "google-recaptcha-v3";
        LdScript.async = true;
        LdScript.defer = true;
        document.body.appendChild(LdScript);
    };
    const LRecaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

    useEffect(() => {
        fnReloadRecaptchaScript(LRecaptchaSiteKey, Locale);
    }, [Locale, LRecaptchaSiteKey]);
    
  return (
    <ReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ""}
    >
      {children}
    </ReCaptchaProvider>
  );
}