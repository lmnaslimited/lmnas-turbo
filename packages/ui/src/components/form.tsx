"use client"
import { useState, useRef, useEffect, type ReactElement, type ReactNode } from "react"
import { ReCaptchaProvider, useReCaptcha } from "next-recaptcha-v3"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns/format"
import { CalendarIcon } from "lucide-react"
import { cn } from "@repo/ui/lib/utils"
import { Button } from "@repo/ui/components/ui/button"
import { Calendar } from "@repo/ui/components/ui/calendar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { Checkbox } from "@repo/ui/components/ui/checkbox"
import { PhoneInput } from "react-international-phone"
import "react-international-phone/style.css"
import { isValidPhoneNumber } from "libphonenumber-js"
import { fetchTimezones } from "@repo/ui/api/getTimeZone"
import { fetchTimeSlots } from "@repo/ui/api/getTimeSlots"
import { bookAppointmentAction } from "@repo/ui/api/appointmentBooking"
import { subscribeNewsletter } from "@repo/ui/api/subscribe"
import { sendCommunicationAction } from "@repo/ui/api/communication"
import { FloatingLabelInput } from "@repo/ui/components/ui/floating-label-input"
import { UpdateEventParticipant } from "@repo/ui/api/putEventParticipant"
import { ContactApi } from "@repo/ui/api/contact"
import type { TformFieldConfig, TformConfig, TdynamicFormProps, Tslot, TtrendCardProps, TcaseStudies } from "@repo/middleware"
import Link from "next/link";

