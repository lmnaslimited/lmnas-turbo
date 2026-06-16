import type { TformConfig, TformFieldConfig } from "@repo/middleware/types"

/**
 * A step in the multi-step contact form. Steps are derived at runtime from the
 * Strapi field configuration (chunked into groups), so nothing here is hardcoded.
 */
export type TresolvedContactStep = {
  id: string
  fields: TformFieldConfig[]
}

/**
 * Props for the multi-step Contact form. Intentionally mirrors the relevant
 * subset of the shared form's props (`TdynamicFormProps`) so the Contact page
 * integration stays a drop-in replacement.
 *
 * `config` is the exact same `TformConfig` object the shared <SectionForm />
 * receives, so validation schema, payload structure and copy stay identical.
 */
export type TdynamicContactFormProps = {
  config: TformConfig
  onSuccess: (message: string, title: string) => void
  onSuccessfulSubmit?: (payload: {
    formData: Record<string, unknown>
    formId: string
    formTitle?: string
    source?: string
    meta?: Record<string, unknown>
  }) => void | Promise<void>
  className?: string
  defaultValues?: Record<string, unknown>
}
