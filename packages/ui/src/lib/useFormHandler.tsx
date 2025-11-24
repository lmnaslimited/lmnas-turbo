"use client"

import type React from "react"
import { CheckCircle, X } from "lucide-react"
import { useParams } from 'next/navigation';
import { Button } from "@repo/ui/components/ui/button"
import { SectionForm} from "@repo/ui/components/form"
import { useState, useRef, type ReactNode, useEffect } from "react"
import {  TformMode,  TcaseStudies,  TtrendCardProps,  TformConfig } from "@repo/middleware/type"
import { generateSchemaFromFields } from '@repo/ui/lib/zodTransformation'

type OptionalRenderParams = {
    idData?: TtrendCardProps;
    idPdfData?: TcaseStudies;
  };

export const useFormHandler = () => {

    const LdParams = useParams();
    const Locale = LdParams.locale as string;
    
    //state variable to store the fetched form data
    const [PageData, fnSetPageData] = useState<TformConfig[] | null>(null);

    //useeffect to call the form api
    //to get the form configuration from the strapi
    useEffect(() => {
        const fnFetchData = async () => {
            try {
            //call the form data from strapi
              const LdGetFormsConfig = await fetch(`/api/forms?locale=${Locale}`);
              const LdFormsConfig = await LdGetFormsConfig.json();
              //generate the schema dynamically based on incoming fields
              const LdFormsSchema = LdFormsConfig.forms.map((form: TformConfig) => ({
                ...form,
                schema: generateSchemaFromFields(form.fields || []),
              }))
              fnSetPageData(LdFormsSchema);
            } catch (err) {
              console.error('Client fetch error:', err);
            }
          };
      
          fnFetchData();
    },[Locale])

    const [ActiveSection, fnSetActiveSection] = useState<string | null>(null)
    const [FormMode, fnSetFormMode] = useState<TformMode>(null)
    const [FormTitle, fnSetFormTitle] = useState<string | null>(null)
    const [SuccessMessage, fnSetSuccessMessage] = useState<{ message: string; section: string; title: string } | null>(
        null,
    )
    const RefStore = useRef<Record<string, React.RefObject<HTMLDivElement>>>({})
    const FormRef = useRef<HTMLDivElement>(null)

    const LdSectionRefs = (key: string): React.RefObject<HTMLDivElement> => {
        if (!RefStore.current[key]) {
            RefStore.current[key] = { current: null } as unknown as React.RefObject<HTMLDivElement>
        }

        return RefStore.current[key]
    }

    /**
     * Handles clicks on form buttons throughout the page.
     * This function toggles forms on and off and scrolls to the appropriate section.
     * If the same button is clicked twice, it closes the form.
     */
    const fnHandleFormButtonClick = (iMode: TformMode, iSectionId: string, iFormTitle?:string) => {
        if (ActiveSection === iSectionId && FormMode === iMode && FormTitle === iFormTitle) {
            fnSetActiveSection(null)
            fnSetFormMode(null)
            fnSetFormTitle(null)
            fnSetSuccessMessage(null)
        } else {
            fnSetActiveSection(iSectionId)
            fnSetFormMode(iMode)
            fnSetFormTitle(iFormTitle ?? null)
            fnSetSuccessMessage(null)

            setTimeout(() => {
                if (FormRef.current) {
                    FormRef.current.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    })
                }
            }, 100)
        }
    }

    /**
     * Handles successful form submissions.
     * This function displays a success message in place of the form
     * and keeps track of which section the message belongs to.
     */
    const fnHandleFormSuccess = (iMessage: string, ititle: string) => {
        if (ActiveSection) {
            fnSetSuccessMessage({ message: iMessage, title: ititle, section: ActiveSection })

            setTimeout(() => {
                if (FormRef.current) {
                    FormRef.current.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    })
                }
            }, 100)
        }
        fnSetFormMode(null)
    }

    /**
     * Renders a form or success message below a specific section.
     * This function determines whether to show a form, success message, or nothing
     * based on the current state and section ID.
     */
    const fnRenderFormBelowSection = (iSectionId: string, idOptions: OptionalRenderParams = {}): ReactNode => {
        const { idData, idPdfData } = idOptions;
        const shouldShowForm = ActiveSection === iSectionId && FormMode !== null
        const shouldShowSuccess = SuccessMessage?.section === iSectionId

        if (!shouldShowForm && !shouldShowSuccess) return null
        
        const LdMatchedFormRecord = PageData?.find(record => record.formId === FormMode);

        if (!LdMatchedFormRecord && !shouldShowSuccess) return null;

        // Optionally override the title for webinar form
         const LdFormConfig = FormMode === "webinar"
            ? {
                ...LdMatchedFormRecord,
                title: idData?.title ?? LdMatchedFormRecord?.title ?? "Join Our Webinar – Register Now",
            }
            : {
                ...LdMatchedFormRecord,
                title: FormTitle ?? LdMatchedFormRecord?.title,
            }

        return (
            <div className="w-full bg-background py-8" ref={FormRef}>
                <div className="container mx-auto px-4">
                    {shouldShowSuccess ? (
                        <div className="max-w-lg mx-auto bg-background rounded-lg shadow-md p-4 text-center">
                            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                            <h3 className="text-xl font-bold mb-2">{SuccessMessage?.title}</h3>
                            <p className="mb-6">{SuccessMessage?.message}</p>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    fnSetSuccessMessage(null)
                                    fnSetActiveSection(null)
                                    setTimeout(() => {
                                        window.scrollTo({ top: 0, behavior: "smooth" })
                                    }, 300)
                                }}
                            >
                                <X />
                            </Button>
                        </div>
                    ) : LdFormConfig ? (
                        <SectionForm
                            config={LdFormConfig as TformConfig}
                            onSuccess={fnHandleFormSuccess}
                            onCancel={() => {
                                fnSetActiveSection(null)
                            }}
                            data={idData || null}
                            pdfData={idPdfData || null}
                        />
                    ) : null}
                </div>
            </div>
        )
    }

    return { fnHandleFormButtonClick, fnHandleFormSuccess, fnRenderFormBelowSection, LdSectionRefs, FormRef }
}