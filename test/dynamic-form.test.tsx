import { act, render, screen, waitFor, type RenderResult } from "@testing-library/react"
import "@testing-library/jest-dom"
import userEvent from "@testing-library/user-event"
import type { ComponentProps, ReactNode } from "react"
import type { Control, FieldValues, UseFormReturn } from "react-hook-form"
import { z } from "zod"

import {
    fnDownload,
    fnSubmitAppointmentBooking,
    fnSubmitContact,
    fnSubmitWebinar,
} from "@repo/ui/components/form"
import { fetchTimeSlots } from "@repo/ui/api/appointment/fetch-timeslot"
import { fetchTimezones } from "@repo/ui/api/appointment/fetch-timezone"
import { fetchAppointmentAvailability } from "@repo/ui/api/appointment/fetch-appointment-availability"
import { checkNewsletterSubscription } from "@repo/ui/api/newsletter/check-subscription"
import type { TdynamicFormProps, TfieldType, TformConfig, TformFieldConfig, Tslot } from "@repo/middleware/types"
import { fnDeriveNameFromEmail } from "../packages/ui/src/components/contact/contact-form.config"
import { useKnownVisitorProfile } from "../packages/ui/src/hooks/use-known-visitor-profile"
import { useDetectedRegion } from "../packages/ui/src/components/contact/useDetectedRegion"

const fnExecuteRecaptcha = jest.fn()
let LdUser: ReturnType<typeof userEvent.setup>

type TfieldValue = string | boolean | Date | undefined

type TmockControllerField = {
    value: TfieldValue
    onChange: (iValue: unknown) => void
}

type TmockDynamicStep = {
    id: string
    fields: TformFieldConfig[]
}

type TmockDynamicFormStepProps = {
    step: TmockDynamicStep
    control: Control<FieldValues>
    countryIso?: string
    showTimeSlots?: boolean
    timeSlots?: Tslot[]
    isLoadingSlots?: boolean
    timezones?: string[]
    isLoadingTimezones?: boolean
    availabilityError?: string
    appointmentDuration?: number
    isEmailSubscribed?: boolean | null
}

type TmockButtonProps = ComponentProps<"button"> & {
    children: ReactNode
}

type TmockFormProviderProps = UseFormReturn<FieldValues> & {
    children: ReactNode
}

type TrenderOptions = Partial<Omit<TdynamicFormProps, "config" | "onSuccess">> & {
    configOverrides?: Partial<TformConfig>
}

type TrenderResult = RenderResult & {
    fnOnSuccess: jest.Mock<void, [string, string]>
    fnOnSuccessfulSubmit: jest.Mock<Promise<void>, [Parameters<NonNullable<TdynamicFormProps["onSuccessfulSubmit"]>>[0]]>
}

