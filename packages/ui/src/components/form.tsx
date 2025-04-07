"use client"
import { useState, useRef, useEffect, ReactElement, ReactNode } from "react"
import { ReCaptchaProvider, useReCaptcha } from "next-recaptcha-v3"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from 'date-fns/format'
import { CalendarIcon } from "lucide-react"
import { cn } from "@repo/ui/lib/utils"
import { Button } from "@repo/ui/components/ui/button"
import { Calendar } from "@repo/ui/components/ui/calendar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/ui/form"
import { Input } from "@repo/ui/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { Checkbox } from "@repo/ui/components/ui/checkbox"
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { isValidPhoneNumber } from "libphonenumber-js";
import { TformFieldConfig, TformConfig, TdynamicFormProps } from "@repo/ui/type"
import {fetchTimezones} from "@repo/ui/api/getTimeZone"
import { fetchTimeSlots } from "@repo/ui/api/getTimeSlots"
import { bookAppointmentAction } from "@repo/ui/api/appointmentBooking"
import { subscribeNewsletter } from "@repo/ui/api/subscribe"
import { sendCommunicationAction } from "@repo/ui/api/communication"

// These form configuration objects define the structure, validation rules, and fields for different form types.
export const LdBookingFormConfig: TformConfig = {
    id:"appointment",
    title: "Book an Appointment",
    description: "Fill out the form below to schedule a meeting with us.",
    submitText: "Book Now",
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
            placeholder: "Your name *",
            required: true,
            className: "w-1/2 pr-2 mb-3",
        },
        {
            name: "phone",
            type: "phone",
            placeholder: "Phone number",
            required: true,
            className: "w-1/2 pl-2 mb-3",
        },
        {
            name: "email",
            type: "email",
            placeholder: "Your email *",
            required: true,
            className: "w-full mb-3",
        },
        {
            name: "message",
            type: "textarea",
            placeholder: "Additional information",
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
    id:"contact",
    title: "Contact Us",
    description: "Get in touch with our team",
    submitText: "Send Message",
    successMessage: "Your message has been sent!",
    showTerms: true,
    schema: z.object({
        enquiryType: z.string().default("Free Trial"),
        email: z.string().email("Please enter a valid email"),
        message: z.string().min(10, "Message must be at least 10 characters"),
        newsletter: z.boolean().default(true),
    }),
    fields: [
        {
            name: "enquiryType",
            type: "select",
            placeholder: "Select an option *",
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
            placeholder: "Your email *",
            required: true,
            className: "w-full mb-3",
        },
        {
            name: "message",
            type: "textarea",
            placeholder: "Your message *",
            required: true,
            className: "w-full mb-3",
        },
        {
            name: "newsletter",
            type: "checkbox",
            placeholder: "Subscribe to newsletter",
            required: true,
            className: "w-full mb-4",
        },
    ],
}

export const LdDownloadFormConfig: TformConfig = {
    id:"download",
    title: "Download Resources",
    description: "Fill out the form to access our content",
    submitText: "Download Now",
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
            placeholder: "Your name *",
            required: true,
            className: "w-full mb-3",
        },
        {
            name: "email",
            type: "email",
            placeholder: "Your email *",
            required: true,
            className: "w-full mb-3",
        },
        {
            name: "newsletter",
            type: "checkbox",
            placeholder: "Subscribe to newsletter",
            required: true,
            className: "w-full mb-4",
        },
    ],
}

