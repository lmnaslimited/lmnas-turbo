# Multi-Step Contact Form

This document provides an overview of the Multi-Step Contact Form component, including its purpose, usage instructions, and examples.

## Overview

The Multi-Step Contact Form is designed to enhance user experience by breaking down the contact form into manageable steps. This approach allows users to fill out the form progressively, reducing cognitive load and improving completion rates. The form integrates seamlessly with existing business logic, including validation, API calls, and reCAPTCHA functionality.

## Features

- **Multi-Step Navigation**: Users can navigate through the form in steps, with a maximum of 2 fields displayed per step.
- **Validation**: Each step includes validation for the fields, ensuring that users provide the necessary information before proceeding.
- **Progress Indicators**: Visual indicators show users their progress through the form.
- **Integration**: The form integrates with existing API calls and business logic, including newsletter subscriptions and error handling.
- **Responsive Design**: The form adheres to the existing design system and conventions, ensuring a consistent look and feel.

## Usage

To use the Multi-Step Contact Form, import the component and include it in your application as follows:

```tsx
import { MultiStepContactForm } from './components/multi-step-contact-form';

const App = () => {
    return (
        <div>
            <h1>Contact Us</h1>
            <MultiStepContactForm />
        </div>
    );
};

export default App;
```

## Steps Overview

The Multi-Step Contact Form consists of the following steps:

1. **Step 1: Contact Information**
   - Fields: Full Name, Company Email Address
   - Validation: Ensures that both fields are filled out correctly.

2. **Step 2: Additional Details**
   - Fields: Company Name, Phone Number
   - Validation: Ensures that both fields are filled out correctly.

3. **Step 3: Review**
   - Fields: Message, Newsletter Subscription Checkbox
   - Validation: Ensures that the message field is filled out.

## Customization

You can customize the form by modifying the validation schema located in `schema/contact-schema.ts`. Adjust the fields and validation rules as necessary to fit your requirements.

## Conclusion

The Multi-Step Contact Form is a powerful tool for improving user engagement and ensuring that all necessary information is collected efficiently. By following the usage instructions and leveraging the existing validation and API integration, you can easily implement this component in your application.