"use client"
import { useState, useRef, useEffect, ReactElement, ReactNode } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from 'date-fns/format';
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
import { TformFieldConfig, TformConfig, TdynamicFormProps } from "@repo/ui/type"

// These form configuration objects define the structure, validation rules, and fields for different form types.
export const LdBookingFormConfig: TformConfig = {
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
        phone: z.string().min(10, "Please enter a valid phone number"),
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
    title: "Contact Us",
    description: "Get in touch with our team",
    submitText: "Send Message",
    successMessage: "Your message has been sent!",
    showTerms: true,
    schema: z.object({
        name: z.string().regex(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces"),
        email: z.string().email("Please enter a valid email"),
        message: z.string().min(10, "Message must be at least 10 characters"),
        newsletter: z.boolean().default(true),
    }),
    fields: [
        {
            name: "name",
            type: "select",
            placeholder: "Select an option *",
            required: true,
            className: "w-full mb-3",
            options: [
                { value: "general", label: "General Inquiry" },
                { value: "support", label: "Support Request" },
                { value: "sales", label: "Sales Inquiry" },
                { value: "feedback", label: "Feedback" },
                { value: "other", label: "Other" },
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


/**
 * DynamicForm - A flexible form component that renders different form types based on configuration.
 * This component creates a complete form UI with validation, submission handling, and success/error states.
 * It dynamically renders different field types (text, select, date, etc.) based on the provided configuration.
 */

export function DynamicForm({
    config,
    onSuccess,
    onCancel,
    className = "",
    defaultValues,
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
        mode: "onChange",
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
        fnSetIsSubmitting(true)
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            LdForm.reset(LdInitialValues)
            onSuccess(idFormData, config.successMessage)
        } catch (error) {
            LdForm.setError("root", {
                type: "manual",
                message: "An error occurred while submitting the form",
            })
        } finally {
            fnSetIsSubmitting(false)
        }
    }

    const LaTimeSlots = [
        "09:00 - 10:00",
        "10:00 - 11:00",
        "11:00 - 12:00",
        "13:00 - 14:00",
        "14:00 - 15:00",
        "15:00 - 16:00",
    ]

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
                                <Select onValueChange={iField.onChange} value={iField.value || ""}>
                                    <FormControl>
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder={idField.placeholder} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {[
                                            "UTC",
                                            "UTC+1 (Central European Time)",
                                            "UTC+2 (Eastern European Time)",
                                            "UTC-5 (Eastern Standard Time)",
                                            "UTC-8 (Pacific Standard Time)",
                                        ].map((iZone) => (
                                            <SelectItem key={iZone} value={iZone}>
                                                {iZone}
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
                return (
                    <FormField
                        key={idField.name}
                        control={LdForm.control}
                        name={idField.name}
                        render={({ field: iField }) => (
                            <FormItem className={idField.className}>
                                {idField.label && <FormLabel>{idField.label}</FormLabel>}
                                <div className="grid grid-cols-3 gap-2">
                                    {LaTimeSlots.map((iSlot) => (
                                        <Button
                                            key={iSlot}
                                            type="button"
                                            variant={iField.value === iSlot ? "default" : "outline"}
                                            className="h-10"
                                            onClick={() => iField.onChange(iSlot)}
                                        >
                                            {iSlot}
                                        </Button>
                                    ))}
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
        <div ref={FormRef} className={cn("w-full max-w-xl mx-auto bg-background rounded-lg shadow-md", className)}>
            <div className="bg-primary text-background p-6 rounded-t-lg">
                <h2 className="text-2xl font-bold">{config.title}</h2>
                {config.description && <p className="mt-2 text-border">{config.description}</p>}
            </div>
            <div className="p-6">
                <Form {...LdForm}>
                    <form onSubmit={LdForm.handleSubmit(fnHandleSubmit)}>
                        {LdForm.formState.errors.root && (
                            <p className="text-red-500 text-sm mb-4">{LdForm.formState.errors.root.message}</p>
                        )}

                        <div className="flex flex-wrap -mx-2">{config.fields.map(fnRenderField)}</div>

                        <div className="space-y-4">
                            <Button type="submit" className="w-full h-12" disabled={IsSubmitting}>
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
    )
}