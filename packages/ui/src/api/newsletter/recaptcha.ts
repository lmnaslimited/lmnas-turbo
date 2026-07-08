"use server"
// Function to verify reCAPTCHA token using Google's siteverify API
async function fnVerifyRecaptcha(
    iToken: string
  ): Promise<{ isHuman: boolean; score: number }> {
    const LSecretKey = process.env.RECAPTCHA_SECRET_KEY
    const LRecaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${LSecretKey}&response=${iToken}`
  
    try {
      const LdResponse = await fetch(LRecaptchaUrl, { method: "POST" });
      const LdData = await LdResponse.json();
      return {
        isHuman: LdData.success && LdData.score >= 0.5,
        score: LdData.score ?? 0,
      };
    } catch (error) {
      console.error("reCAPTCHA verification error:", error);
      return { isHuman: false, score: 0 };
    }
  }

  export async function validateRecaptcha(
    iRecaptcha: string
): Promise<{
    success: boolean
    message?: string
    score: number
}> {
    const { isHuman, score } = await fnVerifyRecaptcha(iRecaptcha)

    if (!isHuman) {
        return {
            success: false,
            message: "reCAPTCHA verification failed.",
            score,
        }
    }

    return {
        success: true,
        message: "reCAPTCHA verification was successfull",
        score,
    }
}