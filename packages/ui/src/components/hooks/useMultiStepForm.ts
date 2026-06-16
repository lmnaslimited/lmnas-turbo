import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema } from '../schema/contact-schema';
import type { ContactFormValues } from '../types';

export const useMultiStepForm = (onSubmit: (data: ContactFormValues) => Promise<void>) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<ContactFormValues>({} as ContactFormValues);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        getValues,
        trigger,
    } = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
        defaultValues: formData,
    });

    const nextStep = async () => {
        const isValid = await trigger();
        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, 2)); // Assuming 3 steps (0, 1, 2)
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const handleStepSubmit: SubmitHandler<ContactFormValues> = (data) => {
        setFormData((prev) => ({ ...prev, ...data }));
        if (currentStep === 2) {
            onSubmit({ ...formData, ...data });
        }
    };

    return {
        currentStep,
        nextStep,
        prevStep,
        handleStepSubmit: handleSubmit(handleStepSubmit),
        register,
        errors,
        setValue,
        getValues,
    };
};