// Configurations for the BigForm component
export const LdContactPageFormConfig: TformConfig = {
    id:"contact",
    title: "Contact Us",
    description: "Get in touch with our team",
    submitText: "Send Message",
    successMessage: "Your message has been sent successfully!",
    showTerms: true,
    termsText: "Terms of Service",
    privacyText: "Privacy Policy",
    schema: z.object({
        name: z
            .string()
            .min(1, "Name is required")
            .regex(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces"),
        email: z.string().min(1, "Email is required").email("Please enter a valid email"),
        company: z.string().optional(),
        phone: z.string().refine((iVal) => isValidPhoneNumber(iVal), {
            message: "Invalid phone number",
          }).optional(),
        product: z.string().optional(),
        enquiryType: z.string().optional(),
        message: z.string().min(10, "Message must be at least 10 characters"),
        newsletter: z.boolean().default(true),
    }),
    fields: [
        {
            name: "name",
            type: "text",
            label: "Full Name",
            placeholder: "Enter your full name",
            required: true,
            className: "w-full md:w-1/2 md:pr-2.5 mb-3",
        },
        {
            name: "email",
            type: "email",
            label: "Email Address *",
            placeholder: "Enter your email",
            required: true,
            className: "w-full md:w-1/2 md:pl-2.5 mb-3",
        },
        {
            name: "company",
            type: "text",
            label: "Company Name",
            placeholder: "Enter your company name",
            className: "w-full md:w-1/2 md:pr-2.5 mb-3",
        },
        {
            name: "phone",
            type: "phone",
            label: "Phone",
            placeholder: "Your phone number",
            className: "w-full md:w-1/2 md:pl-2.5 mb-3",
        },
        {
            name: "product",
            type: "select",
            label: "Select a Product",
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
            label: "Enquiry Type",
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
            label: "Your Message *",
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
            .min(1, "Name is required")
            .regex(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces"),
        email: z.string().min(1, "Email is required").email("Please enter a valid email"),
        company: z.string().optional(),
        phone: z.string().refine((iVal) => isValidPhoneNumber(iVal), {
            message: "Invalid phone number",
          }).optional(),
        message: z.string().optional(),
        newsletter: z.boolean().default(true),
    }),
    fields: [
        {
            name: "date",
            type: "date",
            label: "Date",
            placeholder: "Select date",
            required: true,
            className: "w-full md:w-1/2 md:pr-2.5 mb-3",
        },
        {
            name: "timezone",
            type: "timezone",
            label: "Timezone",
            placeholder: "Select timezone",
            required: true,
            className: "w-full md:w-1/2 md:pl-2.5 mb-3",
        },
        {
            name: "timeSlot",
            type: "timeslot",
            label: "Available Time Slots",
            placeholder: "Select time slot",
            required: true,
            className: "w-full mb-3",
        },
        {
            name: "name",
            type: "text",
            label: "Full Name *",
            placeholder: "Enter your full name",
            required: true,
            className: "w-full md:w-1/2 md:pr-2.5 mb-3",
        },
        {
            name: "phone",
            type: "phone",
            label: "Phone",
            placeholder: "Your phone number",
            className: "w-full md:w-1/2 md:pl-2.5 mb-3",
        },
        {
            name: "email",
            type: "email",
            label: "Email Address *",
            placeholder: "Enter your email",
            required: true,
            className: "w-full mb-3",
        },
        {
            name: "message",
            type: "textarea",
            label: "Your Message *",
            placeholder: "Additional information",
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

export async function fnSubmitAppointmentBooking(idFormData: any, iRecaptchaToken:string) {
    try {
    // Construct payload with required types
    const LDateObj = idFormData.date instanceof Date ? idFormData.date : new Date(idFormData.date)
    const LFormattedDate = LDateObj.toISOString().split("T")[0]
    const LdPayload = {
      date: LFormattedDate as string,
      time: idFormData.timeSlot as string,
      timezone: idFormData.timezone as string,
      contact:{
        name: idFormData.name,
        phone: idFormData.phone,
        email: idFormData.email,
        notes: idFormData.message || "",
      },
      recaptchaToken: iRecaptchaToken
    }
  
      const LdResponse = await bookAppointmentAction(LdPayload)

      if (idFormData.newsletter) {
        const LdNewFormData = new FormData()
        LdNewFormData.append('email', idFormData.email)
        await subscribeNewsletter({message:""}, LdNewFormData)
      }
  
      if (LdResponse.error) {
        return { error: LdResponse.error }
      }
  
      return {
        data: LdResponse.data,
        message: LdResponse.message,
      }
    } catch (error) {
      console.error("Client-side appointment error", error)
      return { error: "Something went wrong while booking" }
    }
  }

export async function fnSubmitContact(idFormData: any, iRecaptchaToken:string) {
    try {
        const LdPayload = {
        email: idFormData.email,
        notes: idFormData.message || "",
        option: idFormData.enquiryType || "Free Trial",
        recaptchaToken: iRecaptchaToken
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
 * SectionForm - A flexible form component that renders different form types based on configuration.
 * This component creates a complete form UI with validation, submission handling, and success/error states.
 * It dynamically renders different field types (text, select, date, etc.) based on the provided configuration.
 */

export function SectionForm({
    config,
    onSuccess,
    className = "",
    defaultValues,
    hideCardHeader = false, // Default to false to maintain backward compatibility
}: TdynamicFormProps): ReactElement {
    // Tracks whether the form is currently being submitted to show loading state
    const [IsSubmitting, fnSetIsSubmitting] = useState(false)
    // Reference to the form DOM element for potential scrolling or focus management
    const FormRef = useRef<HTMLDivElement>(null)
    // Controls visibility of time slots based on whether date and timezone are selected
    const [ShowTimeSlots, fnSetShowTimeSlots] = useState(false)

    // Sets up default values for all possible form fields, overridden by any provided values
    const LdInitialValues = {
        name: "",
        email: "",
        message: "",
        phone: "",
        newsletter: true,
        agreeTerms: true,
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
    /**
      * This effect shows or hides time slots based on date and timezone selection.
      * Time slots are only shown when both date and timezone have been selected.
      * If either field is cleared, it also resets any selected time slot.
      */
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
     * Handles form submission after validation passes.
     * Shows a loading state, simulates an API call, and then either
     * displays success or error messages based on the result.
     */

    const fnHandleSubmit = async (idFormData: z.infer<typeof config.schema>) => {
        const { executeRecaptcha } = useReCaptcha()

        fnSetIsSubmitting(true)
        if (!executeRecaptcha) {
            return;
        }

        try {
            const LdRecaptchaToken = await executeRecaptcha("submit");
          let LdResponse
      
          if (config.id === "appointment") {
            
            LdResponse = await fnSubmitAppointmentBooking(idFormData, LdRecaptchaToken)
          }else if (config.id === "contact") {
            LdResponse = await fnSubmitContact(idFormData, LdRecaptchaToken)
          } else {
            throw new Error("Unsupported form type")
          }
      
          if (LdResponse.error) {
            throw new Error(LdResponse.error)
          }
      
          LdForm.reset(LdInitialValues)
          onSuccess(config.successMessage || LdResponse.message || "Success!")
      
        } catch (error:any) {
          LdForm.setError("root", {
            type: "manual",
            message: error?.message || "Something went wrong",
          })
        } finally {
          fnSetIsSubmitting(false)
        }
      }
      
    const [Timezones, fnSetTimezones] = useState<string[]>([]);
    const [IsLoadingTimezones, fnSetIsLoadingTimezones] = useState(true);
    
    // Fetch timezones once
    useEffect(() => {
      const fnLoadTimezones = async () => {
        try {
          const result = await fetchTimezones();
          if (result?.data) {
            fnSetTimezones(result.data);
          }
        } catch (err) {
          console.error("Failed to load timezones:", err);
        } finally {
            fnSetIsLoadingTimezones(false);
        }
      };
    
      fnLoadTimezones();
    }, []);
    
    // Set default timezone only once if empty
    useEffect(() => {
      const LCurrentTimezone = LdForm.getValues("timezone");
      if (!LCurrentTimezone && Timezones.length > 0) {
        const LDefaultTz = Timezones.find((z) => z.includes("CET")) || "UTC";
        LdForm.setValue("timezone", LDefaultTz);
      }
    }, [Timezones]);


    type TimeSlot = {
        time: string
        availability: boolean
      }

      // fetch timeslots
      const [TimeSlots, fnSetTimeSlots] = useState<TimeSlot[]>([])
      const [IsLoadingSlots, fnSetILoadingSlots] = useState(false)
      
      useEffect(() => {
        const loadTimeSlots = async () => {
          if (SelectedDate && SelectedTimezone) {
            fnSetILoadingSlots(true)
            try {
              const LFormattedDate = format(new Date(SelectedDate), "yyyy-MM-dd")
              const LdSlotResult = await fetchTimeSlots(LFormattedDate, SelectedTimezone)
              if (LdSlotResult?.data && Array.isArray(LdSlotResult.data)) {
                fnSetTimeSlots(LdSlotResult.data)
              } else {
                fnSetTimeSlots([]) // fallback if something wrong
              }
            } catch (error) {
              console.error("Error loading slots:", error)
              fnSetTimeSlots([])
            } finally {
                fnSetILoadingSlots(false)
            }
          }
        }
      
        loadTimeSlots()
      }, [SelectedDate, SelectedTimezone])
      



    /**
     * Renders a specific form field based on its configuration.
     * This function handles the rendering logic for all supported field types,
     * including text inputs, selects, textareas, date pickers, and checkboxes.
     * It also applies appropriate styling and validation to each field.
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
                                {idField.label && <FormLabel>{idField.label}</FormLabel>}
                                <FormControl>
                                    <Input
                                        placeholder={idField.placeholder}
                                        type={idField.type === "phone" ? "tel" : idField.type}
                                        className={cn("h-12", idField.inputClassName, iFieldState.error && "border-red-400")}
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
                                {idField.label && <FormLabel>{idField.label}</FormLabel>}
                                <FormControl>
                                    <PhoneInput
                                        defaultCountry="de"
                                        value={iField.value || ""}
                                        onChange={iField.onChange}
                                        onBlur={iField.onBlur}
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
                                {idField.label && <FormLabel>{idField.label}</FormLabel>}
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
                                {idField.label && <FormLabel>{idField.label}</FormLabel>}
                                <FormControl>
                                    <Textarea
                                        placeholder={idField.placeholder}
                                        className={cn("min-h-[100px]", idField.inputClassName, iFieldState.error && "border-red-400")}
                                        {...iField}
                                        value={iField.value || ""}
                                    />
                                </FormControl>
                                <FormMessage />
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
                                {idField.label && <FormLabel>{idField.label}</FormLabel>}
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
                                <FormMessage />
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
                                {idField.label && <FormLabel>{idField.label}</FormLabel>}
                                    <Select
                                        onValueChange={iField.onChange}
                                        value={iField.value || ""}
                                        disabled={IsLoadingTimezones}
                                    >
                                    <FormControl>
                                        <SelectTrigger className="h-12">
                                            <SelectValue
                                            placeholder={IsLoadingTimezones ? "Loading timezones..." : idField.placeholder}
                                            />
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
                        <FormMessage />
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
                                <p className="col-span-3 text-sm text-red-500">No slots available</p>
                            ) : (
                                TimeSlots.map(({ time, availability }) => {
                                const fromTime = time.slice(11, 16)
                                const [hourStr = "00", minuteStr = "00"] = fromTime.split(":");
                                const hour = parseInt(hourStr, 10);
                                const slotLabel = `${fromTime} - ${(hour + 1) % 24}:${minuteStr}`;
                                const formattedValue = `${fromTime}:00`

                                return (
                                    <Button
                                    key={time}
                                    type="button"
                                    variant={availability ? "default" : "outline"}
                                    className="h-10"
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
        <ReCaptchaProvider reCaptchaKey={process.env.RECAPTCHA_SITE_KEY ?? ""}>
        <div ref={FormRef} className={cn("w-full max-w-xl mx-auto bg-background rounded-lg shadow-md", className)}>
            {!hideCardHeader && (
                <div className="bg-primary text-border p-4">
                    <h2 className="text-2xl font-bold">{config.title}</h2>
                    {config.description && <p className="mt-2 text-border">{config.description}</p>}
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
                            <Button type="submit" className="w-full h-12 rounded-full" disabled={IsSubmitting}>
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
                                    <a href="#" className="underline">
                                        {config.termsText || "Terms"}
                                    </a>{" "}
                                    and{" "}
                                    <a href="#" className="underline">
                                        {config.privacyText || "Privacy Policy"}
                                    </a>
                                </p>
                            )}
                        </div>
                    </form>
                </Form>
            </div>
        </div>
        </ReCaptchaProvider>
    )
}

// Export the original form as "form" as requested
export const sectionForm = SectionForm