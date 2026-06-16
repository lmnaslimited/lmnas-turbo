"use client"

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@repo/ui/components/ui/form";
import { FloatingLabelInput } from "@repo/ui/components/ui/floating-label-input";

const StepContactInfo = () => {
    const { control } = useFormContext();

    return (
        <div>
            <FormField
                control={control}
                name="fullName"
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                            <FloatingLabelInput
                                label="Full Name"
                                placeholder="Enter your full name"
                                error={!!fieldState.error}
                                {...field}
                                value={field.value ?? ""}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="email"
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormLabel>Company Email Address</FormLabel>
                        <FormControl>
                            <FloatingLabelInput
                                label="Company Email Address"
                                type="email"
                                placeholder="Enter your company email"
                                error={!!fieldState.error}
                                {...field}
                                value={field.value ?? ""}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
};

export default StepContactInfo;
