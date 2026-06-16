import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema } from '../../../../lmnas-turbo/packages/ui/src/components/multi-step-contact-form/schema/contact-schema';
import useMultiStepForm from '../../../../lmnas-turbo/packages/ui/src/components/multi-step-contact-form/hooks/useMultiStepForm';
import StepContactInfo from '../../../../lmnas-turbo/packages/ui/src/components/multi-step-contact-form/steps/StepContactInfo';
import StepDetails from '../../../../lmnas-turbo/packages/ui/src/components/multi-step-contact-form/steps/StepDetails';
import StepReview from '../../../../lmnas-turbo/packages/ui/src/components/multi-step-contact-form/steps/StepReview';
import { TContactFormValues } from '../../../../lmnas-turbo/packages/ui/src/components/multi-step-contact-form/types';

const steps = [
    StepContactInfo,
    StepDetails,
    StepReview,
];

const MultiStepContactForm: React.FC = () => {
    const methods = useForm<TContactFormValues>({
        resolver: zodResolver(contactSchema),
        mode: 'onTouched',
    });

    const { currentStep, nextStep, prevStep, isLastStep, handleSubmit } = useMultiStepForm(steps.length);

    const onSubmit = async (data: TContactFormValues) => {
        // Handle form submission logic here, including API calls and reCAPTCHA
        console.log(data);
    };

    const StepComponent = steps[currentStep];

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <StepComponent />
                <div className="flex justify-between mt-4">
                    {currentStep > 0 && (
                        <button type="button" onClick={prevStep} className="btn">
                            Previous
                        </button>
                    )}
                    <button type="submit" className="btn">
                        {isLastStep ? 'Submit' : 'Next'}
                    </button>
                </div>
                <div className="progress-indicator">
                    Step {currentStep + 1} of {steps.length}
                </div>
            </form>
        </FormProvider>
    );
};

export default MultiStepContactForm;