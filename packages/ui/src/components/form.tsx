"client"

import { useState, useRef, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, CheckCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
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

// Update the placeholders to include asterisks for required fields
export const bookingFormConfig: TformConfig = {
    title: "Book an Appointment",
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
        name: z.string().regex(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces"),
        phone: z.string().min(10, "Please enter a valid phone number"),
        email: z.string().email("Please enter a valid email"),
        message: z.string().optional(),
        newsletter: z.boolean().default(true),
    }),
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
            placeholder: "Email address *",
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

export const contactFormConfig: TformConfig = {
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

export const downloadFormConfig: TformConfig = {
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

export function DynamicForm({ config, onSuccess, onCancel, className = "", defaultValues }: TdynamicFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const formRef = useRef<HTMLDivElement>(null)
    const [showTimeSlots, setShowTimeSlots] = useState(false)

    const form = useForm<z.infer<typeof config.schema>>({
        resolver: zodResolver(config.schema),
        defaultValues: {
            ...defaultValues,
            newsletter: true,
            agreeTerms: true,
        },
        mode: "onChange",
    })

    // Watch date and timezone to determine if timeslots should be shown
    const selectedDate = form.watch("date")
    const selectedTimezone = form.watch("timezone")

    useEffect(() => {
        if (selectedDate && selectedTimezone) {
            setShowTimeSlots(true)
        } else {
            setShowTimeSlots(false)
            if (form.getValues("timeSlot")) {
                form.setValue("timeSlot", "")
            }
        }
    }, [selectedDate, selectedTimezone, form])

    const handleSubmit = async (data: any) => {
        setIsSubmitting(true)
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))

            setShowSuccess(true)
            onSuccess(data, config.successMessage)

            // Reset the form after successful submission
            form.reset({
                ...form.formState.defaultValues,
                newsletter: true,
                agreeTerms: true,
            })

        } catch (error) {
            form.setError("root", {
                type: "manual",
                message: "An error occurred while submitting the form"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const timeSlots = [
        "09:00 - 10:00",
        "10:00 - 11:00",
        "11:00 - 12:00",
        "13:00 - 14:00",
        "14:00 - 15:00",
        "15:00 - 16:00",
    ]

    const renderField = (field: TformFieldConfig) => {
        if (field.type === "timeslot" && !showTimeSlots) return null

        switch (field.type) {
            case "text":
            case "email":
            case "phone":
                return (
                    <FormField
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        render={({ field: formField, fieldState }) => (
                            <FormItem className={field.className}>
                                {field.label && <FormLabel>{field.label}</FormLabel>}
                                <FormControl>
                                    <Input
                                        placeholder={field.placeholder}
                                        type={field.type === "phone" ? "tel" : field.type}
                                        className={cn(
                                            "h-12",
                                            field.inputClassName,
                                            fieldState.error && "border-red-400",
                                        )}
                                        {...formField}
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
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                            <FormItem className={field.className}>
                                {field.label && <FormLabel>{field.label}</FormLabel>}
                                <Select onValueChange={formField.onChange} value={formField.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder={field.placeholder} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {field.options?.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
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
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        render={({ field: formField, fieldState }) => (
                            <FormItem className={field.className}>
                                {field.label && <FormLabel>{field.label}</FormLabel>}
                                <FormControl>
                                    <Textarea
                                        placeholder={field.placeholder}
                                        className={cn(
                                            "min-h-[100px]",
                                            field.inputClassName,
                                            fieldState.error && "border-red-400",
                                        )}
                                        {...formField}
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
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                            <FormItem className={field.className}>
                                {field.label && <FormLabel>{field.label}</FormLabel>}
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "h-12 w-full text-left font-normal",
                                                    !formField.value && "text-muted-foreground"
                                                )}
                                            >
                                                {formField.value ? format(formField.value, "PPP") : field.placeholder}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={formField.value}
                                            onSelect={formField.onChange}
                                            disabled={(date) => date < new Date()}
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
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                            <FormItem className={field.className}>
                                {field.label && <FormLabel>{field.label}</FormLabel>}
                                <Select onValueChange={formField.onChange} defaultValue={formField.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder={field.placeholder} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {[
                                            "UTC",
                                            "UTC+1 (Central European Time)",
                                            "UTC+2 (Eastern European Time)",
                                            "UTC-5 (Eastern Standard Time)",
                                            "UTC-8 (Pacific Standard Time)",
                                        ].map((zone) => (
                                            <SelectItem key={zone} value={zone}>
                                                {zone}
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
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                            <FormItem className={field.className}>
                                {field.label && <FormLabel>{field.label}</FormLabel>}
                                <div className="grid grid-cols-3 gap-2">
                                    {timeSlots.map((slot) => (
                                        <Button
                                            key={slot}
                                            type="button"
                                            variant={formField.value === slot ? "default" : "outline"}
                                            className="h-10"
                                            onClick={() => formField.onChange(slot)}
                                        >
                                            {slot}
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
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                            <FormItem className={cn(field.className, "flex flex-row items-center justify-start space-x-2")}>
                                <FormControl>
                                    <Checkbox
                                        checked={formField.value}
                                        onCheckedChange={formField.onChange}
                                        className="mt-1.5"
                                    />
                                </FormControl>
                                <FormLabel className="font-normal">{field.placeholder}</FormLabel>
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
        <div ref={formRef} className={cn("w-full max-w-xl mx-auto bg-white rounded-lg shadow-md", className)}>
            {showSuccess ? (
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 text-center"
                    >
                        <div className="space-y-4">
                            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900">Success!</h3>
                            <p className="text-gray-600 mb-6">{config.successMessage}</p>
                            <Button
                                type="button"
                                variant="default"
                                onClick={() => {
                                    setShowSuccess(false)
                                    onCancel?.()
                                }}
                            >
                                Close
                            </Button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            ) : (
                <>
                    <div className="bg-gray-900 text-white p-6 rounded-t-lg">
                        <h2 className="text-2xl font-bold">{config.title}</h2>
                        {config.description && <p className="mt-2 text-gray-300">{config.description}</p>}
                    </div>
                    <div className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)}>
                                {form.formState.errors.root && (
                                    <p className="text-red-500 text-sm mb-4">
                                        {form.formState.errors.root.message}
                                    </p>
                                )}

                                <div className="flex flex-wrap -mx-2">{config.fields.map(renderField)}</div>

                                <div className="space-y-4">
                                    <Button
                                        type="submit"
                                        className="w-full h-12"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </span>
                                        ) : (
                                            config.submitText
                                        )}
                                    </Button>

                                    {config.showTerms && (
                                        <p className="text-xs text-center text-gray-500">
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
                </>
            )}
        </div>
    )
}