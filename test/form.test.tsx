// @ts-nocheck
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import { z } from "zod"

import {
    SectionForm,
    fnDownload,
    fnSubmitAppointmentBooking,
    fnSubmitContact,
    fnSubmitWebinar,
} from "../packages/ui/src/components/form"

import { ContactApi } from "@repo/ui/api/contact/create-contact"
import { fnLeadCreation } from "@repo/ui/api/casestudy/create-lead"
import { bookAppointmentAction } from "@repo/ui/api/appointment/book-appointment"
import { fetchTimezones } from "@repo/ui/api/appointment/fetch-timezone"
import { fetchTimeSlots } from "@repo/ui/api/appointment/fetch-timeslot"
import { subscribeNewsletter } from "@repo/ui/api/newsletter/create-subscription"
import { linkFrappeRecordByEmailToPostHog } from "@repo/ui/api/crm/posthog-link"
import { sendCommunicationAction } from "@repo/ui/api/contact/fetch-contact"
import { UpdateEventParticipant } from "@repo/ui/api/event/create-participant"

// This suite lives at the repo root because the app imports packages through @repo/* aliases.
// The tests cover two layers from the same source file:
// 1. Exported async helper functions, where we assert API payloads and returned user-facing data.
// 2. SectionForm rendering behavior, where we assert what a visitor can see or interact with.
// Keeping both layers here makes regressions in form.tsx visible without changing production code.
const fnExecuteRecaptcha = jest.fn()

// lucide-react only supplies icons in this component.
// A tiny SVG is enough because the tests do not care about the icon artwork; they only need React to render it.
jest.mock("lucide-react", () => ({ CalendarIcon: () => <svg aria-hidden="true" /> }))