// These form configuration objects define the structure, validation rules, and fields for different form types.
export const LdBookingFormConfig: TformConfig = {
    id: "appointment",
    title: "Book an Appointment",
    description: "Fill out the form below to schedule a meeting with us.",
    submitText: "Book Now",
    successTitle: "Thank You!",
    successMessage: "Your booking has been confirmed successfully!",
    showTerms: true,
    termsText: "Terms of Service",
    privacyText: "Privacy Policy",
    // The schema defines validation rules using Zod for each field in the form
    schema: z.object({
        date: z.date({ required_error: "Please select a date." }),
        timezone: z.string({ required_error: "Please select a timezone." }),
        timeSlot: z.string({ required_error: "Please select a time slot." }),
        name: z.string().regex(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces"),
        phone: z.string().refine((iVal) => isValidPhoneNumber(iVal), {
            message: "Invalid phone number",
        }),
        email: z.string().email("Please enter a valid email"),
        message: z.string().optional(),
        newsletter: z.boolean().default(true),
    }),
    // Field configurations define the UI and behavior of each form field
    fields: [
        {
            name: "date",
            type: "date",
            placeholder: "Select date",
            required: true,
            className: "w-1/2 pr-2 mb-3",
        },
        {
            name: "timezone",
            type: "timezone",
            placeholder: "Select timezone",
            required: true,
            className: "w-1/2 pl-2 mb-3",
        },
        {
            name: "timeSlot",
            type: "timeslot",
            placeholder: "Select time slot",
            required: true,
            className: "w-full mb-3",
        },
        {
            name: "name",
            type: "text",
            placeholder: "Enter your full name *",
            required: true,
            className: "md:w-1/2 w-full md:pr-2 mb-3",
        },
        {
            name: "phone",
            type: "phone",
            required: true,
            className: "md:w-1/2 w-full md:pl-2 mb-3",
        },
        {
            name: "email",
            type: "email",
            placeholder: "Enter your email address *",
            required: true,
            className: "w-full mb-3",
        },
        {
            name: "message",
            type: "textarea",
            required: true,
            placeholder: "Your message",
            className: "w-full mb-3",
        },
        {
            name: "newsletter",
            type: "checkbox",
            placeholder: "Subscribe to newsletter",
            className: "w-full mb-4",
        },
    ],
}

export const LdContactFormConfig: TformConfig = {
    id: "contact",
    title: "Contact Us",
    description: "Get in touch with our team",
    submitText: "Send Message",
    successTitle: "Thank You!",
    successMessage: "Your message has been sent!",
    showTerms: true,
    schema: z.object({
        enquiryType: z.string().default("Free Trial"),
        email: z.string().email("Please enter a valid email"),
        message: z.string().optional(),
        newsletter: z.boolean().default(true),
    }),
    fields: [
        {
            name: "enquiryType",
            type: "select",
            placeholder: "Select an option",
            required: true,
            className: "w-full mb-3",
            options: [
                { value: "Free Trial", label: "Free Trial" },
                { value: "Demo", label: "Demo" },
                { value: "Pricing", label: "Pricing" },
                { value: "Support", label: "Support" },
            ],
        },
        {
            name: "email",
            type: "email",
            placeholder: "Enter your email address *",
            required: true,
            className: "w-full mb-3",
        },
        {
            name: "message",
            type: "textarea",
            placeholder: "Your message",
            required: true,
            className: "w-full mb-3",
        },
        {
            name: "newsletter",
            type: "checkbox",
            placeholder: "Subscribe to newsletter",
            className: "w-full mb-4",
        },
    ],
}

export const LdDownloadFormConfig: TformConfig = {
    id: "download",
    title: "Download Resources",
    description: "Fill out the form to access our content",
    submitText: "Download Now",
    successTitle: "Happy Reading!",
    successMessage: "Your download will start shortly!",
    showTerms: true,
    schema: z.object({
        name: z.string().regex(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces"),
        email: z.string().email("Please enter a valid email"),
        newsletter: z.boolean().default(true),
    }),
    fields: [
        {
            name: "name",
            type: "text",
            placeholder: "Enter your full name *",
            required: true,
            className: "w-full mb-3",
        },
        {
            name: "email",
            type: "email",
            placeholder: "Enter your email address*",
            required: true,
            className: "w-full mb-3",
        },
        {
            name: "newsletter",
            type: "checkbox",
            placeholder: "Subscribe to newsletter",
            className: "w-full mb-4",
        },
    ],
}

export const LdContactPageFormConfig: TformConfig = {
    id: "contact",
    title: "Contact Us",
    description: "Get in touch with our team",
    submitText: "Send Message",
    successTitle: "Thank You!",
    successMessage: "Your message has been sent successfully!",
    showTerms: true,
    termsText: "Terms of Service",
    privacyText: "Privacy Policy",
    schema: z.object({
        name: z
            .string()
            .regex(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces"),
        email: z.string().email("Please enter a valid email"),
        company: z.string().optional(),
        phone: z
            .string()
            .refine((iVal) => isValidPhoneNumber(iVal), {
                message: "Invalid phone number",
            })
            .optional(),
        product: z.string().optional(),
        enquiryType: z.string().optional(),
        message: z.string().optional(),
        newsletter: z.boolean().default(true),
    }),
    fields: [
        {
            name: "name",
            type: "text",
            placeholder: "Enter your full name *",
            required: true,
            className: "w-full md:w-1/2 md:pr-2.5 mb-3",
        },
        {
            name: "email",
            type: "email",
            placeholder: "Enter your email address*",
            required: true,
            className: "w-full md:w-1/2 md:pl-2.5 mb-3",
        },
        {
            name: "company",
            type: "text",
            placeholder: "Enter your company name",
            className: "w-full md:w-1/2 md:pr-2.5 mb-3",
        },
        {
            name: "phone",
            type: "phone",
            className: "w-full md:w-1/2 md:pl-2.5 mb-3",
        },
        {
            name: "product",
            type: "select",
            placeholder: "Select product",
            className: "w-full md:w-1/2 md:pr-2 mb-3",
            options: [
                { value: "LENS ERP", label: "LENS ERP" },
                { value: "CRM", label: "CRM" },
                { value: "Analytics", label: "Analytics" },
            ],
        },
        {
            name: "enquiryType",
            type: "select",
            placeholder: "Select enquiry type",
            className: "w-full md:w-1/2 md:pl-2 mb-3",
            options: [
                { value: "Free Trial", label: "Free Trial" },
                { value: "Demo", label: "Demo" },
                { value: "Pricing", label: "Pricing" },
                { value: "Support", label: "Support" },
            ],
        },
        {
            name: "message",
            type: "textarea",
            placeholder: "Your message",
            required: true,
            className: "w-full mb-3",
        },
        {
            name: "newsletter",
            type: "checkbox",
            placeholder: "Subscribe to our newsletter for updates and offers",
            className: "w-full mb-4",
        },
    ],
}

export const LdBookingPageFormConfig: TformConfig = {
    id: "appointment",
    title: "Book Appointment",
    description: "Fill out the form below to schedule a meeting with us.",
    submitText: "Book Now",
    successTitle: "Thank You!",
    successMessage: "Your booking has been confirmed successfully!",
    showTerms: true,
    termsText: "Terms of Service",
    privacyText: "Privacy Policy",
    schema: z.object({
        date: z.date({ required_error: "Please select a date." }),
        timezone: z.string({ required_error: "Please select a timezone." }),
        timeSlot: z.string({ required_error: "Please select a time slot." }),
        name: z
            .string()
            .regex(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces"),
        email: z.string().email("Please enter a valid email"),
        company: z.string().optional(),
        phone: z
            .string()
            .refine((iVal) => isValidPhoneNumber(iVal), {
                message: "Invalid phone number",
            })
            .optional(),
        message: z.string().optional(),
        newsletter: z.boolean().default(true),
    }),
    fields: [
        {
            name: "date",
            type: "date",
            placeholder: "Select date",
            required: true,
            className: "w-full md:w-1/2 md:pr-2.5 mb-3",
        },
        {
            name: "timezone",
            type: "timezone",
            placeholder: "Select timezone",
            required: true,
            className: "w-full md:w-1/2 md:pl-2.5 mb-3",
        },
        {
            name: "timeSlot",
            type: "timeslot",
            placeholder: "Select time slot",
            required: true,
            className: "w-full mb-3",
        },
        {
            name: "name",
            type: "text",
            placeholder: "Enter your full name *",
            required: true,
            className: "w-full md:w-1/2 md:pr-2.5 mb-3",
        },
        {
            name: "phone",
            type: "phone",
            className: "w-full md:w-1/2 md:pl-2.5 mb-3",
        },
        {
            name: "email",
            type: "email",
            placeholder: "Enter your email address *",
            required: true,
            className: "w-full mb-3",
        },
        {
            name: "message",
            type: "textarea",
            placeholder: "Your message",
            className: "w-full mb-3",
        },
        {
            name: "newsletter",
            type: "checkbox",
            placeholder: "Subscribe to our newsletter for updates and offers",
            className: "w-full mb-4",
        },
    ],
}

export const LdWebinarFormConfig: TformConfig = {
    id: "webinar",
    title: "Join Our Webinar – Register Now",
    description: "Fill out the form to receive your webinar access link.",
    submitText: "Register",
    successTitle: "Thank You!",
    successMessage: "Thank you for registering! A confirmation email has been sent to your inbox",
    showTerms: true,
    termsText: "Terms of Service",
    privacyText: "Privacy Policy",
    // The schema defines validation rules using Zod for each field in the form
    schema: z.object({
        name: z.string().regex(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces"),
        phone: z.string().refine((iVal) => isValidPhoneNumber(iVal), {
            message: "Invalid phone number",
        }).optional(),
        email: z.string().email("Please enter a valid email"),
        company: z.string().optional(),
        job: z.string().optional(),
        newsletter: z.boolean().default(true),
    }),
    // Field configurations define the UI and behavior of each form field
    fields: [
        {
            name: "name",
            type: "text",
            placeholder: "Enter your full name *",
            required: true,
            className: "md:w-1/2 w-full md:pr-2 mb-3",
        },
        {
            name: "phone",
            type: "phone",
            className: "md:w-1/2 w-full md:pl-2 mb-3",
        },
        {
            name: "email",
            type: "email",
            placeholder: "Enter your email address *",
            required: true,
            className: "w-full mb-3",
        },
        {
            name: "company",
            type: "text",
            placeholder: "Enter your Company Name",
            className: "w-full mb-3",
        },
        {
            name: "job",
            type: "text",
            placeholder: "Enter your Job Title",
            className: "w-full mb-3",
        },
        {
            name: "newsletter",
            type: "checkbox",
            placeholder: "Subscribe to newsletter",
            className: "w-full mb-4",
        },
    ],
}

/**
 * Checks if the contact exists or creates a new one.
 * Adds the participant to the corresponding event.
 *
 * idFormData - Form data containing contact details
 * idData - Data containing the event ID
 * iRecaptchaToken - ReCaptcha token for verification
 * Object containing response data or error
 */
export async function fnSubmitWebinar(idFormData: any, idData: TtrendCardProps, iRecaptchaToken: string) {
    try {

        const LdPayload = {
            formData: idFormData,
            recaptchaToken: iRecaptchaToken,
        }
        // Step 1: Fetch contact data (create or check if the contact already exists)
        const LdContact = await ContactApi(LdPayload);

        // Step 2: Handle newsletter subscription if needed
        if (idFormData.newsletter) {
            const LdNewFormData = new FormData();
            LdNewFormData.append("email", idFormData.email);
            await subscribeNewsletter({ message: "" }, LdNewFormData);
        }

        // Check if the contact was successfully created or already exists
        if (LdContact.message === 'created' || LdContact.message === 'exist') {
            // Step 3: Update event participant
            const LdUpdateEventParticipant = await UpdateEventParticipant(idData.id, LdContact.data.name);
            return {
                data: LdUpdateEventParticipant.data,  // Return the updated event participant data
            };
        }

        // If everything is successful, return a success message
        return {
            data: "webinar updated successfully",
        };

    } catch (error: any) {
        // Handle and log any errors that occur during the process
        console.error("Client side, update event participant error:", error);

        // Return an error message with title and description for user feedback
        return {
            error: error.message || "Something went wrong while submitting the contact form.",
            title: "Sorry",
            message: "Something went wrong, please try again sometime later!",
        };
    }
}

/**
 * Submits appointment booking data to the server
 * idFormData - Form data containing appointment details
 * iRecaptchaToken - ReCaptcha token for verification
 * returns Object containing response data or error
 */
export async function fnSubmitAppointmentBooking(idFormData: any, iRecaptchaToken: string) {
    try {
        const LFormattedDate = format(new Date(idFormData.date), "yyyy-MM-dd")

        const LdPayload = {
            date: LFormattedDate,
            time: idFormData.timeSlot,
            timezone: idFormData.timezone,
            contact: {
                name: idFormData.name,
                phone: idFormData.phone,
                email: idFormData.email,
                notes: idFormData.message || "",
            },
            recaptchaToken: iRecaptchaToken,
        }

        const LdResponse = await bookAppointmentAction(LdPayload)

        if (idFormData.newsletter) {
            const LdNewFormData = new FormData()
            LdNewFormData.append("email", idFormData.email)
            await subscribeNewsletter({ message: "" }, LdNewFormData)
        }

        if (LdResponse.error) {
            return { error: LdResponse.error }
        }
        const LStatus = LdResponse?.data?.message?.status

        const LTitle = LStatus === "Unverified" ? "Welcome To Our Family!" : "Thank You!"

        const LMessage =
            LStatus === "Unverified"
                ? "Please check your email to confirm the appointment"
                : "Booking confirmed successfully"

        return {
            data: LdResponse.data,
            title: LTitle,
            message: LMessage,
        }
    } catch (error) {
        console.error("Client-side appointment error", error)
        return { error: "Something went wrong while booking" }
    }
}

/**
 * Submits contact form data to the server
 * idFormData - Form data containing contact details
 * iRecaptchaToken - ReCaptcha token for verification
 * returns Object containing response data or error
 */
export async function fnSubmitContact(idFormData: any, iRecaptchaToken: string) {
    try {
        const LdPayload = {
            email: idFormData.email,
            notes: idFormData.message || "",
            option: idFormData.enquiryType || "Free Trial",
            recaptchaToken: iRecaptchaToken,
        }
        const LdResponse = await sendCommunicationAction(LdPayload)

        if (idFormData.newsletter) {
            const LdNewFormData = new FormData()
            LdNewFormData.append("email", idFormData.email)
            await subscribeNewsletter({ message: "" }, LdNewFormData)
        }

        if (LdResponse.error) {
            return { error: LdResponse.error }
        }

        return {
            data: LdResponse.data,
            message: LdResponse.message,
        }

    } catch (error) {
        console.error("Client-side communication error:", error)
        return { error: "Something went wrong while submitting the contact form." }
    }
}

/**
 * Handles the download process of a Case Study PDF file.
 * 
 * Steps performed:
 * 1. Subscribes the user to the newsletter if the option is selected.
 * 2. Dynamically imports the PDF layout component and React PDF renderer.
 * 3. Generates a PDF blob from the `PdfDocument` React component.
 * 4. Triggers a browser download of the generated PDF file.
 * 
 * idFormData - Form data object, including email and newsletter preference.
 * idPdfData - Case study data to be passed to the PDF layout.
 * iRecaptchaToken - reCAPTCHA token (currently unused, but can be integrated for validation).
 * An object with a message and title indicating success or failure.
 */

export async function fnDownload(idFormData:any, idPdfData:TcaseStudies, iRecaptchaToken: string){
    
    try {
         // Check if the user opted in for the newsletter
        if (idFormData.newsletter) {
          // Prepare a FormData object with the user's email
          const LdNewFormData = new FormData();
          LdNewFormData.append("email", idFormData.email);
           // Subscribe the user to the newsletter
          await subscribeNewsletter({ message: "" }, LdNewFormData);
        }

        // Dynamically import the Case Study PDF layout component(nextjs feature)
        // Dynamically import the React PDF renderer(nextjs feature)
        const { PdfDocument } = await import("@repo/ui/components/pdf/caseStudyLayout");
        const { pdf } = await import("@react-pdf/renderer");
    
        // Generate a PDF blob from the PdfDocument component with provided case study data
        const Blob = await pdf(<PdfDocument idData={idPdfData} />).toBlob();
        // Create a temporary object URL from the Blob
        const Url = URL.createObjectURL(Blob);
        // Create a hidden anchor element to trigger the download
        const Link = document.createElement("a");
        Link.href = Url;  // Set the href to the Blob URL
        Link.download = "lmnas-casestudy.pdf";  // Set the desired filename {can make it automated using the idPdfData}
        document.body.appendChild(Link);
        Link.click();  // Programmatically click the link to trigger the download
        document.body.removeChild(Link);
        URL.revokeObjectURL(Url);   // Clean up the object URL
    
        // Return a success message
        return {
          message: "Your file has been downloaded.",
          title: "Download Success",
        };
      } catch (error) {
        console.error("Download failed:", error);
        // Return a failure message and error info
        return {
          message: "Failed to download the file.",
          title: "Download Failed",
          error: error instanceof Error ? error.message : String(error),
        };
      }
}


/**
 * Main form component that renders dynamic form fields based on configuration
 * config - Form configuration object defining fields and validation
 * onSuccess - Callback function executed on successful form submission
 * className - Optional CSS class name for styling
 * defaultValues - Optional default values for form fields
 * hideCardHeader - Optional flag to hide the form header
 * returns React element containing the rendered form
 */
function InnerSectionForm({
    config,
    onSuccess,
    className = "",
    defaultValues,
    hideCardHeader = false,
    data,
    pdfData
}: TdynamicFormProps): ReactElement {
    const [Timezones, fnSetTimezones] = useState<string[]>([])
    const [IsLoadingTimezones, fnSetIsLoadingTimezones] = useState(true)
    const [TimeSlots, fnSetTimeSlots] = useState<Tslot[]>([])
    const [IsLoadingSlots, fnSetILoadingSlots] = useState(false)
    const [ShowTimeSlots, fnSetShowTimeSlots] = useState(false)
    const [IsSubmitting, fnSetIsSubmitting] = useState(false)
    const FormRef = useRef<HTMLDivElement>(null)
    const { executeRecaptcha } = useReCaptcha()

    // Sets up default values for all possible form fields, overridden by any provided values
    const LdInitialValues = {
        name: "",
        email: "",
        message: "",
        phone: "",
        newsletter: true,
        timezone: "",
        timeSlot: "",
        ...defaultValues,
    }

    // Initializes the form with react-hook-form and connects it to the Zod validation schema
    const LdForm = useForm<z.infer<typeof config.schema>>({
        resolver: zodResolver(config.schema),
        defaultValues: LdInitialValues,
        mode: "onTouched",
    })

    // Watches specific form fields to react to their changes
    const SelectedDate = LdForm.watch("date")
    const SelectedTimezone = LdForm.watch("timezone")

    // Fetches available timezones from the server
    useEffect(() => {
        const fnLoadTimezones = async (): Promise<void> => {
            try {
                const LdResult = await fetchTimezones()
                if (LdResult?.data) {
                    fnSetTimezones(LdResult.data)
                }
            } catch (error) {
                console.error("Failed to load timezones:", error)
            } finally {
                fnSetIsLoadingTimezones(false)
            }
        }
        fnLoadTimezones()
    }, [])

    // Set default timezone only once if empty
    useEffect(() => {
        const LCurrentTimezone = LdForm.getValues("timezone")
        if (!LCurrentTimezone && Timezones.length > 0) {
            const LDefaultTz = Timezones.find((z) => z.includes("CET")) || "UTC"
            LdForm.setValue("timezone", LDefaultTz)
        }
    }, [Timezones])

    //   Fetches available time slots based on selected date and timezone
    useEffect(() => {
        const fnLoadTimeSlots = async (): Promise<void> => {
            if (SelectedDate && SelectedTimezone) {
                fnSetILoadingSlots(true)
                try {
                    const LFormattedDate = format(new Date(SelectedDate), "yyyy-MM-dd")
                    const LdSlotResult = await fetchTimeSlots(LFormattedDate, SelectedTimezone)
                    if (LdSlotResult?.data && Array.isArray(LdSlotResult.data)) {
                        fnSetTimeSlots(LdSlotResult.data)
                    } else {
                        fnSetTimeSlots([])
                    }
                } catch (error) {
                    console.error("Error loading slots:", error)
                    fnSetTimeSlots([])
                } finally {
                    fnSetILoadingSlots(false)
                }
            }
        }

        fnLoadTimeSlots()
    }, [SelectedDate, SelectedTimezone])

    // Setting Timeslots
    useEffect(() => {
        if (SelectedDate && SelectedTimezone) {
            fnSetShowTimeSlots(true)
        } else {
            fnSetShowTimeSlots(false)
            if (LdForm.getValues("timeSlot")) {
                LdForm.setValue("timeSlot", "")
            }
        }
    }, [SelectedDate, SelectedTimezone, LdForm])

    /**
     * Handles form submission, validates with reCAPTCHA, and processes data
     * idFormData - Validated form data from react-hook-form
     */
    const fnHandleSubmit = async (idFormData: z.infer<typeof config.schema>) => {
        fnSetIsSubmitting(true)
        if (!executeRecaptcha) {
            return
        }

        try {
            const LdRecaptchaToken = await executeRecaptcha("submit")
            let LdResponse

            if (config.id === "appointment") {
                LdResponse = await fnSubmitAppointmentBooking(idFormData, LdRecaptchaToken)
                config.successMessage = LdResponse.message ? LdResponse.message : ""
                config.successTitle = LdResponse.title ? LdResponse.title : ""
            } else if (config.id === "contact") {
                LdResponse = await fnSubmitContact(idFormData, LdRecaptchaToken)
            }
            else if (config.id === "download") {
                // const { PdfDocument } = await import("@repo/ui/components/pdf/caseStudyLayout")
                // const { pdf } = await import("@react-pdf/renderer")

                // const blob = await pdf(<PdfDocument data={pdfData} />).toBlob()
                // // Create a URL and download the PDF
                // const url = URL.createObjectURL(blob)
                // const link = document.createElement("a")
                // link.href = url
                // link.download = "download.pdf"
                // document.body.appendChild(link)
                // link.click()
                // document.body.removeChild(link)
                // URL.revokeObjectURL(url)
                LdResponse = await fnDownload(idFormData,  pdfData, LdRecaptchaToken)

                // LdResponse = {
                //     message: "Your file has been downloaded.",
                //     title: "Download Success",
                // }
            }
            else if (config.id === "webinar") {
                LdResponse = await fnSubmitWebinar(idFormData, data, LdRecaptchaToken)
            }
            else {
                throw new Error("Unsupported form type")
            }

            if (LdResponse.error) {
                throw new Error(LdResponse.error)
            }

            LdForm.reset(LdInitialValues)
            onSuccess(config.successMessage, config.successTitle)
        } catch (error: any) {
            LdForm.setError("root", {
                type: "manual",
                message: error?.message || "Something went wrong",
            })
        } finally {
            fnSetIsSubmitting(false)
        }
    }

    /**
      * Renders a form field based on its type and configuration
      * idField - Field configuration object
      * returns React node containing the rendered form field
      */
    const fnRenderField = (idField: TformFieldConfig): ReactNode => {
        if (idField.type === "timeslot" && !ShowTimeSlots) return null

        switch (idField.type) {
            case "text":
            case "email":
                return (
                    <FormField
                        key={idField.name}
                        control={LdForm.control}
                        name={idField.name}
                        render={({ field: iField, fieldState: iFieldState }) => (
                            <FormItem className={idField.className}>
                                <FormControl>
                                    <FloatingLabelInput
                                        label={idField.label || idField.placeholder || ""}
                                        type={idField.type}
                                        error={!!iFieldState.error}
                                        inputClassName={idField.inputClassName}
                                        {...iField}
                                        value={iField.value || ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )
            case "phone":
                return (
                    <FormField
                        key={idField.name}
                        control={LdForm.control}
                        name={idField.name}
                        render={({ field: iField, fieldState: iFieldState }) => (
                            <FormItem className={idField.className}>
                                <FormControl>
                                    <PhoneInput
                                        defaultCountry="de"
                                        value={iField.value || ""}
                                        onChange={iField.onChange}
                                        onBlur={iField.onBlur}
                                        className="!w-full !rounded-md" // Same as containerClass
                                        inputClassName="!w-full p-5 border rounded-md text-sm focus:outline-none !h-12" // Same as inputClass
                                        countrySelectorStyleProps={{
                                            buttonClassName: "!p-2 !h-12 !w-fit", // Equivalent to dropdownClass
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )

            case "select":
                return (
                    <FormField
                        key={idField.name}
                        control={LdForm.control}
                        name={idField.name}
                        render={({ field: iField }) => (
                            <FormItem className={idField.className}>
                                <Select onValueChange={iField.onChange} value={iField.value || ""}>
                                    <FormControl>
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder={idField.placeholder} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {idField.options?.map((idOption) => (
                                            <SelectItem key={idOption.value} value={idOption.value}>
                                                {idOption.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )

            case "textarea":
                return (
                    <FormField
                        key={idField.name}
                        control={LdForm.control}
                        name={idField.name}
                        render={({ field: iField, fieldState: iFieldState }) => (
                            <FormItem className={idField.className}>
                                <FormControl>
                                    <Textarea
                                        placeholder={idField.placeholder}
                                        className={cn("min-h-[100px]", idField.inputClassName, iFieldState.error && "border-red-400")}
                                        {...iField}
                                        value={iField.value || ""}
                                    />
                                </FormControl>
                                {idField.name !== "message" && <FormMessage />}
                            </FormItem>
                        )}
                    />
                )

            case "date":
                return (
                    <FormField
                        key={idField.name}
                        control={LdForm.control}
                        name={idField.name}
                        render={({ field: iField }) => (
                            <FormItem className={idField.className}>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className={cn("h-12 w-full text-left font-normal", !iField.value && "text-muted-foreground")}
                                            >
                                                {iField.value ? format(iField.value, "PPP") : idField.placeholder}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={iField.value}
                                            onSelect={iField.onChange}
                                            disabled={(idDate) => idDate < new Date()}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {idField.name !== "date" && <FormMessage />}
                            </FormItem>
                        )}
                    />
                )

            case "timezone":
                return (
                    <FormField
                        key={idField.name}
                        control={LdForm.control}
                        name={idField.name}
                        render={({ field: iField }) => (
                            <FormItem className={idField.className}>
                                <Select onValueChange={iField.onChange} value={iField.value || ""} disabled={IsLoadingTimezones}>
                                    <FormControl>
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder={IsLoadingTimezones ? "Loading timezones..." : idField.placeholder} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Timezones.map((iTimeZone) => (
                                            <SelectItem key={iTimeZone} value={iTimeZone}>
                                                {iTimeZone}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {idField.name !== "timezone" && <FormMessage />}
                            </FormItem>
                        )}
                    />
                )

            case "timeslot":
                if (!ShowTimeSlots) return null
                return (
                    <FormField
                        key={idField.name}
                        control={LdForm.control}
                        name={idField.name}
                        render={({ field: iField }) => (
                            <FormItem className={idField.className}>
                                {idField.label && <FormLabel>{idField.label}</FormLabel>}
                                <div className="grid grid-cols-3 gap-2">
                                    {IsLoadingSlots ? (
                                        <p className="col-span-3 text-muted-foreground text-sm">Loading slots...</p>
                                    ) : TimeSlots.length === 0 ? (
                                        <p className="col-span-3 text-sm text-red-500 text-center py-4 font-medium">No slots available</p>
                                    ) : (
                                        TimeSlots.map(({ time, availability }) => { //here the variable is destructure from response
                                            const fromTime = time.slice(11, 16)
                                            const [hourStr = "00", minuteStr = "00"] = fromTime.split(":")
                                            const hour = Number.parseInt(hourStr, 10)
                                            const slotLabel = `${fromTime} - ${(hour + 1) % 24}:${minuteStr}`
                                            const formattedValue = `${fromTime}:00`

                                            return (
                                                // <Button
                                                //     key={time}
                                                //     type="button"
                                                //     variant={availability ? (iField.value === formattedValue ? "default" : "outline") : "outline"}
                                                //     className={`h-10 ${iField.value === formattedValue
                                                //         ? "bg-foreground text-foreground hover:bg-accent"
                                                //         : !availability
                                                //             ? "bg-foreground text-accent hover:bg-accent hover:text-muted cursor-not-allowed"
                                                //             : ""
                                                //         }`}
                                                //     onClick={() => iField.onChange(formattedValue)}
                                                //     disabled={!availability}
                                                // >
                                                //     {slotLabel}
                                                // </Button>
                                                <Button
                                                    key={time}
                                                    type="button"
                                                    variant="default"
                                                    className={`h-10
                                                            ${!availability ? "bg-accent text-foreground cursor-not-allowed" : ""}
                                                            ${availability && iField.value !== formattedValue ? "bg-accent text-foreground hover:border hover:ring-2 hover:ring-ring hover:bg-foreground hover:text-background" : ""}
                                                            ${iField.value === formattedValue ? "border ring-2 ring-ring" : ""}
                                                        `}
                                                    onClick={() => iField.onChange(formattedValue)}
                                                    disabled={!availability}
                                                >
                                                    {slotLabel}
                                                </Button>
                                            )
                                        })
                                    )}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )

            case "checkbox":
                return (
                    <FormField
                        key={idField.name}
                        control={LdForm.control}
                        name={idField.name}
                        render={({ field: iField }) => (
                            <FormItem className={cn(idField.className, "flex flex-row items-center justify-start space-x-2")}>
                                <FormControl>
                                    <Checkbox checked={iField.value || false} onCheckedChange={iField.onChange} className="mt-1.5" />
                                </FormControl>
                                <FormLabel className="font-normal">{idField.placeholder}</FormLabel>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )
            default:
                return null
        }
    }

    return (
        <div ref={FormRef} className={cn("w-full max-w-xl mx-auto shadow-md border border-border", className)}>
            {!hideCardHeader && (
                <div className="bg-foreground text-background p-4">
                    <h2 className="text-2xl font-bold">{config.title}</h2>
                    {config.description && <p className="mt-2  text-background">{config.description}</p>}
                </div>
            )}
            <div className="p-6">
                <Form {...LdForm}>
                    <form onSubmit={LdForm.handleSubmit(fnHandleSubmit)}>
                        {LdForm.formState.errors.root && (
                            <p className="text-red-500 text-sm mb-4">{LdForm.formState.errors.root.message}</p>
                        )}

                        <div className="flex flex-wrap -mx-2">{config.fields.map(fnRenderField)}</div>

                        <div className="space-y-4">
                            <Button
                                type="submit"
                                className="w-full h-12 rounded-full"
                                disabled={
                                    IsSubmitting || !LdForm.formState.isValid || Object.keys(LdForm.formState.dirtyFields).length === 0
                                }
                            >
                                {IsSubmitting ? (
                                    <span className="flex items-center justify-center">
                                        <svg
                                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-background"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    config.submitText
                                )}
                            </Button>

                            {config.showTerms && (
                                <p className="text-xs text-center text-muted-foreground">
                                    By submitting, you agree to our{" "}
                                    <Link href="/terms-and-conditions" className="underline" target="_blank" rel="noopener noreferrer">
                                        {config.termsText || "Terms"}
                                    </Link>{" "}
                                    and{" "}
                                    <Link href="/privacy-policy" className="underline" target="_blank" rel="noopener noreferrer">
                                        {config.privacyText || "Privacy Policy"}
                                    </Link>
                                </p>
                            )}
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    )
}

/**
* Wrapper component that provides ReCaptcha functionality to the form
* props - Form props passed to the inner form component
* returns React element with ReCaptcha provider and inner form
*/
export const SectionForm = (props: TdynamicFormProps): ReactElement => {
    /**
     * Inner component that wraps the form with ReCaptcha provider
     * innerProps - Props passed to the inner form component
     * returns React element with ReCaptcha provider and inner form
     */
    const WrappedComponent = (innerProps: TdynamicFormProps) => {
        return (
            <ReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ""}>
                <InnerSectionForm {...innerProps} />
            </ReCaptchaProvider>
        )
    }
    return <WrappedComponent {...props} />
}