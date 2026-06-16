import { useFormContext } from "react-hook-form";
import { Button } from "@repo/ui/components/ui/button";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { FormItem, FormControl, FormLabel, FormMessage } from "@repo/ui/components/ui/form";

const StepReview = ({ onBack, onSubmit }) => {
    const { watch, handleSubmit, formState: { errors } } = useFormContext();
    
    const formData = watch();

    const handleReviewSubmit = async (data) => {
        await onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(handleReviewSubmit)}>
            <div className="mb-4">
                <h2 className="text-xl font-bold">Review Your Information</h2>
                <p>Please review your details before submitting.</p>
            </div>
            <div className="mb-4">
                <h3 className="font-semibold">Full Name:</h3>
                <p>{formData.name}</p>
            </div>
            <div className="mb-4">
                <h3 className="font-semibold">Email Address:</h3>
                <p>{formData.email}</p>
            </div>
            <div className="mb-4">
                <h3 className="font-semibold">Company Name:</h3>
                <p>{formData.companyName}</p>
            </div>
            <div className="mb-4">
                <h3 className="font-semibold">Phone Number:</h3>
                <p>{formData.phone}</p>
            </div>
            <div className="mb-4">
                <FormItem>
                    <FormControl>
                        <Checkbox
                            checked={formData.newsletter}
                            onCheckedChange={(checked) => {
                                // Update the form state for newsletter subscription
                            }}
                        />
                    </FormControl>
                    <FormLabel className="ml-2">Subscribe to our newsletter</FormLabel>
                    <FormMessage />
                </FormItem>
            </div>
            <div className="flex justify-between">
                <Button type="button" onClick={onBack}>
                    Previous
                </Button>
                <Button type="submit">
                    Submit
                </Button>
            </div>
        </form>
    );
};

export default StepReview;