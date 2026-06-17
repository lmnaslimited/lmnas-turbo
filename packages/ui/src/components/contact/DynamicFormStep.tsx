"use client"

import type { ReactNode } from "react"
import type { Control } from "react-hook-form"

import { cn } from "@repo/ui/lib/utils"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { Checkbox } from "@repo/ui/components/ui/checkbox"
import { FloatingLabelInput } from "@repo/ui/components/ui/floating-label-input"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select"

import "react-international-phone/style.css"
import { PhoneInput } from "react-international-phone"

import type { TformFieldConfig } from "@repo/middleware/types"
import type { TresolvedContactStep } from "./contact-form.types"

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
}

/**
 * Renders the fields belonging to a single step of the multi-step contact form.
 *
 * Field rendering mirrors the shared <SectionForm /> markup so the look & feel
 * (floating labels, phone input, selects, error states) is identical. The
 * parent form's `control` is used directly, so values persist across steps with
 * no duplicate state.
 */
export default function DynamicFormStep({ step, control, countryIso }: TdynamicFormStepProps) {
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
