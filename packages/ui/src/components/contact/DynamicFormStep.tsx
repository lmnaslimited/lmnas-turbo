"use client"

import type { ReactNode } from "react"
import type { Control } from "react-hook-form"

import { cn } from "@repo/ui/lib/utils"
import { Button } from "@repo/ui/components/ui/button"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { Checkbox } from "@repo/ui/components/ui/checkbox"
import { FloatingLabelInput } from "@repo/ui/components/ui/floating-label-input"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/ui/popover"
import { Calendar } from "@repo/ui/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns/format"

import "react-international-phone/style.css"
import { PhoneInput } from "react-international-phone"

import type { TformFieldConfig } from "@repo/middleware/types"
import type { TresolvedContactStep } from "@repo/middleware/types"
import type { Tslot } from "@repo/middleware/types"

// Strapi's enumerate field value is returned with underscores (in place of
// spaces). This maps that user-friendly style name to the matching Tailwind
// classes — purely presentational, mirrors the shared form's layout behaviour.
// https://github.com/strapi/strapi/issues/7904
function fnGetClassNameFromFriendlyName(iStrapiValue: string): string {
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

type TdynamicFormStepProps = {
  step: TresolvedContactStep
  // react-hook-form control instance from the parent form (single source of truth)
  control: Control<Record<string, unknown>>
  // Detected ISO-3166 alpha-2 (lowercase, e.g. "in") used as the phone field's
  // initial country. Falls back to "de" when detection is unavailable.
  countryIso?: string
  showTimeSlots?: boolean
  timeSlots?: Tslot[]
  isLoadingSlots?: boolean
  timezones?: string[]
  isLoadingTimezones?: boolean
  availableDates?: string[]
  bookingRangeStart?: Date
  bookingRangeEnd?: Date
  isLoadingAvailability?: boolean
  availabilityError?: string
  appointmentDuration?: number
}

function fnFormatSlotEnd(iStartTime: string, iDuration: number): string {
  const [LHour = 0, LMinute = 0] = iStartTime.split(":").map(Number)
  const LEndMinutes = (LHour * 60 + LMinute + iDuration) % (24 * 60)
  const LEndHour = Math.floor(LEndMinutes / 60).toString().padStart(2, "0")
  const LEndMinute = (LEndMinutes % 60).toString().padStart(2, "0")
  return `${LEndHour}:${LEndMinute}`
}

/**
 * Renders the fields belonging to a single step of the multi-step contact form.
 *
 * Field rendering mirrors the shared <SectionForm /> markup so the look & feel
 * (floating labels, phone input, selects, error states) is identical. The
 * parent form's `control` is used directly, so values persist across steps with
 * no duplicate state.
 */
export default function DynamicFormStep({
  step,
  control,
  countryIso,
  showTimeSlots = false,
  timeSlots = [],
  isLoadingSlots = false,
  timezones = [],
  isLoadingTimezones = false,
  availableDates = [],
  bookingRangeStart,
  bookingRangeEnd,
  isLoadingAvailability = false,
  availabilityError,
  appointmentDuration = 60,
}: TdynamicFormStepProps) {
  const LAvailableDateSet = new Set(availableDates)

  const fnRenderField = (idField: TformFieldConfig): ReactNode => {
    switch (idField.type) {
      case "text":
      case "email":
        return (
          <FormField
            key={idField.name}
            control={control}
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
                    value={(iField.value as string) || ""}
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
            control={control}
            name={idField.name}
            render={({ field: iField }) => (
              <FormItem className={fnGetClassNameFromFriendlyName(idField.fieldDisplay)}>
                <FormControl>
                  <PhoneInput
                    // Remount when detection resolves so the new default country
                    // is applied (defaultCountry is only read on mount).
                    key={countryIso || "de"}
                    defaultCountry={countryIso || "de"}
                    value={(iField.value as string) || ""}
                    onChange={iField.onChange}
                    onBlur={iField.onBlur}
                    className="!w-full !rounded-md"
                    inputClassName="!w-full p-5 border rounded-md text-sm focus:outline-none !h-12"
                    countrySelectorStyleProps={{
                      buttonClassName: "!p-2 !h-12 !w-fit",
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
            control={control}
            name={idField.name}
            render={({ field: iField }) => (
              <FormItem className={fnGetClassNameFromFriendlyName(idField.fieldDisplay)}>
                <Select onValueChange={iField.onChange} value={(iField.value as string) || idField.defaultValue}>
                  <FormControl>
                    <SelectTrigger className="h-12" aria-label={`Select ${idField.name}`}>
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
            control={control}
            name={idField.name}
            render={({ field: iField, fieldState: iFieldState }) => (
              <FormItem className={fnGetClassNameFromFriendlyName(idField.fieldDisplay)}>
                <FormControl>
                  <Textarea
                    placeholder={idField.placeholder}
                    className={cn("min-h-[100px]", idField.inputClassName, iFieldState.error && "border-red-400")}
                    {...iField}
                    value={(iField.value as string) || ""}
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
            control={control}
            name={idField.name}
            render={({ field: iField }) => (
              <FormItem className={fnGetClassNameFromFriendlyName(idField.fieldDisplay)}>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn("h-12 w-full text-left font-normal", !iField.value && "text-muted-foreground")}
                        disabled={isLoadingAvailability || availableDates.length === 0}
                      >
                        {isLoadingAvailability
                          ? idField.loading?.label ?? "Loading available dates..."
                          : iField.value
                            ? format(iField.value as Date, "PPP")
                            : idField.placeholder}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={iField.value as Date | undefined}
                      onSelect={iField.onChange}
                      defaultMonth={(iField.value as Date | undefined) ?? bookingRangeStart}
                      fromDate={bookingRangeStart}
                      toDate={bookingRangeEnd}
                      disabled={(idDate) =>
                        !LAvailableDateSet.has(format(idDate, "yyyy-MM-dd"))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {availabilityError && (
                  <p className="mt-2 text-sm text-red-500">{availabilityError}</p>
                )}
                {idField.name !== "date" && <FormMessage />}
              </FormItem>
            )}
          />
        )

      case "timezone":
        return (
          <FormField
            key={idField.name}
            control={control}
            name={idField.name}
            render={({ field: iField }) => (
              <FormItem className={fnGetClassNameFromFriendlyName(idField.fieldDisplay)}>
                <Select onValueChange={iField.onChange} value={(iField.value as string) || ""} disabled={isLoadingTimezones}>
                  <FormControl>
                    <SelectTrigger className="h-12" aria-label={`Select ${idField.name}`}>
                      <SelectValue placeholder={isLoadingTimezones ? "Loading timezones..." : idField.placeholder} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timezones.map((iTimeZone) => (
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
        if (!showTimeSlots) return null
        return (
          <FormField
            key={idField.name}
            control={control}
            name={idField.name}
            render={({ field: iField }) => (
              <FormItem className={fnGetClassNameFromFriendlyName(idField.fieldDisplay)}>
                {idField.label && <FormLabel>{idField.label}</FormLabel>}
                <div className="grid grid-cols-3 gap-2">
                  {isLoadingSlots ? (
                    <p className="col-span-3 text-muted-foreground text-sm">{idField.loading?.label ?? "Loading slots..."}</p>
                  ) : timeSlots.length === 0 ? (
                    <p className="col-span-3 text-sm text-red-500 text-center py-4 font-medium">
                      {idField.loading.description ?? "No slots available"}
                    </p>
                  ) : (
                    timeSlots.map(({ time, availability }) => {
                      const fromTime = time.slice(11, 16)
                      const slotLabel = `${fromTime} - ${fnFormatSlotEnd(fromTime, appointmentDuration)}`
                      const formattedValue = time.slice(11, 19)

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
            control={control}
            name={idField.name}
            render={({ field: iField }) => (
              <FormItem
                className={cn(
                  fnGetClassNameFromFriendlyName(idField.fieldDisplay),
                  "flex flex-row items-center justify-start space-x-2",
                )}
              >
                <FormControl>
                  <Checkbox
                    checked={(iField.value as boolean) || false}
                    onCheckedChange={iField.onChange}
                    className="mt-1.5"
                  />
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

  return <div className="flex flex-wrap -mx-2">{step.fields.map(fnRenderField)}</div>
}

export { fnGetClassNameFromFriendlyName }