// next/link normally depends on the Next.js runtime.
// In jsdom, a plain anchor gives us the important behavior: the href is present and accessible.
jest.mock("next/link", () => ({
    __esModule: true,
    default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

// The component calls executeRecaptcha during submit.
// Keeping the mock function outside the jest.mock factory lets tests assert the exact action name used.
jest.mock("next-recaptcha-v3", () => ({
    ReCaptchaProvider: ({ children }: any) => <>{children}</>,
    useReCaptcha: () => ({ executeRecaptcha: fnExecuteRecaptcha }),
}))

// The real phone package has its own formatting and country dropdown behavior.
// These tests only need to prove SectionForm wires value/onChange/onBlur correctly, so a simple input is clearer.
jest.mock("react-international-phone", () => ({
    PhoneInput: ({ value, onChange, onBlur }: any) => (
        <input aria-label="phone" value={value} onChange={(event) => onChange(event.target.value)} onBlur={onBlur} />
    ),
}))

// The design-system components are mocked as semantic HTML controls.
// That gives the tests stable roles, labels, disabled states, and values while avoiding style-only implementation details.
jest.mock("@repo/ui/components/ui/button", () => ({
    // forwardRef is preserved because the production components pass refs through react-hook-form.
    Button: jest.requireActual("react").forwardRef(({ children, asChild, ...props }: any, ref: any) =>
        <button ref={ref} {...props}>{children}</button>),
}))
jest.mock("@repo/ui/components/ui/floating-label-input", () => ({
    // The label becomes aria-label so tests can query the field the same way a screen reader would.
    FloatingLabelInput: jest.requireActual("react").forwardRef(({ label, inputClassName, error, ...props }: any, ref: any) => (
        <input ref={ref} aria-label={label} {...props} />
    )),
}))
jest.mock("@repo/ui/components/ui/textarea", () => ({
    // Textarea is reduced to native HTML but still accepts the same props and ref shape.
    Textarea: jest.requireActual("react").forwardRef((props: any, ref: any) => <textarea ref={ref} {...props} />),
}))
jest.mock("@repo/ui/components/ui/checkbox", () => ({
    // The design-system checkbox reports boolean state through onCheckedChange, so the mock keeps that contract.
    Checkbox: jest.requireActual("react").forwardRef(({ checked, onCheckedChange, ...props }: any, ref: any) => (
        <input ref={ref} type="checkbox" checked={checked} onChange={(event) => onCheckedChange(event.target.checked)} {...props} />
    )),
}))
jest.mock("@repo/ui/components/ui/form", () => {
    const ReactHookForm = jest.requireActual("react-hook-form")
    return {
        // Keep the real FormProvider/Controller behavior because SectionForm logic depends on react-hook-form state.
        Form: ({ children, ...methods }: any) => <ReactHookForm.FormProvider {...methods}>{children}</ReactHookForm.FormProvider>,
        FormField: (props: any) => <ReactHookForm.Controller {...props} />,
        // Layout-only wrappers are simple div/fragments because their styling is irrelevant to these behavior tests.
        FormItem: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        FormControl: ({ children }: any) => <>{children}</>,
        FormLabel: ({ children, ...props }: any) => <label {...props}>{children}</label>,
        FormMessage: () => null,
    }
})
jest.mock("@repo/ui/components/ui/select", () => ({
    ...(() => {
        const React = jest.requireActual("react")
        // The real Select passes behavior through context.
        // This helper copies the needed select props into descendants so the mock can still respond to clicks.
        const fnInjectSelectProps = (children: any, selectProps: any): any => React.Children.map(children, (child: any) => {
            if (!React.isValidElement(child)) return child
            return React.cloneElement(child, { selectProps }, fnInjectSelectProps(child.props.children, selectProps))
        })
        return {
            // Keep onValueChange and disabled together because timezone tests assert both available and loading states.
            Select: ({ children, onValueChange, disabled }: any) => <div>{fnInjectSelectProps(children, { onValueChange, disabled })}</div>,
            SelectContent: ({ children }: any) => <div>{children}</div>,
            SelectItem: ({ children, value, selectProps }: any) => (
                <button type="button" disabled={selectProps?.disabled} onClick={() => selectProps?.onValueChange(value)}>{children}</button>
            ),
            SelectTrigger: ({ children, selectProps, ...props }: any) => (
                <button type="button" disabled={selectProps?.disabled} {...props}>{children}</button>
            ),
            SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
        }
    })(),
}))
jest.mock("@repo/ui/components/ui/popover", () => ({
    // Popover positioning/portal behavior is not needed; rendering children inline keeps date controls queryable.
    Popover: ({ children }: any) => <div>{children}</div>,
    PopoverContent: ({ children }: any) => <div>{children}</div>,
    PopoverTrigger: ({ children }: any) => <>{children}</>,
}))
jest.mock("@repo/ui/components/ui/calendar", () => ({
    // The calendar always selects 15 Dec 2026.
    // That makes the formatted date and generated time-slot labels deterministic across machines/timezones.
    Calendar: ({ onSelect }: any) => <button type="button" onClick={() => onSelect(new Date(2026, 11, 15))}>Choose date</button>,
}))

// Server actions and API clients are mocked at module boundaries.
// The helper tests can then prove two things without network calls:
// 1. The exact payload sent to each integration.
// 2. The exact value returned to the UI for success and failure paths.
jest.mock("@repo/ui/api/contact/create-contact", () => ({ ContactApi: jest.fn() }))
jest.mock("@repo/ui/api/casestudy/create-lead", () => ({ fnLeadCreation: jest.fn() }))
jest.mock("@repo/ui/api/appointment/book-appointment", () => ({ bookAppointmentAction: jest.fn() }))
jest.mock("@repo/ui/api/appointment/fetch-timezone", () => ({ fetchTimezones: jest.fn() }))
jest.mock("@repo/ui/api/appointment/fetch-timeslot", () => ({ fetchTimeSlots: jest.fn() }))
jest.mock("@repo/ui/api/newsletter/create-subscription", () => ({ subscribeNewsletter: jest.fn() }))
jest.mock("@repo/ui/api/crm/posthog-link", () => ({ linkFrappeRecordByEmailToPostHog: jest.fn() }))
jest.mock("@repo/ui/api/contact/fetch-contact", () => ({ sendCommunicationAction: jest.fn() }))
jest.mock("@repo/ui/api/event/create-participant", () => ({ UpdateEventParticipant: jest.fn() }))

// cl* names are the mocked collaborators used by the helpers under test.
// jest.mocked keeps TypeScript/Jest helper methods such as mockResolvedValue available at each call site.
const clContactApi = jest.mocked(ContactApi)
const clLeadCreation = jest.mocked(fnLeadCreation)
const clBookAppointment = jest.mocked(bookAppointmentAction)
const clFetchTimezones = jest.mocked(fetchTimezones)
const clFetchTimeSlots = jest.mocked(fetchTimeSlots)
const clSubscribeNewsletter = jest.mocked(subscribeNewsletter)
const clLinkPostHog = jest.mocked(linkFrappeRecordByEmailToPostHog)
const clSendCommunication = jest.mocked(sendCommunicationAction)
const clUpdateParticipant = jest.mocked(UpdateEventParticipant)

// Base form config mirrors the smallest real contact form.
// Every test starts from the same valid CMS-like shape, then overrides only the field, schema, or copy it needs.
// This keeps failures easier to read because a test-specific override is usually the reason behavior changes.
const fnCreateConfig = (overrides: Record<string, unknown> = {}) => ({
    formId: "contact",
    title: "Contact us",
    description: "Tell us what you need",
    fields: [
        { name: "email", label: "Email", type: "email", fieldDisplay: "Full_Width_No_Margin", loading: {} },
        { name: "message", placeholder: "Message", type: "textarea", fieldDisplay: "Full_Width_No_Margin", loading: {} },
    ],
    submitText: "Send",
    schema: z.object({ email: z.string().email(), message: z.string().optional() }),
    successTitle: "Thank you",
    successMessage: "Sent successfully",
    ...overrides,
})

beforeEach(() => {
    // Clear call history and restore successful defaults so one failure scenario cannot leak into the next test.
    // This matters because many tests intentionally use mockRejectedValue for one API client.
    // resetAllMocks would remove implementations from the component mocks too, so the suite keeps clearAllMocks
    // and explicitly re-applies safe defaults for only the API collaborators.
    jest.clearAllMocks()
    // Lead creation is a prerequisite for downloads; by default it succeeds silently.
    clLeadCreation.mockResolvedValue(undefined as any)
    // Empty timezone/slot arrays are neutral defaults for SectionForm renders that do not test scheduling.
    clFetchTimezones.mockResolvedValue({ data: [] } as any)
    clFetchTimeSlots.mockResolvedValue({ data: [] } as any)
    // Newsletter and PostHog are optional side effects, so their default success keeps tests focused.
    clSubscribeNewsletter.mockResolvedValue(undefined as any)
    clLinkPostHog.mockResolvedValue(undefined as any)
    // The form submit path requires a token; individual tests only assert the action name and payload flow.
    fnExecuteRecaptcha.mockResolvedValue("recaptcha-token")
    // SectionForm reads this env var to build the Google reCAPTCHA script URL.
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = "site-key"
})

describe("fnSubmitAppointmentBooking", () => {
    // Appointment bookings can show copy from Strapi or fall back to built-in defaults.
    // This config deliberately has custom verified/unverified copy so tests can tell which branch was selected.
    const LdConfig = fnCreateConfig({
        formId: "booking",
        unVerifiedMessage: { label: "Verify booking", description: "Check your inbox" },
        verifiedMessage: { label: "Booked", description: "See you soon" },
    })

    it("formats the request and returns the configured unverified copy", async () => {
        clBookAppointment.mockResolvedValue({ data: { message: { status: "Unverified" } } } as any)

        // Use a Date object here to prove the helper normalizes browser form values before the API call.
        const LdResult = await fnSubmitAppointmentBooking({
            date: new Date(2026, 0, 15), timeSlot: "10:00:00", timezone: "UTC",
            name: "Ada", phone: "+49123", email: "ada@example.com", message: "Hello",
        }, "token", LdConfig as any)

        expect(clBookAppointment).toHaveBeenCalledWith(expect.objectContaining({
            date: "2026-01-15", time: "10:00:00", timezone: "UTC", recaptchaToken: "token",
            contact: { name: "Ada", phone: "+49123", email: "ada@example.com", notes: "Hello" },
        }))
        // Unverified status must pick unVerifiedMessage from the config, not the generic success copy.
        expect(LdResult).toEqual(expect.objectContaining({ title: "Verify booking", message: "Check your inbox" }))
    })

    it("subscribes newsletter opt-ins and returns verified copy", async () => {
        clBookAppointment.mockResolvedValue({ data: { message: { status: "Verified" } } } as any)
        // Newsletter consent is handled separately from the booking payload sent to the appointment API.
        const LdResult = await fnSubmitAppointmentBooking({
            date: "2026-01-15", timeSlot: "11:00:00", timezone: "CET", name: "Ada",
            phone: "", email: "ada@example.com", newsletter: true,
        }, "token", LdConfig as any)

        expect(clSubscribeNewsletter).toHaveBeenCalledWith({ message: "" }, expect.any(FormData))
        // Verified status must use the verified booking copy after the opt-in side effect succeeds.
        expect(LdResult).toEqual(expect.objectContaining({ title: "Booked", message: "See you soon" }))
    })

    it("passes through API errors", async () => {
        clBookAppointment.mockResolvedValue({ error: "Slot unavailable" } as any)
        // API-declared errors are already user-facing and should pass through unchanged.
        await expect(fnSubmitAppointmentBooking({ date: "2026-01-15" }, "token", LdConfig as any))
            .resolves.toEqual({ error: "Slot unavailable" })
    })

    it("uses fallback copy for an unverified booking", async () => {
        clBookAppointment.mockResolvedValue({ data: { message: { status: "Unverified" } } } as any)
        // A plain config has no booking-specific messages, so the default unverified copy should be used.
        const LdResult = await fnSubmitAppointmentBooking({ date: "2026-01-15" }, "token", fnCreateConfig() as any)
        expect(LdResult).toEqual(expect.objectContaining({
            title: "Welcome To Our Family!", message: "Please check your email to confirm the appointment",
        }))
    })

    it("uses fallback copy for a verified booking", async () => {
        clBookAppointment.mockResolvedValue({ data: { message: { status: "Verified" } } } as any)
        // Verified bookings use the alternate default copy when Strapi config does not provide one.
        const LdResult = await fnSubmitAppointmentBooking({ date: "2026-01-15" }, "token", fnCreateConfig() as any)
        expect(LdResult).toEqual(expect.objectContaining({ title: "Thank You!", message: "Booking confirmed successfully" }))
    })

    it("does not subscribe when newsletter consent is absent", async () => {
        clBookAppointment.mockResolvedValue({ data: {} } as any)
        // Consent must be explicit; a submitted email alone should not trigger newsletter subscription.
        await fnSubmitAppointmentBooking({ date: "2026-01-15", email: "ada@example.com" }, "token", LdConfig as any)
        expect(clSubscribeNewsletter).not.toHaveBeenCalled()
    })

    it("returns a stable booking error when the API throws", async () => {
        jest.spyOn(console, "error").mockImplementationOnce(() => undefined)
        clBookAppointment.mockRejectedValue(new Error("offline"))
        // The user-facing error should not expose the raw integration failure.
        await expect(fnSubmitAppointmentBooking({ date: "2026-01-15" }, "token", LdConfig as any))
            .resolves.toEqual({ error: "Something went wrong while booking" })
    })

    it("adds the submitted email to the booking newsletter payload", async () => {
        clBookAppointment.mockResolvedValue({ data: { id: "BOOKING-1" } } as any)

        await fnSubmitAppointmentBooking({
            date: "2026-01-15", email: "ada@example.com", newsletter: true,
        }, "token", LdConfig as any)

        // Reading FormData directly proves the email survives the conversion to a server-action payload.
        const LdFormData = clSubscribeNewsletter.mock.calls[0][1] as FormData
        expect(LdFormData.get("email")).toBe("ada@example.com")
    })

    it("subscribes newsletter consent before returning a booking API error", async () => {
        clBookAppointment.mockResolvedValue({ error: "Already booked" } as any)

        // Current behavior subscribes opt-ins once the booking API responds, even when that response is an error.
        await expect(fnSubmitAppointmentBooking({
            date: "2026-01-15", email: "ada@example.com", newsletter: true,
        }, "token", LdConfig as any)).resolves.toEqual({ error: "Already booked" })

        // This assertion documents the current order: book first, newsletter second, error check third.
        expect(clSubscribeNewsletter).toHaveBeenCalledWith({ message: "" }, expect.any(FormData))
    })

    it("returns a stable booking error when newsletter subscription fails", async () => {
        jest.spyOn(console, "error").mockImplementationOnce(() => undefined)
        clBookAppointment.mockResolvedValue({ data: { id: "BOOKING-1" } } as any)
        clSubscribeNewsletter.mockRejectedValue(new Error("newsletter down"))

        // Newsletter failures are caught by the same outer guard as booking failures.
        await expect(fnSubmitAppointmentBooking({
            date: "2026-01-15", email: "ada@example.com", newsletter: true,
        }, "token", LdConfig as any)).resolves.toEqual({ error: "Something went wrong while booking" })
    })

    it("treats unknown booking statuses as verified-copy responses", async () => {
        clBookAppointment.mockResolvedValue({ data: { message: { status: "Pending" } } } as any)

        // The implementation only special-cases "Unverified"; every other status follows verified copy.
        const LdResult = await fnSubmitAppointmentBooking({ date: "2026-01-15" }, "token", LdConfig as any)

        expect(LdResult).toEqual(expect.objectContaining({ title: "Booked", message: "See you soon" }))
    })

    it("formats string-like booking dates before sending the API request", async () => {
        clBookAppointment.mockResolvedValue({ data: {} } as any)

        // String dates can come from serialized form state, so the API should still receive yyyy-MM-dd.
        await fnSubmitAppointmentBooking({ date: "2026-03-04T12:30:00Z" }, "token", LdConfig as any)

        // The API contract expects a date-only string, not a Date object or full ISO timestamp.
        expect(clBookAppointment).toHaveBeenCalledWith(expect.objectContaining({ date: "2026-03-04" }))
    })
})

describe("fnSubmitContact", () => {
    it("uses defaults, links PostHog, and returns a successful response", async () => {
        clSendCommunication.mockResolvedValue({ data: { id: 7 }, message: "created" } as any)

        // Missing optional fields should still produce the API defaults used by the live contact form.
        const LdResult = await fnSubmitContact({ email: "ada@example.com" }, "token")

        // message defaults to an empty note and enquiryType defaults to "Free Trial" for normal contact forms.
        expect(clSendCommunication).toHaveBeenCalledWith({
            email: "ada@example.com", notes: "", option: "Free Trial", recaptchaToken: "token",
        })
        // PostHog linking is a follow-up side effect that should happen only after sendCommunication succeeds.
        expect(clLinkPostHog).toHaveBeenCalledWith("ada@example.com")
        // The helper returns the backend data/message without rewriting successful responses.
        expect(LdResult).toEqual({ data: { id: 7 }, message: "created" })
    })

    it("does not link PostHog when the API returns an error", async () => {
        clSendCommunication.mockResolvedValue({ error: "Rejected" } as any)
        // Analytics linking must only happen after the CRM communication succeeds.
        await expect(fnSubmitContact({ email: "ada@example.com" }, "token")).resolves.toEqual({ error: "Rejected" })
        expect(clLinkPostHog).not.toHaveBeenCalled()
    })

    it("returns a stable error when an integration throws", async () => {
        jest.spyOn(console, "error").mockImplementationOnce(() => undefined)
        clSendCommunication.mockRejectedValue(new Error("network down"))
        // Raw integration errors are logged but collapsed to the stable UI copy.
        await expect(fnSubmitContact({ email: "ada@example.com" }, "token")).resolves.toEqual({
            error: "Something went wrong while submitting the contact form.",
        })
    })

    it("forwards custom notes and enquiry type", async () => {
        clSendCommunication.mockResolvedValue({ data: {} } as any)
        // Custom message/enquiry fields must override the helper defaults before the API receives them.
        await fnSubmitContact({ email: "ada@example.com", message: "Call me", enquiryType: "Enterprise" }, "token")
        expect(clSendCommunication).toHaveBeenCalledWith(expect.objectContaining({ notes: "Call me", option: "Enterprise" }))
    })

    it("subscribes contact-form newsletter consent with the submitted email", async () => {
        clSendCommunication.mockResolvedValue({ data: {} } as any)
        // Passing newsletter: true exercises the opt-in side effect between communication and PostHog linking.
        await fnSubmitContact({ email: "ada@example.com", newsletter: true }, "token")
        // The newsletter server action accepts FormData, so inspect the stored email rather than object shape.
        const LdFormData = clSubscribeNewsletter.mock.calls[0][1] as FormData
        expect(LdFormData.get("email")).toBe("ada@example.com")
    })

    it("returns the stable error when PostHog linking fails", async () => {
        jest.spyOn(console, "error").mockImplementationOnce(() => undefined)
        clSendCommunication.mockResolvedValue({ data: {} } as any)
        clLinkPostHog.mockRejectedValue(new Error("analytics unavailable"))
        // PostHog linking is inside the guarded flow, so its failure should keep the UI response stable.
        await expect(fnSubmitContact({ email: "ada@example.com" }, "token")).resolves.toEqual({
            error: "Something went wrong while submitting the contact form.",
        })
    })

    it("does not subscribe when contact newsletter consent is absent", async () => {
        clSendCommunication.mockResolvedValue({ data: {}, message: "created" } as any)

        // The helper should treat missing newsletter as false, even when a valid email is present.
        await fnSubmitContact({ email: "ada@example.com" }, "token")

        expect(clSubscribeNewsletter).not.toHaveBeenCalled()
    })

    it("subscribes newsletter consent before returning a contact API error", async () => {
        clSendCommunication.mockResolvedValue({ error: "Rejected" } as any)

        // The current order subscribes newsletter opt-ins before checking the communication API error.
        await expect(fnSubmitContact({
            email: "ada@example.com", newsletter: true,
        }, "token")).resolves.toEqual({ error: "Rejected" })

        // The two expectations together document that newsletter runs, but PostHog does not, on API errors.
        expect(clSubscribeNewsletter).toHaveBeenCalledWith({ message: "" }, expect.any(FormData))
        expect(clLinkPostHog).not.toHaveBeenCalled()
    })

    it("returns a stable error when contact newsletter subscription fails", async () => {
        jest.spyOn(console, "error").mockImplementationOnce(() => undefined)
        clSendCommunication.mockResolvedValue({ data: {} } as any)
        clSubscribeNewsletter.mockRejectedValue(new Error("newsletter down"))

        // A failed opt-in should stop later side effects such as PostHog linking.
        await expect(fnSubmitContact({
            email: "ada@example.com", newsletter: true,
        }, "token")).resolves.toEqual({ error: "Something went wrong while submitting the contact form." })

        // If newsletter throws, the helper exits through catch before the analytics link call.
        expect(clLinkPostHog).not.toHaveBeenCalled()
    })

    it("passes an empty note when the contact message is missing", async () => {
        clSendCommunication.mockResolvedValue({ data: {} } as any)

        // The backend expects notes to be present, so an absent message becomes an empty string.
        await fnSubmitContact({ email: "ada@example.com", enquiryType: "Support" }, "token")

        expect(clSendCommunication).toHaveBeenCalledWith(expect.objectContaining({ notes: "", option: "Support" }))
    })

    it("returns API data even when the contact API message is omitted", async () => {
        clSendCommunication.mockResolvedValue({ data: { id: 11 } } as any)

        // Preserve the helper contract exactly: missing response fields are returned as undefined.
        await expect(fnSubmitContact({ email: "ada@example.com" }, "token"))
            .resolves.toEqual({ data: { id: 11 }, message: undefined })
    })
})

describe("fnSubmitWebinar", () => {
    // Webinar submission has two external writes: contact creation/checking and event participant update.
    // These tests keep those writes separate so regressions in either step are easy to locate.
    it.each(["created", "exist"])("adds the participant when the contact %s", async (message) => {
        clContactApi.mockResolvedValue({ message, data: { name: "CONTACT-1" } } as any)
        clUpdateParticipant.mockResolvedValue({ data: { id: "PARTICIPANT-1" } } as any)

        // Both newly-created and existing contacts should be attached to the event participant list.
        await expect(fnSubmitWebinar({ email: "ada@example.com" }, { id: "EVENT-1" } as any, "token"))
            .resolves.toEqual({ data: { id: "PARTICIPANT-1" } })
        // The participant API needs the event id from the card data and the contact name returned by ContactApi.
        expect(clUpdateParticipant).toHaveBeenCalledWith("EVENT-1", "CONTACT-1")
    })

    it("subscribes newsletter opt-ins", async () => {
        clContactApi.mockResolvedValue({ message: "created", data: { name: "CONTACT-1" } } as any)
        clUpdateParticipant.mockResolvedValue({ data: {} } as any)
        // Webinar submissions support the same newsletter opt-in path as the other form helpers.
        await fnSubmitWebinar({ email: "ada@example.com", newsletter: true }, { id: "EVENT-1" } as any, "token")
        expect(clSubscribeNewsletter).toHaveBeenCalled()
    })

    it("returns user-facing error details when contact creation throws", async () => {
        jest.spyOn(console, "error").mockImplementationOnce(() => undefined)
        clContactApi.mockRejectedValue(new Error("CRM unavailable"))
        // CRM failures should return the modal-friendly title/message structure expected by SectionForm.
        await expect(fnSubmitWebinar({}, {} as any, "token")).resolves.toEqual(expect.objectContaining({
            error: "CRM unavailable", title: "Sorry",
        }))
    })

    it("sends form data and the reCAPTCHA token to the contact API", async () => {
        clContactApi.mockResolvedValue({ message: "ignored" } as any)
        const LdFormData = { email: "ada@example.com" }
        // The helper wraps raw form data with the token before handing it to ContactApi.
        await fnSubmitWebinar(LdFormData, { id: "EVENT-1" } as any, "token")
        // The original form object is kept under formData so ContactApi receives every field unchanged.
        expect(clContactApi).toHaveBeenCalledWith({ formData: LdFormData, recaptchaToken: "token" })
    })

    it("returns the fallback result when the contact status is unexpected", async () => {
        clContactApi.mockResolvedValue({ message: "pending" } as any)
        // Unknown contact statuses should not try to create an event participant.
        await expect(fnSubmitWebinar({}, { id: "EVENT-1" } as any, "token"))
            .resolves.toEqual({ data: "webinar updated successfully" })
        // Without a created/existing contact, there is no safe contact name to attach to the event.
        expect(clUpdateParticipant).not.toHaveBeenCalled()
    })

    it("returns user-facing details when participant creation fails", async () => {
        jest.spyOn(console, "error").mockImplementationOnce(() => undefined)
        clContactApi.mockResolvedValue({ message: "created", data: { name: "CONTACT-1" } } as any)
        clUpdateParticipant.mockRejectedValue(new Error("event unavailable"))
        // Participant failures are caught in the same user-facing error path as contact failures.
        await expect(fnSubmitWebinar({}, { id: "EVENT-1" } as any, "token"))
            .resolves.toEqual(expect.objectContaining({ error: "event unavailable", title: "Sorry" }))
    })

    it("adds the submitted email to the webinar newsletter payload", async () => {
        clContactApi.mockResolvedValue({ message: "pending" } as any)

        await fnSubmitWebinar({ email: "ada@example.com", newsletter: true }, { id: "EVENT-1" } as any, "token")

        // Direct FormData inspection proves the newsletter server action receives the visitor email.
        const LdFormData = clSubscribeNewsletter.mock.calls[0][1] as FormData
        expect(LdFormData.get("email")).toBe("ada@example.com")
    })

    it("does not subscribe webinar newsletter when consent is absent", async () => {
        clContactApi.mockResolvedValue({ message: "pending" } as any)

        // Like the other helpers, webinar only subscribes when the checkbox value is truthy.
        await fnSubmitWebinar({ email: "ada@example.com" }, { id: "EVENT-1" } as any, "token")

        expect(clSubscribeNewsletter).not.toHaveBeenCalled()
    })

    it("returns user-facing details when webinar newsletter subscription fails", async () => {
        jest.spyOn(console, "error").mockImplementationOnce(() => undefined)
        clContactApi.mockResolvedValue({ message: "pending" } as any)
        clSubscribeNewsletter.mockRejectedValue(new Error("newsletter down"))

        // Newsletter failure should stop before any event participant side effect.
        await expect(fnSubmitWebinar({
            email: "ada@example.com", newsletter: true,
        }, { id: "EVENT-1" } as any, "token")).resolves.toEqual(expect.objectContaining({
            error: "newsletter down", title: "Sorry",
        }))

        expect(clUpdateParticipant).not.toHaveBeenCalled()
    })

    it("uses the fallback error message when webinar submission throws a non-Error value", async () => {
        jest.spyOn(console, "error").mockImplementationOnce(() => undefined)
        clContactApi.mockRejectedValue("offline")

        // Non-Error throws do not have .message, so the helper should use its fallback copy.
        await expect(fnSubmitWebinar({}, { id: "EVENT-1" } as any, "token"))
            .resolves.toEqual(expect.objectContaining({
                error: "Something went wrong while submitting the contact form.",
                message: "Something went wrong, please try again sometime later!",
            }))
    })

    it("captures missing contact names as user-facing webinar errors", async () => {
        jest.spyOn(console, "error").mockImplementationOnce(() => undefined)
        clContactApi.mockResolvedValue({ message: "created" } as any)

        // A malformed contact success response should not call UpdateEventParticipant with undefined data.
        await expect(fnSubmitWebinar({}, { id: "EVENT-1" } as any, "token"))
            .resolves.toEqual(expect.objectContaining({ title: "Sorry" }))

        // This guards against accidentally sending undefined as the Frappe contact name.
        expect(clUpdateParticipant).not.toHaveBeenCalled()
    })
})

describe("fnDownload", () => {
    // This is the minimum case-study shape needed by fnDownload to name the PDF and send PDF data to the API.
    const LdPdfData = { caseStudies: [{ pdfName: "Turbo", name: "Turbo case study" }] }

    beforeEach(() => {
        // fnDownload delays link cleanup, so fake timers let the test verify that cleanup immediately.
        jest.useFakeTimers()
        // Previous tests may leave hidden download links until timers run; remove any leftovers before each case.
        document.querySelectorAll("a[download]").forEach((element) => element.remove())
        // The browser download APIs are replaced with spies because jsdom cannot create real object URLs.
        global.fetch = jest.fn()
        // createObjectURL returns a stable value so revokeObjectURL can be asserted later.
        Object.defineProperty(URL, "createObjectURL", { configurable: true, value: jest.fn(() => "blob:pdf") })
        Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: jest.fn() })
        // jsdom will not download files, so click is spied to prove the download would be triggered.
        jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined)
    })

    afterEach(() => {
        // Run delayed link cleanup before restoring real timers so anchors do not leak across tests.
        jest.runOnlyPendingTimers()
        jest.useRealTimers()
        jest.restoreAllMocks()
    })

    it("creates the lead, downloads the generated PDF, and reports success", async () => {
        const LBlob = new Blob(["pdf"], { type: "application/pdf" })
        jest.mocked(global.fetch).mockResolvedValue({ ok: true, blob: async () => LBlob } as Response)

        // This covers the full happy path: lead creation, PDF API call, object URL, and anchor click.
        const LdResult = await fnDownload({ name: "Ada", email: "ada@example.com" }, LdPdfData as any, "token")

        expect(clLeadCreation).toHaveBeenCalledWith({ name: "Ada", email: "ada@example.com", recaptchaToken: "token" })
        // The PDF endpoint receives the case-study data as JSON; the browser never renders the PDF locally.
        expect(global.fetch).toHaveBeenCalledWith("/api/pdf-generator", expect.objectContaining({
            method: "POST", body: JSON.stringify(LdPdfData),
        }))
        // Clicking the generated anchor is the browser mechanism that starts the file download.
        expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled()
        expect(LdResult).toEqual({ message: "Your file has been downloaded.", title: "Download Success" })
    })

    it("stops before PDF generation when lead creation fails", async () => {
        jest.spyOn(console, "error").mockImplementationOnce(() => undefined)
        clLeadCreation.mockRejectedValue(new Error("lead failed"))
        // Lead creation is a prerequisite; PDF generation should not start if it fails.
        await expect(fnDownload({ email: "ada@example.com" }, LdPdfData as any, "token")).resolves.toEqual({
            message: "Something went wrong, please try again later", title: "Download Fail",
        })
        expect(global.fetch).not.toHaveBeenCalled()
    })

    it("reports a failed PDF response", async () => {
        jest.spyOn(console, "error").mockImplementationOnce(() => undefined)
        jest.mocked(global.fetch).mockResolvedValue({ ok: false } as Response)
        // Non-2xx PDF responses are converted into the same user-facing download failure shape.
        await expect(fnDownload({ email: "ada@example.com" }, LdPdfData as any, "token"))
            .resolves.toEqual(expect.objectContaining({ title: "Download Failed", error: "Failed to generate PDF" }))
    })

    it("subscribes download-form newsletter consent", async () => {
        jest.mocked(global.fetch).mockResolvedValue({ ok: true, blob: async () => new Blob(["pdf"]) } as Response)
        // This lightweight assertion proves the opt-in branch runs; a later test checks the exact FormData value.
        await fnDownload({ email: "ada@example.com", newsletter: true }, LdPdfData as any, "token")
        expect(clSubscribeNewsletter).toHaveBeenCalled()
    })

    it("uses CaseStudy.pdf when no configured PDF name exists", async () => {
        jest.mocked(global.fetch).mockResolvedValue({ ok: true, blob: async () => new Blob(["pdf"]) } as Response)
        // Missing CMS metadata should still produce a predictable fallback filename.
        await fnDownload({ email: "ada@example.com" }, { caseStudies: [{}] } as any, "token")
        expect(document.querySelector('a[download="CaseStudy.pdf"]')).toBeInTheDocument()
    })

    it("reports an error when reading the response blob fails", async () => {
        jest.spyOn(console, "error").mockImplementationOnce(() => undefined)
        jest.mocked(global.fetch).mockResolvedValue({ ok: true, blob: async () => { throw new Error("bad blob") } } as any)
        // Blob conversion happens after a successful response, so it needs its own failure coverage.
        await expect(fnDownload({ email: "ada@example.com" }, LdPdfData as any, "token"))
            .resolves.toEqual(expect.objectContaining({ title: "Download Failed", error: "bad blob" }))
    })

    it("removes the temporary link and revokes its URL after the delay", async () => {
        jest.useFakeTimers()
        jest.mocked(global.fetch).mockResolvedValue({ ok: true, blob: async () => new Blob(["pdf"]) } as Response)
        await fnDownload({ email: "ada@example.com" }, LdPdfData as any, "token")
        const LLink = Array.from(document.querySelectorAll('a[download="Turbo.pdf"]')).at(-1)
        expect(LLink).toBeInTheDocument()
        // The timeout cleanup prevents object URLs and hidden anchors from accumulating in the browser.
        act(() => jest.runAllTimers())
        expect(LLink).not.toBeInTheDocument()
        // Revoking the same URL returned by createObjectURL prevents browser memory leaks.
        expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:pdf")
    })

    it("does not subscribe download newsletter when consent is absent", async () => {
        jest.mocked(global.fetch).mockResolvedValue({ ok: true, blob: async () => new Blob(["pdf"]) } as Response)

        // A successful download without newsletter consent should skip the optional opt-in side effect.
        await fnDownload({ email: "ada@example.com" }, LdPdfData as any, "token")

        expect(clSubscribeNewsletter).not.toHaveBeenCalled()
    })

    it("adds the submitted email to the download newsletter payload", async () => {
        jest.mocked(global.fetch).mockResolvedValue({ ok: true, blob: async () => new Blob(["pdf"]) } as Response)

        await fnDownload({ email: "ada@example.com", newsletter: true }, LdPdfData as any, "token")

        // Newsletter subscription receives FormData, so assert the contained value rather than object identity.
        const LdFormData = clSubscribeNewsletter.mock.calls[0][1] as FormData
        expect(LdFormData.get("email")).toBe("ada@example.com")
    })

    it("stops before PDF generation when download newsletter subscription fails", async () => {
        jest.spyOn(console, "error").mockImplementationOnce(() => undefined)
        clSubscribeNewsletter.mockRejectedValue(new Error("newsletter down"))

        // Newsletter opt-in happens before PDF generation in the current implementation.
        await expect(fnDownload({
            email: "ada@example.com", newsletter: true,
        }, LdPdfData as any, "token")).resolves.toEqual(expect.objectContaining({
            title: "Download Failed", error: "newsletter down",
        }))

        expect(global.fetch).not.toHaveBeenCalled()
    })

    it("reports a failed PDF request when fetch rejects", async () => {
        jest.spyOn(console, "error").mockImplementationOnce(() => undefined)
        jest.mocked(global.fetch).mockRejectedValue(new Error("network down"))

        // Network-level fetch failures should match the normal download failure response shape.
        await expect(fnDownload({ email: "ada@example.com" }, LdPdfData as any, "token"))
            .resolves.toEqual(expect.objectContaining({ title: "Download Failed", error: "network down" }))
    })

    it("uses the first case study PDF name when multiple studies are provided", async () => {
        jest.mocked(global.fetch).mockResolvedValue({ ok: true, blob: async () => new Blob(["pdf"]) } as Response)

        // The helper names the generated file from the first case study, matching the production code path.
        await fnDownload({ email: "ada@example.com" }, {
            caseStudies: [{ pdfName: "First Study" }, { pdfName: "Second Study" }],
        } as any, "token")

        // Only the first case study controls the filename; later studies stay part of the PDF body data.
        expect(document.querySelector('a[download="First Study.pdf"]')).toBeInTheDocument()
    })
})

