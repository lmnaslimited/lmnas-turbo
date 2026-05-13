<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the `apps/braccoli-site-2.0` Next.js 15.1 App Router application. PostHog is initialized client-side inside the existing `ClientLayout` component (which already manages RudderStack), so there is no new wrapper component or structural change to the app. A reverse proxy is configured in `next.config.ts` so PostHog requests route through `/ingest` to avoid tracking blockers. A server-side PostHog helper (`posthog-server.ts`) is ready for future server-side event capture.

## Changes made

| File | Change |
|------|--------|
| `apps/braccoli-site-2.0/package.json` | Added `posthog-js` and `posthog-node` dependencies |
| `apps/braccoli-site-2.0/.env.local` | Added `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` |
| `apps/braccoli-site-2.0/next.config.ts` | Added `/ingest/*` reverse proxy rewrites + `skipTrailingSlashRedirect: true` |
| `apps/braccoli-site-2.0/app/components/client-layout.tsx` | Initialized PostHog via `useEffect` alongside existing RudderStack setup |
| `apps/braccoli-site-2.0/app/lib/posthog-server.ts` | Created server-side PostHog client factory (`getPostHogClient`) |
| `apps/braccoli-site-2.0/app/hooks/form-handler.tsx` | Added `form_opened` and `form_submitted` events |
| `apps/braccoli-site-2.0/app/[locale]/contact/contact.tsx` | Added `contact_form_submitted` and `booking_form_submitted` events |
| `apps/braccoli-site-2.0/app/[locale]/pricing/pricing.tsx` | Added `pricing_plan_selected` event with plan name and index |
| `apps/braccoli-site-2.0/app/[locale]/career/career.tsx` | Added `job_apply_clicked` (with job title/role/location) and `job_search_performed` (debounced) |
| `apps/braccoli-site-2.0/app/[locale]/solutions/[slug]/casestudy.tsx` | Added `case_study_download_requested` event |

## Events instrumented

| Event name | Description | File |
|---|---|---|
| `form_opened` | Fired when a user clicks any CTA button that opens a form panel | `app/hooks/form-handler.tsx` |
| `form_submitted` | Fired when any form is successfully submitted | `app/hooks/form-handler.tsx` |
| `contact_form_submitted` | Fired when the contact form on the Contact page is submitted | `app/[locale]/contact/contact.tsx` |
| `booking_form_submitted` | Fired when the booking/demo form on the Contact page is submitted | `app/[locale]/contact/contact.tsx` |
| `pricing_plan_selected` | Fired when a user clicks a Get Started/Contact Sales button for a pricing plan | `app/[locale]/pricing/pricing.tsx` |
| `job_apply_clicked` | Fired when a user clicks the Apply button on a job card | `app/[locale]/career/career.tsx` |
| `job_search_performed` | Fired (debounced 1s) when a user types in the job search box | `app/[locale]/career/career.tsx` |
| `case_study_download_requested` | Fired when a user opens the download form on a case study page | `app/[locale]/solutions/[slug]/casestudy.tsx` |

## Next steps

We've built a dashboard and 5 insights for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard – Analytics basics**: https://eu.posthog.com/project/174946/dashboard/668750
- **Form Conversion Funnel** (form_opened → form_submitted): https://eu.posthog.com/project/174946/insights/eM5FyYQK
- **Pricing Plan Interest by Plan** (pricing_plan_selected breakdown): https://eu.posthog.com/project/174946/insights/d2oz9Zlp
- **Contact & Booking Submissions Over Time** (daily trend): https://eu.posthog.com/project/174946/insights/gTS74LPJ
- **Job Apply Clicks by Role** (job_apply_clicked breakdown): https://eu.posthog.com/project/174946/insights/go6nkL73
- **Case Study Download Requests Over Time** (daily trend): https://eu.posthog.com/project/174946/insights/B4MwrrR6

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
