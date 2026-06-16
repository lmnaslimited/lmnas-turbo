"use client"

import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema } from "./schema/contact-schema";
import { useMultiStepForm } from "./hooks/useMultiStepForm";
import StepContactInfo from '@repo/ui/components/steps/StepContactInfo';
import StepDetails from '@repo/ui/components/steps/StepDetails';
import StepReview from '@repo/ui/components/steps/StepReview';
import { TContactFormValues } from '@repo/middleware/types';

const steps: React.FC[] = [
    StepContactInfo,
    StepDetails,
    StepReview,
];

const MultiStepContactForm: React.FC = () => {
    const methods = useForm<TContactFormValues>({
        resolver: zodResolver(contactSchema),
        mode: 'onTouched',
    });

    const { currentStep, nextStep, prevStep, isLastStep } = useMultiStepForm(
        steps.length,
        methods.trigger,
    );

    const onSubmit = async (data: TContactFormValues) => {
        // Handle form submission logic here, including API calls and reCAPTCHA
        console.log(data);
    };

    const StepComponent = steps[currentStep] ?? steps[0];

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
                {StepComponent ? <StepComponent /> : null}
                <div className="flex justify-between mt-4">
                    {currentStep > 0 && (
                        <button type="button" onClick={prevStep} className="btn">
                            Previous
                        </button>
                    )}
                    {isLastStep ? (
                        <button type="submit" className="btn">
                            Submit
                        </button>
                    ) : (
                        <button type="button" onClick={nextStep} className="btn">
                            Next
                        </button>
                    )}
                </div>
                <div className="progress-indicator">
                    Step {currentStep + 1} of {steps.length}
                </div>
            </form>
        </FormProvider>
    );
};

export default MultiStepContactForm;
