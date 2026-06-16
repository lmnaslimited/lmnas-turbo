# lmnas-turbo

## Project Overview

This project is a multi-step dynamic contact form implementation designed to enhance user experience while maintaining existing functionality. The form is built using React and TypeScript, leveraging the power of React Hook Form for state management and Zod for validation.

## Features

- **Multi-Step Navigation**: The form is divided into multiple steps, each containing a maximum of two fields, allowing users to focus on one section at a time.
- **Validation**: Each step includes validation logic to ensure that user inputs meet the required criteria before proceeding to the next step.
- **API Integration**: The form integrates with existing business logic for form submission, including payload structure and reCAPTCHA implementation.
- **Newsletter Subscription**: Users have the option to subscribe to a newsletter upon form submission.
- **Progress Indicators**: Visual indicators guide users through the steps of the form, enhancing usability.
- **Responsive Design**: The form adheres to the existing design system and conventions, ensuring a consistent look and feel across the application.

## Directory Structure

```
lmnas-turbo
├── package.json
├── tsconfig.json
├── README.md
├── packages
│   └── ui
│       ├── package.json
│       └── src
│           └── components
│               ├── form.tsx
│               └── multi-step-contact-form
│                   ├── index.ts
│                   ├── MultiStepContactForm.tsx
│                   ├── types.ts
│                   ├── README.md
│                   ├── schema
│                   │   └── contact-schema.ts
│                   ├── hooks
│                   │   └── useMultiStepForm.ts
│                   └── steps
│                       ├── StepContactInfo.tsx
│                       ├── StepDetails.tsx
│                       └── StepReview.tsx
```

## Installation

To install the project dependencies, run:

```
npm install
```

## Usage

To use the multi-step contact form, import the `MultiStepContactForm` component from the `multi-step-contact-form` directory and include it in your application. Ensure that you have the necessary API endpoints set up for form submission.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.