"use client"

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormControl, FormMessage } from "@repo/ui/components/ui/form";
import { FloatingLabelInput } from "@repo/ui/components/ui/floating-label-input";
import { PhoneInput } from "react-international-phone";
import { cn } from "@repo/ui/lib/utils";

// Lightweight field definition local to this step. (Not TformFieldConfig — these
// are static, simple fields and don't need the full Strapi field shape.)
type TStepField = {
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
    inputClassName?: string;
    fieldDisplay: string;
};

const StepDetails = () => {
    const { control } = useFormContext();

    const fields: TStepField[] = [
        {
            name: "companyName",
            label: "Company Name",
            type: "text",
            placeholder: "Enter your company name",
            inputClassName: "w-full",
            fieldDisplay: "Full_Width_Small_Bottom_Space",
        },
        {
            name: "phone",
            label: "Phone Number",
            type: "phone",
            placeholder: "Enter your phone number",
            inputClassName: "w-full",
            fieldDisplay: "Full_Width_Small_Bottom_Space",
        },
    ];

    return (
        <div className="flex flex-col space-y-4">
            {fields.map((field) => (
                <FormField
                    key={field.name}
                    control={control}
                    name={field.name}
                    render={({ field: iField, fieldState }) => (
                        <FormItem className={cn(field.fieldDisplay)}>
                            <FormControl>
                                {field.type === "phone" ? (
                                    <PhoneInput
                                        defaultCountry="us"
                                        value={iField.value || ""}
                                        onChange={iField.onChange}
                                        onBlur={iField.onBlur}
                                        className="!w-full !rounded-md"
                                        inputClassName="!w-full p-5 border rounded-md text-sm focus:outline-none !h-12"
                                        countrySelectorStyleProps={{
                                            buttonClassName: "!p-2 !h-12 !w-fit",
                                        }}
                                    />
                                ) : (
                                    <FloatingLabelInput
                                        label={field.label}
                                        type={field.type ?? "text"}
                                        error={!!fieldState.error}
                                        inputClassName={field.inputClassName}
                                        {...iField}
                                        value={iField.value ?? ""}
                                    />
                                )}
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            ))}
        </div>
    );
};

export default StepDetails;
