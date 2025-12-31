"use client"

import Link from "next/link";
import { useParams } from 'next/navigation';
import { useForm } from "react-hook-form"
import { useState, useRef, useEffect, type ReactElement, type ReactNode } from "react"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@repo/ui/lib/utils"
import { format } from "date-fns/format"
import { CalendarIcon } from "lucide-react"

import { Button } from "@repo/ui/components/ui/button"
import { Calendar } from "@repo/ui/components/ui/calendar"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { Checkbox } from "@repo/ui/components/ui/checkbox"
import { FloatingLabelInput } from "@repo/ui/components/ui/floating-label-input"
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/ui/popover"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select"

import "react-international-phone/style.css"
import { PhoneInput } from "react-international-phone"
import { ReCaptchaProvider, useReCaptcha } from "next-recaptcha-v3"

import { ContactApi } from "@repo/ui/api/contact/create-contact"
import { LeadApi } from "@repo/ui/api/casestudy/create-lead"
import { fetchTimezones } from "@repo/ui/api/appointment/fetch-timezone"
import { fetchTimeSlots } from "@repo/ui/api/appointment/fetch-timeslot"
import { bookAppointmentAction } from "@repo/ui/api/appointment/book-appointment"
import { subscribeNewsletter } from "@repo/ui/api/newsletter/create-subscription"
import { sendCommunicationAction } from "@repo/ui/api/contact/fetch-contact"
import { UpdateEventParticipant } from "@repo/ui/api/event/create-participant"

import type { TformFieldConfig, TformConfig, TdynamicFormProps, Tslot, TtrendCardProps, TcaseStudies } from "@repo/middleware/types"

