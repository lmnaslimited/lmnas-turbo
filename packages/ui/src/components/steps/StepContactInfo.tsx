import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@repo/ui/components/ui/form";
import { FloatingLabelInput } from "@repo/ui/components/ui/floating-label-input";

const StepContactInfo = () => {
    const { register, formState: { errors } } = useFormContext();

    return (
        <div>
            <FormField
                control={register}
                name="fullName"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                            <FloatingLabelInput
                                placeholder="Enter your full name"
                                {...field}
                                error={!!errors.fullName}
                            />
                        </FormControl>
                        <FormMessage>{errors.fullName?.message}</FormMessage>
                    </FormItem>
                )}
            />
            <FormField
                control={register}
                name="email"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Company Email Address</FormLabel>
                        <FormControl>
                            <FloatingLabelInput
                                type="email"
                                placeholder="Enter your company email"
                                {...field}
                                error={!!errors.email}
                            />
                        </FormControl>
                        <FormMessage>{errors.email?.message}</FormMessage>
                    </FormItem>
                )}
            />
        </div>
    );
};

export default StepContactInfo;