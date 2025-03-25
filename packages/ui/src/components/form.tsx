"use client"

import { useState, useRef, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, CheckCircle, XCircle } from "lucide-react"
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
export type FormMode = "booking" | "contact" | "download" | null

// Update the bookingFormSchema to include phone validation
const bookingFormSchema = z.object({
    date: z.date({
        required_error: "Please select a date.",
    }),
    timezone: z.string({
        required_error: "Please select a timezone.",
    }),
    timeSlot: z.string({
        required_error: "Please select a time slot.",
    }),
    name: z.string().regex(/^[a-zA-Z\s]+$/, {
        message: "Name can only contain alphabets and spaces.",
    }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    phoneNumber: z.string().min(10, { message: "Please enter a valid phone number." }),
    message: z.string().max(500, { message: "Message must not exceed 500 characters." }).optional(),
    newsletter: z.boolean().default(true),
})

// Inquiry types
const inquiryTypes = [
    { value: "general", label: "General Inquiry" },
    { value: "support", label: "Technical Support" },
    { value: "sales", label: "Sales Inquiry" },
    { value: "partnership", label: "Partnership Opportunity" },
    { value: "feedback", label: "Feedback" },
]

// Validation schemas for each form mode
const contactFormSchema = z.object({
    inquiryType: z.string({
        required_error: "Please select an inquiry type.",
    }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    message: z
        .string()
        .min(10, { message: "Message must be at least 10 characters." })
        .max(500, { message: "Message must not exceed 500 characters." }),
    newsletter: z.boolean().default(true),
})

const downloadFormSchema = z.object({
    name: z
        .string()
        .min(2, { message: "Name must be at least 2 characters." })
        .regex(/^[a-zA-Z\s]+$/, {
            message: "Name can only contain alphabets and spaces.",
        }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    newsletter: z.boolean().default(true),
})

// Sample timezones for demo purposes
const sampleTimezones = [
    "UTC",
    "UTC+1 (Central European Time)",
    "UTC+2 (Eastern European Time)",
    "UTC-5 (Eastern Standard Time)",
    "UTC-8 (Pacific Standard Time)",
    "UTC+9 (Japan Standard Time)",
    "UTC+10 (Australian Eastern Standard Time)",
]

// Sample time slots for demo purposes
const sampleTimeSlots = [
    { time: "2023-01-01T09:00:00", availability: true },
    { time: "2023-01-01T10:00:00", availability: true },
    { time: "2023-01-01T11:00:00", availability: true },
    { time: "2023-01-01T12:00:00", availability: false },
    { time: "2023-01-01T13:00:00", availability: true },
    { time: "2023-01-01T14:00:00", availability: true },
    { time: "2023-01-01T15:00:00", availability: true },
    { time: "2023-01-01T16:00:00", availability: true },
    { time: "2023-01-01T17:00:00", availability: false },
]

// Main form component
export function DynamicForm({
    initialMode = null,
    onSuccess,
}: {
    initialMode?: FormMode
    onSuccess: (mode: FormMode, message: string) => void
}) {
    const [mode, setMode] = useState<FormMode>(initialMode)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submissionError, setSubmissionError] = useState<string | null>(null)
    const [serverMessage, setServerMessage] = useState<{ type: "success" | "error"; message: string } | null>(null)
    const formRef = useRef<HTMLDivElement>(null)

    // State variables for UI
    const [timezones] = useState<string[]>(sampleTimezones)
    const [timeSlots] = useState<any[]>(sampleTimeSlots)
    const [isSectionVisible, setIsSectionVisible] = useState(true)

    // Booking form
    const bookingForm = useForm<z.infer<typeof bookingFormSchema>>({
        resolver: zodResolver(bookingFormSchema),
        defaultValues: {
            newsletter: true,
        },
        mode: "onChange", // Enable real-time validation
    })

    // Contact form
    const contactForm = useForm<z.infer<typeof contactFormSchema>>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            newsletter: true,
        },
        mode: "onChange", // Enable real-time validation
    })

    // Download form
    const downloadForm = useForm<z.infer<typeof downloadFormSchema>>({
        resolver: zodResolver(downloadFormSchema),
        defaultValues: {
            newsletter: true,
        },
        mode: "onChange", // Enable real-time validation
    })

    // Update form mode when initialMode changes
    useEffect(() => {
        if (initialMode !== mode) {
            setMode(initialMode)
            setIsSectionVisible(true)
            setServerMessage(null)
        }
    }, [initialMode, mode])

    // Scroll to form when mode changes
    useEffect(() => {
        if (mode && formRef.current) {
            // Use a smaller timeout for more immediate response
            setTimeout(() => {
                formRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start", // Align the top of the form with the top of the viewport
                })
            }, 10)
        }
    }, [mode])

    // Close message and notify parent
    const closeMessage = () => {
        setServerMessage(null)
        setIsSectionVisible(true)
        onSuccess(null, "")
    }

    // Handle form submission
    const onSubmit = async (data: any, formMode: FormMode) => {
        setIsSubmitting(true)
        setSubmissionError(null)
        setServerMessage(null)

        // Simulate API call with timeout
        setTimeout(() => {
            try {
                // Handle successful submission
                let successMessage = ""

                if (formMode === "booking") {
                    successMessage = "Your booking has been confirmed successfully!"
                } else if (formMode === "contact") {
                    successMessage = "Your message has been sent successfully!"
                } else {
                    successMessage = "Your download is ready!"
                }

                // Clear form
                if (formMode === "booking") bookingForm.reset()
                if (formMode === "contact") contactForm.reset()
                if (formMode === "download") downloadForm.reset()

                // Show success message
                setServerMessage({ type: "success", message: successMessage })
                setIsSectionVisible(false)

                // Notify parent component
                onSuccess(formMode, successMessage)
            } catch (error) {
                console.error("Submission error:", error)
                setServerMessage({
                    type: "error",
                    message: "An unexpected error occurred. Please try again.",
                })
            } finally {
                setIsSubmitting(false)
            }
        }, 1000) // Simulate network delay
    }

    // Render the appropriate form based on mode
    const renderForm = () => {
        switch (mode) {
            case "booking":
                return (
                    <Form {...bookingForm}>
                        <form
                            onSubmit={bookingForm.handleSubmit((data) => onSubmit(data, "booking"))}
                            className="flex flex-col space-y-4"
                        >
                            <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-6">
                                {/* Date Field */}
                                <FormField
                                    control={bookingForm.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem className="w-full md:w-1/2">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal flex justify-start rounded-md",
                                                                !field.value && "text-muted-foreground",
                                                            )}
                                                        >
                                                            <span className="flex-1 text-left">
                                                                {field.value ? format(field.value, "PPP") : "Select appointment date"}
                                                            </span>
                                                            <CalendarIcon className="h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) =>
                                                            date < new Date() || date > new Date(new Date().setMonth(new Date().getMonth() + 3))
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Timezone Field */}
                                <FormField
                                    control={bookingForm.control}
                                    name="timezone"
                                    render={({ field }) => (
                                        <FormItem className="w-full md:w-1/2">
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select your timezone" className="rounded-md" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {timezones.map((timezone, index) => (
                                                        <SelectItem key={index} value={timezone}>
                                                            {timezone}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            {bookingForm.watch("date") && bookingForm.watch("timezone") && (
                                <FormField
                                    control={bookingForm.control}
                                    name="timeSlot"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="grid grid-cols-3 gap-2">
                                                {timeSlots.map((slot) => {
                                                    const fromTime = slot.time.slice(11, 16)
                                                    return (
                                                        <Button
                                                            key={slot.time}
                                                            type="button"
                                                            variant={field.value === `${fromTime}:00` ? "default" : "outline"}
                                                            className={cn("h-10", !slot.availability && "opacity-50 cursor-not-allowed")}
                                                            disabled={!slot.availability}
                                                            onClick={() => {
                                                                if (slot.availability) {
                                                                    field.onChange(`${fromTime}:00`)
                                                                }
                                                            }}
                                                        >
                                                            {fromTime} - {(Number.parseInt(fromTime.split(":")[0]) + 1) % 24}:{fromTime.split(":")[1]}
                                                        </Button>
                                                    )
                                                })}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                            <div className="grid grid-cols-2 gap-6">
                                {/* Name Field */}
                                <FormField
                                    control={bookingForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    placeholder="Name *"
                                                    className={cn(bookingForm.formState.errors.name && "border-red-500")}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Phone Number Field */}
                                <FormField
                                    control={bookingForm.control}
                                    name="phoneNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    placeholder="Phone Number *"
                                                    className={cn(bookingForm.formState.errors.phoneNumber && "border-red-500")}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            {/* Email Field */}
                            <FormField
                                control={bookingForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                placeholder="Email Address *"
                                                className={cn(bookingForm.formState.errors.email && "border-red-500")}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Message Field */}
                            <FormField
                                control={bookingForm.control}
                                name="message"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="relative">
                                                <Textarea
                                                    placeholder="Share any specific requirements or questions..."
                                                    className={cn(
                                                        "resize-none min-h-[80px]",
                                                        bookingForm.formState.errors.message && "border-red-500",
                                                    )}
                                                    {...field}
                                                    maxLength={500}
                                                />
                                                <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                                                    {field.value?.length || 0}/500
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Newsletter Checkbox */}
                            <FormField
                                control={bookingForm.control}
                                name="newsletter"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Subscribe to our newsletter</FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            {/* Error Message */}
                            {submissionError && <div className="text-sm font-medium text-destructive mb-4">{submissionError}</div>}
                            {/* Submit Button and Terms */}
                            <div className="flex flex-col space-y-4">
                                <Button type="submit" className="w-full" disabled={!bookingForm.formState.isValid || isSubmitting}>
                                    {isSubmitting ? "Booking..." : "Book Now"}
                                </Button>
                                {/* Terms & Policy Agreement */}
                                <div className="text-sm text-muted-foreground text-center">
                                    By submitting this form, you agree to our{" "}
                                    <a href="#" className="underline underline-offset-2">
                                        Terms of Service
                                    </a>{" "}
                                    •{" "}
                                    <a href="#" className="underline underline-offset-2">
                                        Privacy Policy
                                    </a>
                                </div>
                            </div>
                        </form>
                    </Form>
                )

            case "contact":
                return (
                    <Form {...contactForm}>
                        <form onSubmit={contactForm.handleSubmit((data) => onSubmit(data, "contact"))} className="space-y-4">
                            {/* Inquiry Type Field */}
                            <FormField
                                control={contactForm.control}
                                name="inquiryType"
                                render={({ field }) => (
                                    <FormItem>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className={cn(contactForm.formState.errors.inquiryType && "border-red-500")}>
                                                    <SelectValue placeholder="Select the type of inquiry *" className="text-red-500" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {inquiryTypes.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Email Field */}
                            <FormField
                                control={contactForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                placeholder="your.email@example.com *"
                                                className={cn(contactForm.formState.errors.email && "border-red-500")}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Message Field with character counter */}
                            <FormField
                                control={contactForm.control}
                                name="message"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="relative">
                                                <Textarea
                                                    placeholder="Please describe your inquiry in detail... *"
                                                    className={cn(
                                                        "resize-none min-h-[80px]",
                                                        contactForm.formState.errors.message && "border-red-500",
                                                    )}
                                                    maxLength={500}
                                                    {...field}
                                                />
                                                <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                                                    {field.value?.length || 0}/500
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Newsletter Checkbox */}
                            <FormField
                                control={contactForm.control}
                                name="newsletter"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Subscribe to our newsletter</FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            {/* Error Message */}
                            {submissionError && <div className="text-sm font-medium text-destructive mb-2">{submissionError}</div>}

                            {/* Submit Button and Terms */}
                            <div className="space-y-2">
                                <Button type="submit" className="w-full" disabled={!contactForm.formState.isValid || isSubmitting}>
                                    {isSubmitting ? "Submitting..." : "Submit"}
                                </Button>

                                {/* Terms & Policy Agreement */}
                                <div className="text-sm text-muted-foreground text-center">
                                    By submitting this form, you agree to our{" "}
                                    <a href="#" className="underline underline-offset-2">
                                        Terms of Service
                                    </a>{" "}
                                    •{" "}
                                    <a href="#" className="underline underline-offset-2">
                                        Privacy Policy
                                    </a>
                                </div>
                            </div>
                        </form>
                    </Form>
                )

            case "download":
                return (
                    <Form {...downloadForm}>
                        <form onSubmit={downloadForm.handleSubmit((data) => onSubmit(data, "download"))} className="space-y-5">
                            {/* Name Field */}
                            <FormField
                                control={downloadForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter your full name *"
                                                className={cn(downloadForm.formState.errors.name && "border-red-500")}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Email Field */}
                            <FormField
                                control={downloadForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                placeholder="your.email@example.com *"
                                                className={cn(downloadForm.formState.errors.email && "border-red-500")}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Newsletter Checkbox & Submit Button in the Same Row */}
                            <div className="flex justify-between items-center">
                                {/* Newsletter Checkbox */}
                                <FormField
                                    control={downloadForm.control}
                                    name="newsletter"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Subscribe to our newsletter</FormLabel>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                {/* Submit Button */}
                                <Button type="submit" className="w-auto" disabled={!downloadForm.formState.isValid || isSubmitting}>
                                    {isSubmitting ? "Processing..." : "Download Now"}
                                </Button>
                            </div>

                            {/* Error Message */}
                            {submissionError && <div className="text-sm font-medium text-destructive mt-2">{submissionError}</div>}
                        </form>
                    </Form>
                )

            default:
                return null
        }
    }

    if (!mode) return null

    return (
        <div ref={formRef} className="w-full max-w-xl mx-auto mb-8 bg-card rounded-lg shadow-lg border overflow-hidden">
            {isSectionVisible ? (
                <>
                    <div className="bg-black text-white p-4 relative overflow-hidden mb-3">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                        <h2 className="text-2xl font-bold tracking-tight relative z-10">
                            {mode === "booking" && "Book an Appointment"}
                            {mode === "contact" && "Contact Us"}
                            {mode === "download" && "Download Case Study"}
                        </h2>
                        <p className="text-white/70 mt-1 relative z-10">
                            {mode === "booking" && "Fill out the form below to schedule a meeting with us."}
                            {mode === "contact" && "Have questions? We're here to help."}
                            {mode === "download" && "Get instant access to our case study materials."}
                        </p>
                    </div>
                    <div className="p-4 md:p-6">{renderForm()}</div>
                </>
            ) : (
                <AnimatePresence>
                    {serverMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="p-6"
                        >
                            <div className="bg-card rounded-lg p-6 text-center relative shadow-sm border">
                                {serverMessage.type === "success" ? (
                                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                ) : (
                                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                )}
                                <h2 className="text-xl font-bold mb-2">{serverMessage.type === "success" ? "Success!" : "Error"}</h2>
                                <p className="text-muted-foreground mb-6">{serverMessage.message}</p>
                                <Button
                                    onClick={closeMessage}
                                    variant={serverMessage.type === "success" ? "default" : "outline"}
                                    className="px-6"
                                >
                                    Close
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    )
}