//till now the strapi's enumerate field value is return with uderscore(incase of space)
// https://github.com/strapi/strapi/issues/7904
//this is the helper function to map the user friently style name to tailwind css
function fnGetClassNameFromFriendlyName(iStrapiValue: string) {
    //object mapping is much faster than switch
    const LdClassNameMap: Record<string, string> = {
        Half_Width_Right_Padding: "w-1/2 pr-2 mb-3",
        Half_Width_Left_Padding: "w-1/2 pl-2 mb-3",
        Full_Width_Small_Bottom_Space: "w-full mb-3",
        Half_Width_on_Tablet_Right_Padding: "md:w-1/2 w-full md:pr-2 mb-3",
        Half_Width_on_Tablet_Left_Padding: "md:w-1/2 w-full md:pl-2 mb-3",
        Full_Width_Larger_Bottom_Space: "w-full mb-4",
        Half_Width_on_Tablet_Right_Padding_Medium_2_5: "w-full md:w-1/2 md:pr-2.5 mb-3",
        Half_Width_on_Tablet_Left_Padding_Medium_2_5: "w-full md:w-1/2 md:pl-2.5 mb-3",
        Half_Width_on_Tablet_Right_Padding_Small: "w-full md:w-1/2 md:pr-2 mb-3",
        Half_Width_on_Tablet_Left_Padding_Small: "w-full md:w-1/2 md:pl-2 mb-3",
        Half_Width_on_Tablet_Small_Bottom_Space: "w-full md:w-1/2 mb-3",
        Full_Width_Medium_Right_Padding_2_5: "w-full md:pr-2.5 mb-3",
        Full_Width_Medium_Left_Padding_2_5: "w-full md:pl-2.5 mb-3",
        Half_Width_on_Tablet_No_Margin: "w-full md:w-1/2",
        Full_Width_No_Margin: "w-full",
    }
    return LdClassNameMap[iStrapiValue] || "w-full mb-3"
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
 * idConfig - form configuration from strapi
 * returns Object containing response data or error
 */
export async function fnSubmitAppointmentBooking(idFormData: any, iRecaptchaToken: string, idConfig: TformConfig) {
    try {
        // Format the date into 'yyyy-MM-dd' string format for the backend
        const LFormattedDate = format(new Date(idFormData.date), "yyyy-MM-dd")

        // Construct payload to be sent to the booking API
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

        // Send the booking request to the server
        const LdResponse = await bookAppointmentAction(LdPayload)

        // If user opted into the newsletter, submit their email
        if (idFormData.newsletter) {
            const LdNewFormData = new FormData()
            LdNewFormData.append("email", idFormData.email)
            await subscribeNewsletter({ message: "" }, LdNewFormData)
        }

        // Handle errors returned by the booking API
        if (LdResponse.error) {
            return { error: LdResponse.error }
        }
        // Determine the booking status (e.g., Unverified vs Verified)
        const LStatus = LdResponse?.data?.message?.status

        // Determine title and message to show based on verification status
        const LTitle = LStatus === "Unverified" ? idConfig.unVerifiedMessage?.label ?? "Welcome To Our Family!" : idConfig.verifiedMessage?.label ?? "Thank You!"

        const LMessage =
            LStatus === "Unverified"
                ? idConfig.unVerifiedMessage?.description ?? "Please check your email to confirm the appointment"
                : idConfig.verifiedMessage?.description ?? "Booking confirmed successfully"

        // Return the final formatted result to the UI
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
        // Prepare payload to be sent to the server for sending communication
        const LdPayload = {
            email: idFormData.email,
            notes: idFormData.message || "",
            option: idFormData.enquiryType || "Free Trial",
            recaptchaToken: iRecaptchaToken,
        }
        // Send the contact details to the backend communication handler
        const LdResponse = await sendCommunicationAction(LdPayload)

        // If the user opted in to the newsletter, add them to the subscription list
        if (idFormData.newsletter) {
            const LdNewFormData = new FormData()
            LdNewFormData.append("email", idFormData.email)
            await subscribeNewsletter({ message: "" }, LdNewFormData)
        }

        // If server responded with an error, return it
        if (LdResponse.error) {
            return { error: LdResponse.error }
        }

        // Return success response with any provided message and data
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

export async function fnDownload(idFormData: any, idPdfData: TcaseStudies, iRecaptchaToken: string) {

    try {
        //payload to be passed on LeadApi
        const LdPayload = {
            name: idFormData.name,
            email: idFormData.email,
            recaptchaToken: iRecaptchaToken,
        }
        //call the LeadApi, which is check if lead with the incoming email
        //exist, if not create a new Lead with the incoming name and email
        const LdResponse = await LeadApi(LdPayload)
        // Check if the user opted in for the newsletter
        if (idFormData.newsletter) {
            // Prepare a FormData object with the user's email
            const LdNewFormData = new FormData();
            LdNewFormData.append("email", idFormData.email);
            // Subscribe the user to the newsletter
            await subscribeNewsletter({ message: "" }, LdNewFormData);
        }
        if (LdResponse.message === 'error') {
            return {
                message: "Something went wrong, please try again later",
                title: "Download Fail",
            };
        }
        // Dynamically import the Case Study PDF layout component(nextjs feature)
        // Dynamically import the React PDF renderer(nextjs feature)
        const { PdfDocument } = await import("@repo/ui/components/pdf/casestudy-layout");
        const { pdf } = await import("@react-pdf/renderer");

        // Generate a PDF blob from the PdfDocument component with provided case study data
        const Blob = await pdf(<PdfDocument idData={idPdfData} />).toBlob();
        // Create a temporary object URL from the Blob
        const Url = URL.createObjectURL(Blob);
        // Create a hidden anchor element to trigger the download
        const Link = document.createElement("a");
        Link.href = Url;  // Set the href to the Blob URL
        Link.download = `${idPdfData?.caseStudies[0]?.pdfName}.pdf`;  // Set the desired filename {can make it automated using the idPdfData}
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

            if (config.formId === "booking") {
                LdResponse = await fnSubmitAppointmentBooking(idFormData, LdRecaptchaToken, config)
                config.successMessage = LdResponse.message ? LdResponse.message : ""
                config.successTitle = LdResponse.title ? LdResponse.title : ""
            } else if (config.formId === "contact") {
                LdResponse = await fnSubmitContact(idFormData, LdRecaptchaToken)
            }
            else if (config.formId === "download") {
                LdResponse = await fnDownload(idFormData, pdfData, LdRecaptchaToken)
            }
            else if (config.formId === "webinar") {
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
                            <FormItem className={fnGetClassNameFromFriendlyName(idField.fieldDisplay)}>
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
                            <FormItem className={fnGetClassNameFromFriendlyName(idField.fieldDisplay)}>
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
                            <FormItem className={fnGetClassNameFromFriendlyName(idField.fieldDisplay)}>
                                <Select onValueChange={iField.onChange} value={iField.value || idField.defaultValue}>
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
                            <FormItem className={fnGetClassNameFromFriendlyName(idField.fieldDisplay)}>
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
                            <FormItem className={fnGetClassNameFromFriendlyName(idField.fieldDisplay)}>
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
                            <FormItem className={fnGetClassNameFromFriendlyName(idField.fieldDisplay)}>
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
                            <FormItem className={fnGetClassNameFromFriendlyName(idField.fieldDisplay)}>
                                {idField.label && <FormLabel>{idField.label}</FormLabel>}
                                <div className="grid grid-cols-3 gap-2">
                                    {IsLoadingSlots ? (
                                        <p className="col-span-3 text-muted-foreground text-sm">{idField.loading.label ?? "Loading slots..."}</p>
                                    ) : TimeSlots.length === 0 ? (
                                        <p className="col-span-3 text-sm text-red-500 text-center py-4 font-medium">{idField.loading.description ?? "No slots available"}</p>
                                    ) : (
                                        TimeSlots.map(({ time, availability }) => { //here the variable is destructure from response
                                            const fromTime = time.slice(11, 16)
                                            const [hourStr = "00", minuteStr = "00"] = fromTime.split(":")
                                            const hour = Number.parseInt(hourStr, 10)
                                            const slotLabel = `${fromTime} - ${(hour + 1) % 24}:${minuteStr}`
                                            const formattedValue = `${fromTime}:00`

                                            return (
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
                            <FormItem className={cn(fnGetClassNameFromFriendlyName(idField.fieldDisplay), "flex flex-row items-center justify-start space-x-2")}>
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
                                    </span>
                                ) : (
                                    config.submitText
                                )}
                            </Button>

                            {config.showTerms && (
                                <p className="text-xs text-center text-muted-foreground">
                                    {config.policyDescription ?? "By submitting, you agree to our"}{" "}
                                    <Link href={`/${config.terms?.href ?? "terms-and-conditions"}`} className="underline" target="_blank" rel="noopener noreferrer">
                                        {config.terms?.label ?? "Terms"}
                                    </Link>{" "}
                                    &{" "}
                                    <Link href={`/${config.privacy?.href ?? "privacy-policy"}`} className="underline" target="_blank" rel="noopener noreferrer">
                                        {config.privacy?.label ?? "Privacy Policy"}
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
    /**
     * Inner component that wraps the form with ReCaptcha provider
     * innerProps - Props passed to the inner form component
     * returns React element with ReCaptcha provider and inner form
     */
    const WrappedComponent = (innerProps: TdynamicFormProps) => {
        return (
            <ReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ""}
            >
                <InnerSectionForm {...innerProps} />
            </ReCaptchaProvider>
        )
    }
    return <WrappedComponent {...props} />
}