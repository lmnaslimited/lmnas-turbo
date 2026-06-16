import { useState } from 'react';
import type { FieldValues, UseFormTrigger } from 'react-hook-form';

/**
 * Manages step navigation for a multi-step form.
 *
 * The form values themselves are owned by the parent's react-hook-form instance
 * (the single source of truth); this hook only tracks the active step index and
 * validates the form before advancing.
 *
 * @param iTotalSteps total number of steps
 * @param iTrigger    optional react-hook-form `trigger` used to validate before advancing
 */
export const useMultiStepForm = <T extends FieldValues = FieldValues>(
    iTotalSteps: number,
    iTrigger?: UseFormTrigger<T>,
) => {
    const [currentStep, setCurrentStep] = useState(0);

    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === iTotalSteps - 1;

    const nextStep = async () => {
        const isValid = iTrigger ? await iTrigger() : true;
        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, iTotalSteps - 1));
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    return { currentStep, nextStep, prevStep, isFirstStep, isLastStep };
};

export default useMultiStepForm;
