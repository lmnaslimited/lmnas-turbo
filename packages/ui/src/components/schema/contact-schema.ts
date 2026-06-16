import { z } from "zod";

// Keep the schema keys/output aligned with TContactFormValues in the middleware
// package so react-hook-form's resolver type matches exactly.
export const contactSchema = z.object({
    fullName: z.string()
        .min(1, "Full Name is required")
        .max(100, "Full Name must be less than 100 characters"),
    email: z.string()
        .email("Invalid email address")
        .max(100, "Email must be less than 100 characters"),
    companyName: z.string()
        .min(1, "Company Name is required")
        .max(100, "Company Name must be less than 100 characters"),
    phone: z.string()
        .min(10, "Phone number must be at least 10 digits")
        .max(15, "Phone number must be less than 15 digits"),
    message: z.string()
        .min(1, "Message is required")
        .max(500, "Message must be less than 500 characters"),
    newsletter: z.boolean().default(false),
});
