import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@repo/ui/components/ui/form";
import { FloatingLabelInput } from "@repo/ui/components/ui/floating-label-input";
import { PhoneInput } from "react-international-phone";
import { TformFieldConfig } from "../types";
import { cn } from "@repo/ui/lib/utils";

const StepDetails = () => {
    const { register, formState: { errors } } = useFormContext();

    const fields: TformFieldConfig[] = [
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
                    control={register}
                    name={field.name}
                    render={({ field: iField }) => (
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
                                        type={field.type}
                                        error={!!errors[field.name]}
                                        inputClassName={field.inputClassName}
                                        {...iField}
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