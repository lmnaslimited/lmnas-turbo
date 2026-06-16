import type { TformFieldConfig } from "@repo/middleware/types"
import type { TresolvedContactStep } from "./contact-form.types"

/**
 * Maximum number of fields rendered per step in the multi-step contact form.
 */
export const FIELDS_PER_STEP = 2

/**
 * Builds the multi-step layout purely from the field configuration coming from
 * Strapi. No field names are hardcoded: the fields are taken in the exact order
 * Strapi returns them and chunked into steps of `FIELDS_PER_STEP` fields each.
 *
 * This keeps the form fully CMS-driven — adding, removing or reordering a field
 * in Strapi automatically reshapes the steps with no code change.
 */
export function fnResolveContactSteps(
  iaFields: TformFieldConfig[],
  iFieldsPerStep: number = FIELDS_PER_STEP,
): TresolvedContactStep[] {
  const LaResolved: TresolvedContactStep[] = []
  const LSize = Math.max(1, iFieldsPerStep)

  for (let LIndex = 0; LIndex < iaFields.length; LIndex += LSize) {
    LaResolved.push({
      id: `step-${LIndex / LSize + 1}`,
      fields: iaFields.slice(LIndex, LIndex + LSize),
    })
  }

  return LaResolved
}