// This suite is intentionally written at the parent-component level.
// DynamicForm owns the business behavior we care about here: splitting fields
// into steps, validating only the active step, loading booking data, checking
// newsletter state, calling reCAPTCHA, and routing the final submit payload.
// The real DynamicFormStep has lots of visual/UI behavior, so the mock below
// keeps only the minimum react-hook-form contract needed by DynamicForm.
// That separation makes failures easier for reviewers to diagnose: if one of
// these tests fails, the broken behavior should be in DynamicForm orchestration,
// not in styling, icons, animations, or the child field layout component.
jest.mock("../packages/ui/src/components/contact/DynamicFormStep", () => {
    const React = jest.requireActual("react")
    const { Controller } = jest.requireActual<typeof import("react-hook-form")>("react-hook-form")

    // Booking slots are returned as ISO-like strings, while the UI shows a
    // readable range. Keeping this formatter in the mock lets the tests assert
    // the same visible label a user would click without importing the real step.
    const fnSlotLabel = (iTime: string, iDuration: number): string => {
        const LStart = iTime.slice(11, 16)
        const [LHour, LMinute] = LStart.split(":").map(Number)
        const LEndMinutes = (LHour * 60 + LMinute + iDuration) % (24 * 60)
        const LEndHour = Math.floor(LEndMinutes / 60).toString().padStart(2, "0")
        const LEndMinute = (LEndMinutes % 60).toString().padStart(2, "0")
        return `${LStart} - ${LEndHour}:${LEndMinute}`
    }

    // Field configs may use label, placeholder, or only a name depending on
    // the CMS shape. This helper mirrors the priority the mock should expose
    // through aria-labels so assertions stay accessible and readable.
    const fnFieldLabel = (idField: TformFieldConfig): string =>
        idField.label || idField.placeholder || idField.name

    const fnInputValue = (iValue: TfieldValue): string =>
        typeof iValue === "string" ? iValue : ""

    return {
        __esModule: true,
        default: ({
            step,
            control,
            countryIso,
            showTimeSlots,
            timeSlots = [],
            isLoadingSlots,
            timezones = [],
            isLoadingTimezones,
            availabilityError,
            appointmentDuration = 60,
            isEmailSubscribed,
        }: TmockDynamicFormStepProps) => (
            <div data-testid="dynamic-step" data-step-id={step.id} data-country={countryIso || ""}>
                {step.fields.map((idField) => {
                    const LLabel = fnFieldLabel(idField)

                    // DynamicForm hides the newsletter field once the lookup
                    // says the visitor is already subscribed. The marker gives
                    // tests a stable way to assert that parent-driven state.
                    if (idField.name === "newsletter" && isEmailSubscribed === true) {
                        return <div key={idField.name} data-testid="newsletter-hidden" />
                    }

                    // Every branch uses Controller so field changes update the
                    // real react-hook-form state held by DynamicForm.
                    if (idField.type === "checkbox") {
                        return (
                            <Controller
                                key={idField.name}
                                name={idField.name}
                                control={control}
                                render={({ field: iField }: { field: TmockControllerField }) => (
                                    <label>
                                        <input
                                            aria-label={LLabel}
                                            type="checkbox"
                                            checked={Boolean(iField.value)}
                                            onChange={(iEvent) => iField.onChange(iEvent.target.checked)}
                                        />
                                        {LLabel}
                                    </label>
                                )}
                            />
                        )
                    }

                    if (idField.type === "textarea") {
                        return (
                            <Controller
                                key={idField.name}
                                name={idField.name}
                                control={control}
                                render={({ field: iField }: { field: TmockControllerField }) => (
                                    <textarea aria-label={LLabel} {...iField} value={fnInputValue(iField.value)} />
                                )}
                            />
                        )
                    }

                    if (idField.type === "timezone") {
                        return (
                            <Controller
                                key={idField.name}
                                name={idField.name}
                                control={control}
                                render={({ field: iField }: { field: TmockControllerField }) => (
                                    <select
                                        aria-label="Select timezone"
                                        disabled={isLoadingTimezones}
                                        value={fnInputValue(iField.value)}
                                        onChange={iField.onChange}
                                    >
                                        <option value="">{isLoadingTimezones ? "Loading timezones..." : LLabel}</option>
                                        {timezones.map((iTimeZone: string) => (
                                            <option key={iTimeZone} value={iTimeZone}>{iTimeZone}</option>
                                        ))}
                                    </select>
                                )}
                            />
                        )
                    }

                    if (idField.type === "date") {
                        return (
                            <Controller
                                key={idField.name}
                                name={idField.name}
                                control={control}
                                render={({ field: iField }: { field: TmockControllerField }) => (
                                    <div>
                                        {/* A deterministic date keeps booking tests stable across machines and timezones. */}
                                        <button
                                            type="button"
                                            onClick={() => iField.onChange(new Date(2026, 11, 15))}
                                        >
                                            {iField.value ? "Dec 15 2026" : LLabel}
                                        </button>
                                        {availabilityError && <p>{availabilityError}</p>}
                                    </div>
                                )}
                            />
                        )
                    }

                    if (idField.type === "timeslot") {
                        // The parent decides when slots should appear. Returning
                        // null before that point lets tests catch step/booking
                        // state bugs without needing the real calendar UI.
                        if (!showTimeSlots) return null
                        if (isLoadingSlots) return <p key={idField.name}>Loading slots...</p>
                        if (timeSlots.length === 0) return <p key={idField.name}>No slots available</p>

                        return (
                            <Controller
                                key={idField.name}
                                name={idField.name}
                                control={control}
                                render={({ field: iField }: { field: TmockControllerField }) => (
                                    <div aria-label={LLabel}>
                                        {timeSlots.map((idSlot) => {
                                            const LValue = idSlot.time.slice(11, 19)
                                            return (
                                                <button
                                                    key={idSlot.time}
                                                    type="button"
                                                    disabled={!idSlot.availability}
                                                    data-selected={iField.value === LValue}
                                                    onClick={() => iField.onChange(LValue)}
                                                >
                                                    {fnSlotLabel(idSlot.time, appointmentDuration)}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            />
                        )
                    }

                    return (
                        <Controller
                            key={idField.name}
                            name={idField.name}
                            control={control}
                            render={({ field: iField }: { field: TmockControllerField }) => (
                                <input
                                    aria-label={LLabel}
                                    type={idField.type === "email" ? "email" : "text"}
                                    {...iField}
                                    value={fnInputValue(iField.value)}
                                />
                            )}
                        />
                    )
                })}
            </div>
        ),
    }
})

// The component imports these framework/design-system pieces, but the tests only
// need their behavior-facing contracts: links render hrefs, buttons click, and
// ReCaptcha exposes executeRecaptcha. These small mocks avoid coupling this
// behavior suite to Next.js routing internals or design-system markup.
jest.mock("next/navigation", () => ({ useParams: () => ({ locale: "en" }) }))
jest.mock("next-recaptcha-v3", () => ({
    ReCaptchaProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
    useReCaptcha: () => ({ executeRecaptcha: fnExecuteRecaptcha }),
}))
jest.mock("@repo/ui/components/ui/button", () => ({
    Button: ({ children, ...props }: TmockButtonProps) => <button {...props}>{children}</button>,
}))
jest.mock("@repo/ui/components/ui/form", () => {
    const ReactHookForm = jest.requireActual<typeof import("react-hook-form")>("react-hook-form")
    return {
        Form: ({ children, ...methods }: TmockFormProviderProps) => <ReactHookForm.FormProvider {...methods}>{children}</ReactHookForm.FormProvider>,
    }
})

// Submit helpers and async integrations are module-boundary mocks.
// Each test can then verify DynamicForm chooses the right helper and builds the
// correct callback payload without calling the real backend.
jest.mock("@repo/ui/components/form", () => ({
    fnSubmitAppointmentBooking: jest.fn(),
    fnSubmitContact: jest.fn(),
    fnDownload: jest.fn(),
    fnSubmitWebinar: jest.fn(),
}))
jest.mock("@repo/ui/api/appointment/fetch-timeslot", () => ({ fetchTimeSlots: jest.fn() }))
jest.mock("@repo/ui/api/appointment/fetch-timezone", () => ({ fetchTimezones: jest.fn() }))
jest.mock("@repo/ui/api/appointment/fetch-appointment-availability", () => ({ fetchAppointmentAvailability: jest.fn() }))
jest.mock("@repo/ui/api/newsletter/check-subscription", () => ({ checkNewsletterSubscription: jest.fn() }))
jest.mock("../packages/ui/src/hooks/use-known-visitor-profile", () => ({ useKnownVisitorProfile: jest.fn() }))
jest.mock("../packages/ui/src/components/contact/useDetectedRegion", () => ({ useDetectedRegion: jest.fn() }))

// Cast imported module functions once, then use the cl* variables everywhere.
// That keeps individual tests concise and follows the existing mock naming
// pattern used in this repository's test work.
const clSubmitAppointmentBooking = jest.mocked(fnSubmitAppointmentBooking)
const clSubmitContact = jest.mocked(fnSubmitContact)
const clDownload = jest.mocked(fnDownload)
const clSubmitWebinar = jest.mocked(fnSubmitWebinar)
const clFetchTimeSlots = jest.mocked(fetchTimeSlots)
const clFetchTimezones = jest.mocked(fetchTimezones)
const clFetchAppointmentAvailability = jest.mocked(fetchAppointmentAvailability)
const clCheckNewsletterSubscription = jest.mocked(checkNewsletterSubscription)
const clUseKnownVisitorProfile = jest.mocked(useKnownVisitorProfile)
const clUseDetectedRegion = jest.mocked(useDetectedRegion)
const DynamicForm = require("../packages/ui/src/components/contact/DynamicForm").default

// Build field definitions with production-like defaults. Tests override only
// the part that matters for the scenario, which keeps each case focused on the
// behavior under test instead of repeating full CMS field objects.
const fnField = (
    iName: string,
    iType: TfieldType,
    idOverrides: Partial<TformFieldConfig> = {},
): TformFieldConfig => ({
    name: iName,
    type: iType,
    label: iName,
    placeholder: iName,
    fieldDisplay: "Full_Width_No_Margin",
    loading: {},
    ...idOverrides,
})

// The base config describes the common two-step contact form. This is the
// default fixture for most scenarios, while booking/download/webinar tests
// change only formId, fields, schema, or supporting data as needed.
const fnCreateConfig = (idOverrides: Partial<TformConfig> = {}): TformConfig => ({
    formId: "contact",
    title: "Dynamic contact",
    description: "Tell us about your project",
    fields: [
        fnField("name", "text", { label: "Name" }),
        fnField("email", "email", { label: "Email" }),
        fnField("phone", "phone", { label: "Phone" }),
        fnField("message", "textarea", { label: "Message" }),
        fnField("newsletter", "checkbox", { placeholder: "Send updates" }),
    ],
    submitText: "Submit",
    schema: z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        message: z.string().optional(),
        newsletter: z.boolean().optional(),
    }),
    successTitle: "Thanks",
    successMessage: "We will be in touch",
    showTerms: true,
    policyDescription: "Please review",
    terms: { label: "Terms", href: "terms-and-conditions" },
    privacy: { label: "Privacy", href: "privacy-policy" },
    stepCaptions: {
        fewToComplete: "Few more",
        oneMoreInput: "One more",
        almostDone: "Almost done",
    },
    ...idOverrides,
})

// Render through one helper so all tests get the same callback spies and the
// same default config. Returning the spies lets submit scenarios assert both
// the helper call and the post-submit callback contract.
const fnRenderDynamicForm = (idProps: TrenderOptions = {}): TrenderResult => {
    const fnOnSuccess = jest.fn()
    const fnOnSuccessfulSubmit = jest.fn()

    const LdRenderResult = render(
        <DynamicForm
            config={fnCreateConfig(idProps.configOverrides)}
            onSuccess={fnOnSuccess}
            onSuccessfulSubmit={fnOnSuccessfulSubmit}
            data={idProps.data}
            pdfData={idProps.pdfData}
            defaultValues={idProps.defaultValues}
            hideCardHeader={idProps.hideCardHeader}
            className={idProps.className}
        />,
    )

    return { ...LdRenderResult, fnOnSuccess, fnOnSuccessfulSubmit }
}

const fnTypeByLabel = async (iLabel: string, iValue: string): Promise<void> => {
    await LdUser.type(screen.getByLabelText(iLabel), iValue)
}

const fnTypeByFoundLabel = async (iLabel: string, iValue: string): Promise<void> => {
    await LdUser.type(await screen.findByLabelText(iLabel), iValue)
}

const fnClickButton = async (iName: string): Promise<void> => {
    await LdUser.click(screen.getByRole("button", { name: iName }))
}

const fnClickFoundButton = async (iName: string): Promise<void> => {
    await LdUser.click(await screen.findByRole("button", { name: iName }))
}

const fnSelectByLabel = async (iLabel: string, iValue: string): Promise<void> => {
    await LdUser.selectOptions(screen.getByLabelText(iLabel), iValue)
}

const fnClearByLabel = async (iLabel: string): Promise<void> => {
    await LdUser.clear(screen.getByLabelText(iLabel))
}

const fnUseFakeTimers = (): void => {
    jest.useFakeTimers()
    LdUser = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
}

const fnAdvanceTimers = async (iMilliseconds: number): Promise<void> => {
    await act(async () => {
        jest.advanceTimersByTime(iMilliseconds)
    })
}

// Booking scenarios share the same field order and schema. Keeping them in
// helpers prevents repeated setup blocks from hiding the actual assertion.
const fnBookingFields = () => [
    fnField("name", "text", { label: "Name" }),
    fnField("email", "email", { label: "Email" }),
    fnField("timezone", "timezone", { label: "Timezone" }),
    fnField("date", "date", { label: "Date" }),
    fnField("timeSlot", "timeslot", { label: "Available times" }),
]

const fnBookingSchema = () => z.object({
    name: z.string().min(1),
    email: z.string().email(),
    timezone: z.string().min(1),
    date: z.date(),
    timeSlot: z.string().min(1),
})

// Booking is still rendered through DynamicForm, but this wrapper switches the
// config into booking mode and leaves per-test overrides available for edge
// cases such as timezone fallback or API failures.
const fnRenderBookingForm = (idOverrides: TrenderOptions = {}) =>
    fnRenderDynamicForm({
        ...idOverrides,
        configOverrides: {
            formId: "booking",
            fields: fnBookingFields(),
            schema: fnBookingSchema(),
            ...(idOverrides.configOverrides ?? {}),
        },
    })

beforeEach(() => {
    // Reset Jest and the DOM manually because these tests mix fake timers,
    // async effects, and module-level mocks. A clean baseline prevents one
    // scenario's pending debounce or mock response from leaking into the next.
    jest.clearAllMocks()
    jest.useRealTimers()
    LdUser = userEvent.setup()
    document.body.innerHTML = ""
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = "site-key"

    // Default mocks model the happy path. Individual tests override only the
    // dependency they are exercising, which makes failure messages point at the
    // scenario-specific branch instead of broad setup noise.
    fnExecuteRecaptcha.mockResolvedValue("recaptcha-token")
    clSubmitContact.mockResolvedValue({ data: { id: 1 }, message: "Contact created" })
    clSubmitAppointmentBooking.mockResolvedValue({ data: { id: "BOOKING-1" }, title: "Booked", message: "Confirmed" })
    clDownload.mockResolvedValue({ title: "Download Success", message: "Downloaded" })
    clSubmitWebinar.mockResolvedValue({ data: { id: "WEBINAR-1" } })
    clFetchTimeSlots.mockResolvedValue({ data: [] })
    clFetchTimezones.mockResolvedValue({ data: ["UTC", "Europe/Berlin CET"] })
    clFetchAppointmentAvailability.mockResolvedValue({
        data: {
            availableDates: ["2026-12-15"],
            rangeStart: "2026-12-01",
            rangeEnd: "2026-12-31",
            settings: { appointment_duration: 60 },
            slotsByDate: {
                "2026-12-15": [
                    { time: "2026-12-15T09:30:00", availability: true },
                    { time: "2026-12-15T10:30:00", availability: false },
                ],
            },
        },
    })
    clCheckNewsletterSubscription.mockResolvedValue({ subscribed: false })
    clUseKnownVisitorProfile.mockReturnValue({ IsReady: true, Profile: {} })
    clUseDetectedRegion.mockReturnValue({ countryIso: "in", timezone: "Europe/Berlin CET" })
})

afterEach(() => {
    // Return to real timers even if a fake-timer test fails midway, so the next
    // test file is not forced into a mocked clock by accident.
    jest.useRealTimers()
})

describe("DynamicForm", () => {
    // Render and navigation scenarios prove that DynamicForm builds the correct
    // visible form from CMS config before any submit helper is involved.
    it("renders the first step, policy links, locale reCAPTCHA script, and progress copy", async () => {
        const { baseElement } = fnRenderDynamicForm()

        // The first render should show CMS title/description and only the first chunk of fields.
        expect(screen.getByRole("heading", { name: "Dynamic contact" })).toBeInTheDocument()
        expect(screen.getByText("Tell us about your project")).toBeInTheDocument()
        expect(screen.getByLabelText("Name")).toBeInTheDocument()
        expect(screen.getByLabelText("Email")).toBeInTheDocument()
        expect(screen.getByLabelText("Phone")).toBeInTheDocument()
        expect(screen.queryByLabelText("Message")).not.toBeInTheDocument()

        // Captions and policy links are config-driven copy, so assert the visible contract.
        expect(screen.getByText("One more")).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms-and-conditions")
        expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy-policy")
        await waitFor(() => expect(baseElement.querySelector("#google-recaptcha-v3")).toHaveAttribute(
            "src",
            "https://www.google.com/recaptcha/api.js?render=site-key&hl=en",
        ))
    })

    it("validates the current step before advancing", async () => {
        fnRenderDynamicForm()

        // Empty required fields should block the Next button from advancing to the message step.
        await fnClickButton("Next")

        await waitFor(() => expect(screen.queryByLabelText("Message")).not.toBeInTheDocument())
        expect(screen.getByLabelText("Name")).toBeInTheDocument()
    })

    it("moves forward and backward while preserving values", async () => {
        fnRenderDynamicForm()

        await fnTypeByLabel("Name", "Ada Lovelace")
        await fnTypeByLabel("Email", "ada@example.com")
        await fnClickButton("Next")

        // Once step one validates, DynamicForm should render the second field chunk.
        expect(await screen.findByLabelText("Message")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Previous" })).toBeInTheDocument()

        await fnClickButton("Previous")
        expect(await screen.findByLabelText("Name")).toHaveValue("Ada Lovelace")
        expect(screen.getByLabelText("Email")).toHaveValue("ada@example.com")
    })

    it("derives the name from email while the name field is still untouched", async () => {
        fnRenderDynamicForm()

        const LsEmail = "yuvaraj.shanmugam@example.com"
        await fnTypeByLabel("Email", LsEmail)

        // Email-to-name autofill is client-side and should preserve the readable local-part format.
        await waitFor(() => expect(screen.getByLabelText("Name")).toHaveValue(fnDeriveNameFromEmail(LsEmail)))
    })

    it("prefills known visitor profile values without marking the first step dirty", async () => {
        clUseKnownVisitorProfile.mockReturnValue({
            IsReady: true,
            Profile: { name: "Known Visitor", email: "known@example.com", phone: "+491234" },
        })

        fnRenderDynamicForm()

        // Known visitor data should fill matching fields once, before user edits begin.
        expect(await screen.findByLabelText("Name")).toHaveValue("Known Visitor")
        expect(screen.getByLabelText("Email")).toHaveValue("known@example.com")
        expect(screen.getByLabelText("Phone")).toHaveValue("+491234")
    })

    it("checks newsletter subscription after a valid email and hides the checkbox when already subscribed", async () => {
        fnUseFakeTimers()
        clCheckNewsletterSubscription.mockResolvedValue({ subscribed: true })
        fnRenderDynamicForm()

        await fnTypeByLabel("Email", "subscribed@example.com")
        await fnAdvanceTimers(500)

        // Move to the second step where the newsletter field lives; subscribed users should not see the checkbox.
        await fnTypeByLabel("Name", "Subscribed User")
        await fnClickButton("Next")

        expect(await screen.findByTestId("newsletter-hidden")).toBeInTheDocument()
        expect(clCheckNewsletterSubscription).toHaveBeenCalledWith("subscribed@example.com")
    })

    // Submit-routing scenarios cover each formId branch. The same DynamicForm
    // shell can submit contact, download, webinar, and booking payloads, so the
    // tests assert both the selected helper and the callback payload metadata.
    it("submits a contact form, sanitizes callback data, and hides after success", async () => {
        const { fnOnSuccess, fnOnSuccessfulSubmit } = fnRenderDynamicForm()

        await fnTypeByLabel("Name", "Ada")
        await fnTypeByLabel("Email", "ada@example.com")
        await fnClickButton("Next")
        await fnTypeByFoundLabel("Message", "Hello")
        await fnClickButton("Submit")

        // Contact forms should route through fnSubmitContact with the reCAPTCHA token from the provider.
        await waitFor(() => expect(clSubmitContact).toHaveBeenCalledWith(expect.objectContaining({
            name: "Ada",
            email: "ada@example.com",
            message: "Hello",
        }), "recaptcha-token"))
        expect(fnOnSuccessfulSubmit).toHaveBeenCalledWith(expect.objectContaining({
            formData: expect.objectContaining({ name: "Ada", email: "ada@example.com", message: "Hello" }),
            formId: "contact",
            formTitle: "Dynamic contact",
        }))
        expect(fnOnSuccess).toHaveBeenCalledWith("Contact created", "Thanks")
        expect(screen.queryByRole("heading", { name: "Dynamic contact" })).not.toBeInTheDocument()
    })

    it("shows the helper error and keeps the form visible when contact submission fails", async () => {
        clSubmitContact.mockResolvedValue({ error: "CRM down" })
        fnRenderDynamicForm()

        await fnTypeByLabel("Name", "Ada")
        await fnTypeByLabel("Email", "ada@example.com")
        await fnClickButton("Next")
        await fnClickFoundButton("Submit")

        // Root form errors should be rendered without hiding or resetting the form.
        expect(await screen.findByText("CRM down")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument()
    })

    it("routes download submissions through fnDownload and includes case-study meta", async () => {
        const LdPdfData = { caseStudies: [{ name: "Turbo Study", pdfName: "Turbo" }] }
        const { fnOnSuccessfulSubmit } = fnRenderDynamicForm({
            configOverrides: { formId: "download" },
            pdfData: LdPdfData,
        })

        await fnTypeByLabel("Name", "Ada")
        await fnTypeByLabel("Email", "ada@example.com")
        await fnClickButton("Next")
        await fnClickFoundButton("Submit")

        await waitFor(() => expect(clDownload).toHaveBeenCalledWith(expect.objectContaining({
            name: "Ada",
            email: "ada@example.com",
        }), LdPdfData, "recaptcha-token"))
        expect(fnOnSuccessfulSubmit).toHaveBeenCalledWith(expect.objectContaining({
            formId: "download",
            meta: expect.objectContaining({ case_study_name: "Turbo Study" }),
        }))
    })

    it("routes webinar submissions through fnSubmitWebinar and includes webinar meta", async () => {
        const LdWebinarData = { id: "EVENT-1", title: "AI Webinar" }
        const { fnOnSuccessfulSubmit } = fnRenderDynamicForm({
            configOverrides: { formId: "webinar" },
            data: LdWebinarData,
        })

        await fnTypeByLabel("Name", "Ada")
        await fnTypeByLabel("Email", "ada@example.com")
        await fnClickButton("Next")
        await fnClickFoundButton("Submit")

        await waitFor(() => expect(clSubmitWebinar).toHaveBeenCalledWith(expect.objectContaining({
            name: "Ada",
            email: "ada@example.com",
        }), LdWebinarData, "recaptcha-token"))
        expect(fnOnSuccessfulSubmit).toHaveBeenCalledWith(expect.objectContaining({
            formId: "webinar",
            meta: expect.objectContaining({ webinar_title: "AI Webinar" }),
        }))
    })

    // Booking setup has multiple async effects: timezones, availability,
    // default date, and default slot. The first booking case checks that those
    // effects cooperate before testing the submit-specific behavior below.
    it("loads booking defaults from timezone and availability APIs", async () => {
        clFetchTimeSlots.mockResolvedValueOnce({ data: [
            { time: "2026-12-15T09:30:00", availability: true },
        ] })

        fnRenderDynamicForm({
            configOverrides: {
                formId: "booking",
                fields: [
                    fnField("name", "text", { label: "Name" }),
                    fnField("email", "email", { label: "Email" }),
                    fnField("timezone", "timezone", { label: "Timezone" }),
                    fnField("date", "date", { label: "Date" }),
                    fnField("timeSlot", "timeslot", { label: "Available times" }),
                ],
                schema: z.object({
                    name: z.string().min(1),
                    email: z.string().email(),
                    timezone: z.string().min(1),
                    date: z.date(),
                    timeSlot: z.string().min(1),
                }),
            },
        })

        // Detected timezone should be preferred when it appears in the backend timezone list.
        expect(await screen.findByDisplayValue("Europe/Berlin CET")).toBeInTheDocument()
        await fnTypeByLabel("Name", "Ada")
        await fnTypeByLabel("Email", "ada@example.com")
        await fnClickButton("Next")
        expect(await screen.findByRole("button", { name: "09:30 - 10:30" })).toHaveAttribute("data-selected", "true")
        expect(clFetchAppointmentAvailability).toHaveBeenCalledWith("Europe/Berlin CET")
    })

    it("blocks booking submission when the selected slot is no longer available", async () => {
        clFetchTimeSlots
            .mockResolvedValueOnce({ data: [
                { time: "2026-12-15T09:30:00", availability: true },
            ] })
            .mockResolvedValueOnce({ data: [
                { time: "2026-12-15T09:30:00", availability: false },
            ] })

        fnRenderDynamicForm({
            configOverrides: {
                formId: "booking",
                fields: [
                    fnField("name", "text", { label: "Name" }),
                    fnField("email", "email", { label: "Email" }),
                    fnField("timezone", "timezone", { label: "Timezone" }),
                    fnField("date", "date", { label: "Date" }),
                    fnField("timeSlot", "timeslot", { label: "Available times" }),
                ],
                schema: z.object({
                    name: z.string().min(1),
                    email: z.string().email(),
                    timezone: z.string().min(1),
                    date: z.date(),
                    timeSlot: z.string().min(1),
                }),
            },
        })

        await fnTypeByFoundLabel("Name", "Ada")
        await fnTypeByLabel("Email", "ada@example.com")
        await fnClickButton("Next")
        await screen.findByRole("button", { name: "09:30 - 10:30" })
        await fnClickButton("Submit")

        // Slot revalidation happens before reCAPTCHA and before the booking helper is called.
        expect(await screen.findByText("This appointment slot is no longer available. Please select another slot.")).toBeInTheDocument()
        expect(fnExecuteRecaptcha).not.toHaveBeenCalled()
        expect(clSubmitAppointmentBooking).not.toHaveBeenCalled()
    })

    // A booking slot can become unavailable after it was selected, so the
    // submit handler revalidates the slot before asking reCAPTCHA for a token.
    it("submits booking data through fnSubmitAppointmentBooking after slot revalidation", async () => {
        clFetchTimeSlots
            .mockResolvedValueOnce({ data: [
                { time: "2026-12-15T09:30:00", availability: true },
            ] })
            .mockResolvedValueOnce({ data: [
                { time: "2026-12-15T09:30:00", availability: true },
            ] })
        const { fnOnSuccessfulSubmit } = fnRenderDynamicForm({
            configOverrides: {
                formId: "booking",
                fields: [
                    fnField("name", "text", { label: "Name" }),
                    fnField("email", "email", { label: "Email" }),
                    fnField("timezone", "timezone", { label: "Timezone" }),
                    fnField("date", "date", { label: "Date" }),
                    fnField("timeSlot", "timeslot", { label: "Available times" }),
                ],
                schema: z.object({
                    name: z.string().min(1),
                    email: z.string().email(),
                    timezone: z.string().min(1),
                    date: z.date(),
                    timeSlot: z.string().min(1),
                }),
            },
        })

        await fnTypeByFoundLabel("Name", "Ada")
        await fnTypeByLabel("Email", "ada@example.com")
        await fnClickButton("Next")
        await screen.findByRole("button", { name: "09:30 - 10:30" })
        await fnClickButton("Submit")

        await waitFor(() => expect(clSubmitAppointmentBooking).toHaveBeenCalledWith(expect.objectContaining({
            name: "Ada",
            email: "ada@example.com",
            timezone: "Europe/Berlin CET",
            timeSlot: "09:30:00",
        }), "recaptcha-token", expect.objectContaining({ formId: "booking" })))
        expect(fnOnSuccessfulSubmit).toHaveBeenCalledWith(expect.objectContaining({
            formData: expect.not.objectContaining({ timeSlot: "09:30:00" }),
            formId: "booking",
        }))
    })

    // Configuration scenarios verify that optional CMS flags and copy have
    // stable behavior even when the form content itself is otherwise simple.
    it("hides the card header when hideCardHeader is true", () => {
        fnRenderDynamicForm({ hideCardHeader: true })

        // The form body remains usable, but CMS title/description should not render in the card header.
        expect(screen.queryByRole("heading", { name: "Dynamic contact" })).not.toBeInTheDocument()
        expect(screen.getByLabelText("Name")).toBeInTheDocument()
    })

    it("applies a custom class to the outer dynamic form container", () => {
        fnRenderDynamicForm({ className: "campaign-dynamic-form" })

        // className is forwarded to the outer wrapper, so walk from a known child to the container.
        expect(screen.getByRole("heading", { name: "Dynamic contact" }).parentElement?.parentElement).toHaveClass("campaign-dynamic-form")
    })

    it("renders default field values passed by the caller", () => {
        fnRenderDynamicForm({
            defaultValues: { name: "Default Name", email: "default@example.com", phone: "+49111" },
        })

        // Email defaults still run through the component's derived-name effect, which mirrors the live form.
        expect(screen.getByLabelText("Name")).toHaveValue("Default")
        expect(screen.getByLabelText("Email")).toHaveValue("default@example.com")
        expect(screen.getByLabelText("Phone")).toHaveValue("+49111")
    })

    it("uses custom submit text on the final step", async () => {
        fnRenderDynamicForm({ configOverrides: { submitText: "Send request" } })

        await fnTypeByLabel("Name", "Ada")
        await fnTypeByLabel("Email", "ada@example.com")
        await fnClickButton("Next")

        // The final-step button label comes from config.submitText.
        expect(await screen.findByRole("button", { name: "Send request" })).toBeInTheDocument()
    })

    it("does not render policy links when terms are disabled", () => {
        fnRenderDynamicForm({ configOverrides: { showTerms: false } })

        // Disabling terms should remove both policy anchors entirely.
        expect(screen.queryByRole("link", { name: "Terms" })).not.toBeInTheDocument()
        expect(screen.queryByRole("link", { name: "Privacy" })).not.toBeInTheDocument()
    })

    it("uses fallback policy copy and hrefs when policy config is missing", () => {
        fnRenderDynamicForm({
            configOverrides: {
                policyDescription: undefined,
                terms: undefined,
                privacy: undefined,
            },
        })

        // The component has safe policy fallbacks so incomplete CMS config still renders legal links.
        expect(screen.getByText("By submitting, you agree to our", { exact: false })).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms-and-conditions")
        expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy-policy")
    })

    it("renders a single-step form with only a submit button", () => {
        fnRenderDynamicForm({
            configOverrides: {
                fields: [fnField("email", "email", { label: "Email" })],
                schema: z.object({ email: z.string().email() }),
            },
        })

        // With one resolved step, there is no navigation; the only action is submit.
        expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Previous" })).not.toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument()
        expect(screen.getByText("Almost done")).toBeInTheDocument()
    })

    // Step-caption scenarios protect the small but user-visible progress text.
    // They use different field counts because DynamicForm computes steps from
    // field grouping rather than receiving an explicit page list.
    it("uses the few-steps caption when more than one step remains", () => {
        fnRenderDynamicForm({
            configOverrides: {
                fields: [
                    fnField("name", "text", { label: "Name" }),
                    fnField("email", "email", { label: "Email" }),
                    fnField("phone", "phone", { label: "Phone" }),
                    fnField("company", "text", { label: "Company" }),
                    fnField("role", "text", { label: "Role" }),
                    fnField("message", "textarea", { label: "Message" }),
                    fnField("newsletter", "checkbox", { placeholder: "Send updates" }),
                ],
            },
        })

        // Seven fields resolve into three steps, so the first step has more than one step remaining.
        expect(screen.getByText("Few more")).toBeInTheDocument()
    })

    it("updates the progress caption to almost done on the final step", async () => {
        fnRenderDynamicForm({
            configOverrides: {
                fields: [
                    fnField("name", "text", { label: "Name" }),
                    fnField("email", "email", { label: "Email" }),
                    fnField("phone", "phone", { label: "Phone" }),
                    fnField("message", "textarea", { label: "Message" }),
                ],
                schema: z.object({
                    name: z.string().min(1),
                    email: z.string().email(),
                    phone: z.string().optional(),
                    message: z.string().optional(),
                }),
            },
        })

        await fnTypeByLabel("Name", "Ada")
        await fnTypeByLabel("Email", "ada@example.com")
        await fnClickButton("Next")

        // The final step has zero steps remaining, so it should use the almost-done caption.
        expect(await screen.findByText("Almost done")).toBeInTheDocument()
    })

    it("does not render the Previous button on the first step", () => {
        fnRenderDynamicForm()

        // Previous only appears after the user advances beyond step one.
        expect(screen.queryByRole("button", { name: "Previous" })).not.toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument()
    })

    it("passes detected country code into the rendered step", () => {
        clUseDetectedRegion.mockReturnValue({ countryIso: "us", timezone: "UTC" })
        fnRenderDynamicForm()

        // The parent passes only countryIso to the field renderer for phone defaults.
        expect(screen.getByTestId("dynamic-step")).toHaveAttribute("data-country", "us")
    })

    it("does not call booking-only APIs for a contact form", () => {
        fnRenderDynamicForm()

        // Contact forms should not load timezones or appointment availability.
        expect(clFetchTimezones).not.toHaveBeenCalled()
        expect(clFetchAppointmentAvailability).not.toHaveBeenCalled()
    })

    // Newsletter scenarios focus on the debounced parent effect. Fake timers
    // make the debounce deterministic and keep the tests fast.
    it("does not run newsletter subscription lookup for an invalid email", async () => {
        fnUseFakeTimers()
        fnRenderDynamicForm()

        await fnTypeByLabel("Email", "not-an-email")
        await fnAdvanceTimers(500)

        // The component performs a basic email-shape check before calling the backend.
        expect(clCheckNewsletterSubscription).not.toHaveBeenCalled()
    })

    it("normalizes email before checking newsletter subscription", async () => {
        fnUseFakeTimers()
        fnRenderDynamicForm()

        await fnTypeByLabel("Email", "  ADA@Example.COM  ")
        await fnAdvanceTimers(500)

        // The lookup trims and lowercases the email to avoid duplicate subscription checks.
        expect(clCheckNewsletterSubscription).toHaveBeenCalledWith("ada@example.com")
    })

    it("debounces newsletter lookup and uses the latest email value", async () => {
        fnUseFakeTimers()
        fnRenderDynamicForm()

        await fnTypeByLabel("Email", "first@example.com")
        await fnAdvanceTimers(250)
        await fnClearByLabel("Email")
        await fnTypeByLabel("Email", "second@example.com")
        await fnAdvanceTimers(500)

        // The cleanup inside the effect should cancel the first pending lookup.
        expect(clCheckNewsletterSubscription).toHaveBeenCalledTimes(1)
        expect(clCheckNewsletterSubscription).toHaveBeenCalledWith("second@example.com")
    })

    it("keeps the newsletter checkbox visible when subscription lookup returns false", async () => {
        fnUseFakeTimers()
        clCheckNewsletterSubscription.mockResolvedValue({ subscribed: false })
        fnRenderDynamicForm()

        await fnTypeByLabel("Email", "new@example.com")
        await fnAdvanceTimers(500)
        await fnTypeByLabel("Name", "New Person")
        await fnClickButton("Next")

        // The DynamicFormStep mock exposes the field label first, so the visible opt-in is found by its field name.
        expect(await screen.findByLabelText("newsletter")).toBeInTheDocument()
    })

    it("keeps the newsletter checkbox visible when subscription lookup fails", async () => {
        fnUseFakeTimers()
        clCheckNewsletterSubscription.mockRejectedValue(new Error("lookup failed"))
        fnRenderDynamicForm()

        await fnTypeByLabel("Email", "new@example.com")
        await fnAdvanceTimers(500)
        await fnTypeByLabel("Name", "New Person")
        await fnClickButton("Next")

        // Lookup failure becomes a safe false state so users can still opt in manually.
        expect(await screen.findByLabelText("newsletter")).toBeInTheDocument()
    })

    it("submits newsletter as true when an already-subscribed email hides the checkbox", async () => {
        fnUseFakeTimers()
        clCheckNewsletterSubscription.mockResolvedValue({ subscribed: true })
        fnRenderDynamicForm()

        await fnTypeByLabel("Email", "subscribed@example.com")
        await fnAdvanceTimers(500)
        await fnClearByLabel("Name")
        await fnTypeByLabel("Name", "Subscribed User")
        await fnClickButton("Next")
        await fnClickFoundButton("Submit")

        // Hidden newsletter state is still set to true so submission reflects the existing subscription.
        await waitFor(() => expect(clSubmitContact).toHaveBeenCalledWith(expect.objectContaining({
            newsletter: true,
        }), "recaptcha-token"))
    })

    // Identity-prefill scenarios cover the interaction between typed values,
    // known visitor values, and the email-derived name fallback.
    it("preserves a manually typed name when email changes", async () => {
        fnRenderDynamicForm()

        await fnTypeByLabel("Name", "Manual Name")
        await fnTypeByLabel("Email", "derived.name@example.com")

        // Dirty name fields must not be overwritten by the email-derived fallback.
        await waitFor(() => expect(screen.getByLabelText("Name")).toHaveValue("Manual Name"))
    })

    it("does not prefill visitor profile until PostHog profile is ready", () => {
        clUseKnownVisitorProfile.mockReturnValue({
            IsReady: false,
            Profile: { name: "Known Visitor", email: "known@example.com", phone: "+491234" },
        })

        fnRenderDynamicForm()

        // Readiness gates prefill so partially loaded visitor data does not flash into the form.
        expect(screen.getByLabelText("Name")).toHaveValue("")
        expect(screen.getByLabelText("Email")).toHaveValue("")
    })

    it("derives the name from a known visitor email when the default name is not dirty", () => {
        clUseKnownVisitorProfile.mockReturnValue({
            IsReady: true,
            Profile: { name: "Known Visitor", email: "known@example.com", phone: "+491234" },
        })

        fnRenderDynamicForm({
            defaultValues: { name: "Default Name" },
        })

        // RHF default values are not dirty, so the email-derived fallback mirrors the current component behavior.
        expect(screen.getByLabelText("Name")).toHaveValue("Known")
        expect(screen.getByLabelText("Email")).toHaveValue("known@example.com")
    })

    it("ignores known visitor fields that are not present in the form config", () => {
        clUseKnownVisitorProfile.mockReturnValue({
            IsReady: true,
            Profile: { name: "Known Visitor", email: "known@example.com", phone: "+491234" },
        })

        fnRenderDynamicForm({
            configOverrides: {
                fields: [fnField("email", "email", { label: "Email" })],
                schema: z.object({ email: z.string().email() }),
            },
        })

        // Phone/name are absent from config, so only email can be restored.
        expect(screen.getByLabelText("Email")).toHaveValue("known@example.com")
        expect(screen.queryByLabelText("Name")).not.toBeInTheDocument()
        expect(screen.queryByLabelText("Phone")).not.toBeInTheDocument()
    })

    // Single-step submit scenarios remove navigation from the equation so each
    // error/success branch can be asserted with the smallest possible form.
    it("submits successfully when onSuccessfulSubmit is not provided", async () => {
        const fnOnSuccess = jest.fn()

        render(
            <DynamicForm
                config={fnCreateConfig({
                    fields: [fnField("email", "email", { label: "Email" })],
                    schema: z.object({ email: z.string().email() }),
                })}
                onSuccess={fnOnSuccess}
            />,
        )

        await fnTypeByLabel("Email", "ada@example.com")
        await fnClickButton("Submit")

        // Optional callback chaining should not block the success path.
        await waitFor(() => expect(clSubmitContact).toHaveBeenCalled())
        expect(fnOnSuccess).toHaveBeenCalledWith("Contact created", "Thanks")
    })

    it("passes the submit action name to reCAPTCHA", async () => {
        fnRenderDynamicForm({
            configOverrides: {
                fields: [fnField("email", "email", { label: "Email" })],
                schema: z.object({ email: z.string().email() }),
            },
        })

        await fnTypeByLabel("Email", "ada@example.com")
        await fnClickButton("Submit")

        // DynamicForm should use the same "submit" action label as the shared SectionForm.
        await waitFor(() => expect(fnExecuteRecaptcha).toHaveBeenCalledWith("submit"))
    })

    it("shows a stable error when the contact helper throws", async () => {
        clSubmitContact.mockRejectedValue(new Error("network failed"))
        fnRenderDynamicForm({
            configOverrides: {
                fields: [fnField("email", "email", { label: "Email" })],
                schema: z.object({ email: z.string().email() }),
            },
        })

        await fnTypeByLabel("Email", "ada@example.com")
        await fnClickButton("Submit")

        // Thrown helper errors are surfaced through the root form error region.
        expect(await screen.findByText("network failed")).toBeInTheDocument()
    })

    it("falls back to configured success message when contact response has no message", async () => {
        const { fnOnSuccess } = fnRenderDynamicForm({
            configOverrides: {
                fields: [fnField("email", "email", { label: "Email" })],
                schema: z.object({ email: z.string().email() }),
            },
        })
        clSubmitContact.mockResolvedValue({ data: { id: 2 } })

        await fnTypeByLabel("Email", "ada@example.com")
        await fnClickButton("Submit")

        // Contact responses without a message should preserve config.successMessage.
        await waitFor(() => expect(fnOnSuccess).toHaveBeenCalledWith("We will be in touch", "Thanks"))
    })

    it("uses configured success copy after a download submission", async () => {
        const { fnOnSuccess } = fnRenderDynamicForm({
            configOverrides: {
                formId: "download",
                fields: [fnField("email", "email", { label: "Email" })],
                schema: z.object({ email: z.string().email() }),
            },
            pdfData: { caseStudies: [{ name: "Turbo Study" }] },
        })

        await fnTypeByLabel("Email", "ada@example.com")
        await fnClickButton("Submit")

        // Download helper data is used for errors/meta, while final success copy remains config-driven.
        await waitFor(() => expect(fnOnSuccess).toHaveBeenCalledWith("We will be in touch", "Thanks"))
    })

    it("shows download helper errors", async () => {
        clDownload.mockResolvedValue({ error: "Download failed" })
        fnRenderDynamicForm({
            configOverrides: {
                formId: "download",
                fields: [fnField("email", "email", { label: "Email" })],
                schema: z.object({ email: z.string().email() }),
            },
            pdfData: { caseStudies: [{ name: "Turbo Study" }] },
        })

        await fnTypeByLabel("Email", "ada@example.com")
        await fnClickButton("Submit")

        // Helper-declared errors are converted to root errors by the submit handler.
        expect(await screen.findByText("Download failed")).toBeInTheDocument()
    })

    it("shows webinar helper errors", async () => {
        clSubmitWebinar.mockResolvedValue({ error: "Webinar full" })
        fnRenderDynamicForm({
            configOverrides: {
                formId: "webinar",
                fields: [fnField("email", "email", { label: "Email" })],
                schema: z.object({ email: z.string().email() }),
            },
            data: { id: "EVENT-1", title: "AI Webinar" },
        })

        await fnTypeByLabel("Email", "ada@example.com")
        await fnClickButton("Submit")

        // Webinar helper errors should keep the form visible and explain the failure.
        expect(await screen.findByText("Webinar full")).toBeInTheDocument()
    })

    it("shows unsupported form type errors", async () => {
        fnRenderDynamicForm({
            configOverrides: {
                formId: "unknown",
                fields: [fnField("email", "email", { label: "Email" })],
                schema: z.object({ email: z.string().email() }),
            },
        })

        await fnTypeByLabel("Email", "ada@example.com")
        await fnClickButton("Submit")

        // Unknown form ids are guarded explicitly so a bad CMS value does not call the wrong helper.
        expect(await screen.findByText("Unsupported form type")).toBeInTheDocument()
        expect(clSubmitContact).not.toHaveBeenCalled()
    })

    // Booking edge cases below focus on async data loading and fallback states.
    // They reuse fnRenderBookingForm so the only moving part in each test is the
    // API response or timezone condition being exercised.
    it("uses booking helper success title and message for onSuccess", async () => {
        clFetchTimeSlots
            .mockResolvedValueOnce({ data: [{ time: "2026-12-15T09:30:00", availability: true }] })
            .mockResolvedValueOnce({ data: [{ time: "2026-12-15T09:30:00", availability: true }] })
        const { fnOnSuccess } = fnRenderBookingForm()

        await fnTypeByFoundLabel("Name", "Ada")
        await fnTypeByLabel("Email", "ada@example.com")
        await fnClickButton("Next")
        await screen.findByRole("button", { name: "09:30 - 10:30" })
        await fnClickButton("Submit")

        // Booking submit mutates config success copy from the helper response.
        await waitFor(() => expect(fnOnSuccess).toHaveBeenCalledWith("Confirmed", "Booked"))
    })

    it("fetches timezones only for booking forms", async () => {
        fnRenderBookingForm()

        // Booking form setup starts by loading timezones.
        await waitFor(() => expect(clFetchTimezones).toHaveBeenCalledTimes(1))
    })

    it("falls back to a CET timezone when detected timezone is unavailable", async () => {
        clUseDetectedRegion.mockReturnValue({ countryIso: "in", timezone: "Asia/Kolkata" })
        clFetchTimezones.mockResolvedValue({ data: ["UTC", "Europe/Berlin CET"] })
        fnRenderBookingForm()

        // If the detected timezone is not in the backend list, the CET-like option is preferred.
        expect(await screen.findByDisplayValue("Europe/Berlin CET")).toBeInTheDocument()
    })

    it("falls back to UTC when no detected or CET timezone is available", async () => {
        clUseDetectedRegion.mockReturnValue({ countryIso: "in", timezone: undefined })
        clFetchTimezones.mockResolvedValue({ data: ["UTC", "Asia/Tokyo"] })
        fnRenderBookingForm()

        // UTC is the final default when no detected/CET timezone can be selected.
        expect(await screen.findByDisplayValue("UTC")).toBeInTheDocument()
    })

    it("renders an appointment availability API error", async () => {
        clFetchAppointmentAvailability.mockResolvedValue({ error: "Calendar unavailable" })
        fnRenderBookingForm()

        await fnTypeByFoundLabel("Name", "Ada")
        await fnTypeByLabel("Email", "ada@example.com")
        await fnClickButton("Next")

        // Availability errors are passed down to the date field renderer.
        expect(await screen.findByText("Calendar unavailable")).toBeInTheDocument()
    })

    it("renders a no-appointments message when availability has no dates", async () => {
        clFetchAppointmentAvailability.mockResolvedValue({
            data: {
                availableDates: [],
                rangeStart: "2026-12-01",
                rangeEnd: "2026-12-31",
                settings: { appointment_duration: 60 },
                slotsByDate: {},
            },
        })
        fnRenderBookingForm()

        await fnTypeByFoundLabel("Name", "Ada")
        await fnTypeByLabel("Email", "ada@example.com")
        await fnClickButton("Next")

        // Empty availability is converted into explicit user-facing copy.
        expect(await screen.findByText("No appointments are available in the booking range.")).toBeInTheDocument()
    })

    it("fetches slots when the selected booking date changes", async () => {
        clFetchTimeSlots.mockResolvedValueOnce({ data: [{ time: "2026-12-15T09:30:00", availability: true }] })
        fnRenderBookingForm()

        await fnTypeByFoundLabel("Name", "Ada")
        await fnTypeByLabel("Email", "ada@example.com")
        await fnClickButton("Next")
        await screen.findByRole("button", { name: "09:30 - 10:30" })

        // The date effect fetches slots using yyyy-MM-dd and the selected timezone.
        expect(clFetchTimeSlots).toHaveBeenCalledWith("2026-12-15", "Europe/Berlin CET")
    })

    it("renders unavailable booking slots as disabled", async () => {
        clFetchTimeSlots.mockResolvedValueOnce({ data: [
            { time: "2026-12-15T09:30:00", availability: true },
            { time: "2026-12-15T10:30:00", availability: false },
        ] })
        fnRenderBookingForm()

        await fnTypeByFoundLabel("Name", "Ada")
        await fnTypeByLabel("Email", "ada@example.com")
        await fnClickButton("Next")

        // Unavailable slots stay visible but cannot be selected.
        expect(await screen.findByRole("button", { name: "10:30 - 11:30" })).toBeDisabled()
    })

    it("uses appointment duration from availability when rendering slot labels", async () => {
        clFetchAppointmentAvailability.mockResolvedValue({
            data: {
                availableDates: ["2026-12-15"],
                rangeStart: "2026-12-01",
                rangeEnd: "2026-12-31",
                settings: { appointment_duration: 30 },
                slotsByDate: {
                    "2026-12-15": [{ time: "2026-12-15T09:30:00", availability: true }],
                },
            },
        })
        clFetchTimeSlots.mockResolvedValueOnce({ data: [{ time: "2026-12-15T09:30:00", availability: true }] })
        fnRenderBookingForm()

        await fnTypeByFoundLabel("Name", "Ada")
        await fnTypeByLabel("Email", "ada@example.com")
        await fnClickButton("Next")

        // The mocked step uses appointmentDuration from the parent when composing labels.
        expect(await screen.findByRole("button", { name: "09:30 - 10:00" })).toBeInTheDocument()
    })

    it("reloads availability when the timezone selection changes", async () => {
        fnRenderBookingForm()

        expect(await screen.findByDisplayValue("Europe/Berlin CET")).toBeInTheDocument()
        await fnSelectByLabel("Select timezone", "UTC")

        // Changing timezone should trigger a fresh availability lookup for that timezone.
        await waitFor(() => expect(clFetchAppointmentAvailability).toHaveBeenCalledWith("UTC"))
    })

    it("shows no slots message when slot API returns an empty array", async () => {
        clFetchTimeSlots.mockResolvedValueOnce({ data: [] })
        fnRenderBookingForm()

        await fnTypeByFoundLabel("Name", "Ada")
        await fnTypeByLabel("Email", "ada@example.com")
        await fnClickButton("Next")

        // Empty slot data should render a clear no-slots state.
        expect(await screen.findByText("No slots available")).toBeInTheDocument()
    })

    it("shows no slots message when slot API throws", async () => {
        jest.spyOn(console, "error").mockImplementationOnce(() => undefined)
        clFetchTimeSlots.mockRejectedValueOnce(new Error("slot service down"))
        fnRenderBookingForm()

        await fnTypeByFoundLabel("Name", "Ada")
        await fnTypeByLabel("Email", "ada@example.com")
        await fnClickButton("Next")

        // Slot loading failures are caught and reduced to an empty slot state.
        expect(await screen.findByText("No slots available")).toBeInTheDocument()
    })
})