describe("SectionForm", () => {
    // Field factory keeps component tests compact while preserving the config shape SectionForm expects.
    // The defaults match common Strapi field metadata, and overrides describe the one behavior being tested.
    const fnField = (name: string, type: string, overrides: Record<string, unknown> = {}) => ({
        name, type, label: name, placeholder: name, fieldDisplay: "Full_Width_No_Margin", loading: {}, ...overrides,
    })

    it("renders configured content, fields, terms, and the locale-specific reCAPTCHA script", async () => {
        render(<SectionForm
            config={fnCreateConfig({ showTerms: true }) as any}
            onSuccess={jest.fn()}
        />)

        // This covers the CMS-driven static content and the locale-specific script URL in one render.
        expect(screen.getByRole("heading", { name: "Contact us" })).toBeInTheDocument()
        // Labels/placeholders are checked through Testing Library queries so accessibility stays visible.
        expect(screen.getByLabelText("Email")).toBeInTheDocument()
        expect(screen.getByPlaceholderText("Message")).toBeInTheDocument()
        // Terms and privacy links are generated from config, including the leading slash normalization.
        expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms-and-conditions")
        expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy-policy")
        // Script injection is async, so waitFor avoids racing the useEffect that adds the reCAPTCHA script.
        await waitFor(() => expect(document.querySelector("#google-recaptcha-v3")).toHaveAttribute(
            "src", "https://www.google.com/recaptcha/api.js?render=site-key&hl=en",
        ))
    })

    it("hides the card header when requested", async () => {
        // Wrapping render in act lets React settle the initial effects before asserting the header is absent.
        await act(async () => {
            render(<SectionForm config={fnCreateConfig() as any} onSuccess={jest.fn()} hideCardHeader />)
        })
        expect(screen.queryByRole("heading", { name: "Contact us" })).not.toBeInTheDocument()
    })

    it("validates, submits a contact form, sanitizes callback data, and resets", async () => {
        clSendCommunication.mockResolvedValue({ data: { id: 1 }, message: "created" } as any)
        const fnOnSuccess = jest.fn()
        const fnOnSuccessfulSubmit = jest.fn()
        render(<SectionForm
            config={fnCreateConfig() as any}
            onSuccess={fnOnSuccess}
            onSuccessfulSubmit={fnOnSuccessfulSubmit}
        />)

        const LEmail = screen.getByLabelText("Email")
        fireEvent.change(LEmail, { target: { value: "ada@example.com" } })
        fireEvent.blur(LEmail)
        // Wait for react-hook-form validation before clicking because the submit button depends on form state.
        await waitFor(() => expect(screen.getByRole("button", { name: "Send" })).toBeEnabled())
        fireEvent.click(screen.getByRole("button", { name: "Send" }))

        // The callback payload intentionally removes fields that are internal to submission mechanics.
        await waitFor(() => expect(fnExecuteRecaptcha).toHaveBeenCalledWith("submit"))
        expect(clSendCommunication).toHaveBeenCalled()
        // onSuccessfulSubmit should receive sanitized data, excluding recaptchaToken and timeSlot internals.
        expect(fnOnSuccessfulSubmit).toHaveBeenCalledWith(expect.objectContaining({
            formData: { email: "ada@example.com", message: "" },
            formId: "contact", formTitle: "Contact us",
        }))
        // onSuccess receives the user-facing message and title from the configured form copy.
        expect(fnOnSuccess).toHaveBeenCalledWith("Sent successfully", "Thank you")
        // Successful submission resets form values; waiting avoids racing react-hook-form state updates.
        await waitFor(() => expect(LEmail).toHaveValue(""))
    })

    it("shows submission failures and does not call success callbacks", async () => {
        clSendCommunication.mockResolvedValue({ error: "Service unavailable" } as any)
        const fnOnSuccess = jest.fn()
        render(<SectionForm config={fnCreateConfig() as any} onSuccess={fnOnSuccess} />)

        fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ada@example.com" } })
        fireEvent.blur(screen.getByLabelText("Email"))
        // Validation must settle before submit; otherwise the test races the disabled button state.
        await waitFor(() => expect(screen.getByRole("button", { name: "Send" })).toBeEnabled())
        fireEvent.click(screen.getByRole("button", { name: "Send" }))

        // API errors should render inline and must not call the success callback.
        expect(await screen.findByText("Service unavailable")).toBeInTheDocument()
        expect(fnOnSuccess).not.toHaveBeenCalled()
    })

    it("keeps submit disabled before the form becomes dirty", () => {
        render(<SectionForm config={fnCreateConfig() as any} onSuccess={jest.fn()} />)
        // The initial disabled state prevents blank form submissions before the user edits anything.
        expect(screen.getByRole("button", { name: "Send" })).toBeDisabled()
    })

    it("keeps submit disabled for an invalid email", async () => {
        render(<SectionForm config={fnCreateConfig() as any} onSuccess={jest.fn()} />)
        fireEvent.change(screen.getByLabelText("Email"), { target: { value: "not-an-email" } })
        fireEvent.blur(screen.getByLabelText("Email"))
        // Invalid input keeps the button disabled after validation runs.
        await waitFor(() => expect(screen.getByRole("button", { name: "Send" })).toBeDisabled())
    })

    it("omits the description when none is configured", () => {
        render(<SectionForm config={fnCreateConfig({ description: undefined }) as any} onSuccess={jest.fn()} />)
        // Optional CMS description should disappear completely instead of rendering empty text.
        expect(screen.queryByText("Tell us what you need")).not.toBeInTheDocument()
    })

    it("applies a custom class to the form card", () => {
        render(<SectionForm config={fnCreateConfig() as any} onSuccess={jest.fn()} className="campaign-form" />)
        // The class is applied to the outer card wrapper, so the assertion walks up from the heading.
        expect(screen.getByRole("heading", { name: "Contact us" }).parentElement?.parentElement).toHaveClass("campaign-form")
    })

    it("renders a text input using its placeholder as fallback label", () => {
        const LdConfig = fnCreateConfig({
            fields: [fnField("name", "text", { label: undefined, placeholder: "Your name" })],
            schema: z.object({ name: z.string() }),
        })
        render(<SectionForm config={LdConfig as any} onSuccess={jest.fn()} />)
        // When label is missing, placeholder still becomes the accessible label for text inputs.
        expect(screen.getByLabelText("Your name")).toHaveAttribute("type", "text")
    })

    it("renders and updates the phone input", () => {
        const LdConfig = fnCreateConfig({ fields: [fnField("phone", "phone")], schema: z.object({ phone: z.string() }) })
        render(<SectionForm config={LdConfig as any} onSuccess={jest.fn()} />)
        // The phone mock calls onChange with the raw value, matching the data path SectionForm uses.
        fireEvent.change(screen.getByLabelText("phone"), { target: { value: "+491234" } })
        expect(screen.getByLabelText("phone")).toHaveValue("+491234")
    })

    it("renders textarea styling from field configuration", () => {
        const LdConfig = fnCreateConfig({
            fields: [fnField("notes", "textarea", { placeholder: "Notes", inputClassName: "notes-field" })],
            schema: z.object({ notes: z.string().optional() }),
        })
        render(<SectionForm config={LdConfig as any} onSuccess={jest.fn()} />)
        // Textarea should combine the component's base height class with CMS-provided field classes.
        expect(screen.getByPlaceholderText("Notes")).toHaveClass("min-h-[100px]", "notes-field")
    })

    it("renders select placeholder and options", () => {
        const LdConfig = fnCreateConfig({
            fields: [fnField("plan", "select", {
                placeholder: "Choose plan", options: [{ value: "free", label: "Free" }, { value: "pro", label: "Pro" }],
            })],
            schema: z.object({ plan: z.string().optional() }),
        })
        render(<SectionForm config={LdConfig as any} onSuccess={jest.fn()} />)
        // The trigger shows the configured placeholder before any option is selected.
        expect(screen.getByRole("button", { name: "Select plan" })).toHaveTextContent("Choose plan")
        // Options are rendered from CMS config and remain discoverable by accessible button text.
        expect(screen.getByRole("button", { name: "Free" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Pro" })).toBeInTheDocument()
    })

    it("renders the date placeholder and calendar control", () => {
        const LdConfig = fnCreateConfig({
            fields: [fnField("date", "date", { placeholder: "Choose appointment date" })],
            schema: z.object({ date: z.date().optional() }),
        })
        render(<SectionForm config={LdConfig as any} onSuccess={jest.fn()} />)
        // The visible date trigger uses the CMS placeholder when no date has been selected.
        expect(screen.getByRole("button", { name: "Choose appointment date" })).toBeInTheDocument()
        // The mocked Calendar button proves the popover content is available to the form.
        expect(screen.getByRole("button", { name: "Choose date" })).toBeInTheDocument()
    })

    it("disables timezone selection while timezones are loading", () => {
        // A never-resolving promise holds the component in its loading state.
        clFetchTimezones.mockReturnValue(new Promise(() => undefined) as any)
        const LdConfig = fnCreateConfig({
            fields: [fnField("timezone", "timezone", { placeholder: "Choose timezone" })],
            schema: z.object({ timezone: z.string().optional() }),
        })
        render(<SectionForm config={LdConfig as any} onSuccess={jest.fn()} />)
        // Loading state should disable the timezone trigger so users cannot pick stale choices.
        expect(screen.getByRole("button", { name: "Select timezone" })).toBeDisabled()
        // The loading copy comes from the timezone field branch and documents what the user sees.
        expect(screen.getByText("Loading timezones...")).toBeInTheDocument()
    })

    it("renders fetched timezone choices", async () => {
        clFetchTimezones.mockResolvedValue({ data: ["UTC", "Europe/Berlin CET"] } as any)
        const LdConfig = fnCreateConfig({
            fields: [fnField("timezone", "timezone", { placeholder: "Choose timezone" })],
            schema: z.object({ timezone: z.string().optional() }),
        })
        render(<SectionForm config={LdConfig as any} onSuccess={jest.fn()} />)
        // findByRole waits for the mount-time timezone effect to finish.
        expect(await screen.findByRole("button", { name: "UTC" })).toBeEnabled()
        // All returned timezones should be rendered as selectable choices, not just the default.
        expect(screen.getByRole("button", { name: "Europe/Berlin CET" })).toBeInTheDocument()
    })

    it("hides time slots until both date and timezone are selected", () => {
        const LdConfig = fnCreateConfig({
            fields: [fnField("timeSlot", "timeslot", { label: "Available times" })],
            schema: z.object({ timeSlot: z.string().optional() }),
        })
        render(<SectionForm config={LdConfig as any} onSuccess={jest.fn()} />)
        // Time slots are intentionally hidden until date and timezone are both known.
        expect(screen.queryByText("Available times")).not.toBeInTheDocument()
    })

    it("shows the configured empty-slots message", async () => {
        clFetchTimezones.mockResolvedValue({ data: ["Europe/Berlin CET"] } as any)
        clFetchTimeSlots.mockResolvedValue({ data: [] } as any)
        const LdConfig = fnCreateConfig({
            fields: [
                fnField("date", "date", { placeholder: "Appointment date" }),
                fnField("timezone", "timezone"),
                fnField("timeSlot", "timeslot", { label: "Available times", loading: { description: "Fully booked" } }),
            ],
            schema: z.object({ date: z.date().optional(), timezone: z.string().optional(), timeSlot: z.string().optional() }),
        })
        render(<SectionForm config={LdConfig as any} onSuccess={jest.fn()} />)
        // Selecting a date after the default timezone is loaded triggers the slot lookup.
        await screen.findByRole("button", { name: "Europe/Berlin CET" })
        fireEvent.click(screen.getByRole("button", { name: "Choose date" }))
        // Empty API data should show the CMS-configured empty-state message.
        expect(await screen.findByText("Fully booked")).toBeInTheDocument()
        // The slot API receives the mocked calendar date formatted with the selected timezone.
        expect(clFetchTimeSlots).toHaveBeenCalledWith("2026-12-15", "Europe/Berlin CET")
    })

    it("renders available and unavailable time-slot buttons", async () => {
        clFetchTimezones.mockResolvedValue({ data: ["CET"] } as any)
        clFetchTimeSlots.mockResolvedValue({ data: [
            { time: "2026-12-15T09:30:00", availability: true },
            { time: "2026-12-15T10:30:00", availability: false },
        ] } as any)
        const LdConfig = fnCreateConfig({
            fields: [fnField("date", "date"), fnField("timezone", "timezone"), fnField("timeSlot", "timeslot")],
            schema: z.object({ date: z.date().optional(), timezone: z.string().optional(), timeSlot: z.string().optional() }),
        })
        render(<SectionForm config={LdConfig as any} onSuccess={jest.fn()} />)
        // The mocked Calendar date and fetched slots combine into one-hour display labels.
        await screen.findByRole("button", { name: "CET" })
        fireEvent.click(screen.getByRole("button", { name: "Choose date" }))
        // Available slots remain clickable.
        expect(await screen.findByRole("button", { name: "09:30 - 10:30" })).toBeEnabled()
        // Unavailable slots still render so the user sees the schedule, but they cannot be chosen.
        expect(screen.getByRole("button", { name: "10:30 - 11:30" })).toBeDisabled()
    })

    it("checks the newsletter field by default", () => {
        const LdConfig = fnCreateConfig({
            fields: [fnField("newsletter", "checkbox", { placeholder: "Send updates" })],
            schema: z.object({ newsletter: z.boolean() }),
        })
        render(<SectionForm config={LdConfig as any} onSuccess={jest.fn()} />)
        // SectionForm defaults newsletter to true, matching the initial form values in form.tsx.
        expect(screen.getByRole("checkbox")).toBeChecked()
    })

    it("updates checkbox state when clicked", () => {
        const LdConfig = fnCreateConfig({
            fields: [fnField("newsletter", "checkbox", { placeholder: "Send updates" })],
            schema: z.object({ newsletter: z.boolean() }),
        })
        render(<SectionForm config={LdConfig as any} onSuccess={jest.fn()} />)
        // Checkbox clicks must update react-hook-form state through onCheckedChange.
        fireEvent.click(screen.getByRole("checkbox"))
        expect(screen.getByRole("checkbox")).not.toBeChecked()
    })

    it("renders customized policy links and description", () => {
        const LdConfig = fnCreateConfig({
            showTerms: true, policyDescription: "Please review", terms: { label: "Conditions", href: "conditions" },
            privacy: { label: "Data policy", href: "data-policy" },
        })
        render(<SectionForm config={LdConfig as any} onSuccess={jest.fn()} />)
        // Policy description is free text from config and should render alongside custom link labels.
        expect(screen.getByText("Please review", { exact: false })).toBeInTheDocument()
        // Relative policy hrefs are normalized to site-root links.
        expect(screen.getByRole("link", { name: "Conditions" })).toHaveAttribute("href", "/conditions")
        expect(screen.getByRole("link", { name: "Data policy" })).toHaveAttribute("href", "/data-policy")
    })

    it("does not render policy links when terms are disabled", () => {
        const { container } = render(<SectionForm config={fnCreateConfig({ showTerms: false }) as any} onSuccess={jest.fn()} />)
        // Disabling terms should remove policy anchors entirely, not just hide their text.
        expect(container.querySelector("a")).not.toBeInTheDocument()
    })

    it("ignores an unsupported field type without crashing", () => {
        const LdConfig = fnCreateConfig({
            fields: [fnField("mystery", "unsupported")], schema: z.object({ mystery: z.string().optional() }),
        })
        render(<SectionForm config={LdConfig as any} onSuccess={jest.fn()} />)
        // Unknown field types should be skipped so a bad CMS field does not break the whole form.
        expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument()
        // The unsupported field name should not leak into visible UI.
        expect(screen.queryByText("mystery")).not.toBeInTheDocument()
    })
})
