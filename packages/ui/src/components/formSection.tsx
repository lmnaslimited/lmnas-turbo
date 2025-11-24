"use client";

import React from "react";
import { useFormHandler } from "../lib/useFormHandler";

type FormSectionProps = {
  sectionId: string;
  children: React.ReactElement<Record<string, unknown>>;
};

export default function FormSection({ sectionId, children }: FormSectionProps) {
  const { fnHandleFormButtonClick, fnRenderFormBelowSection, LdSectionRefs } =
    useFormHandler();

  const childWithProps = React.cloneElement(children, {
    fnHandleFormButtonClick,
    sectionId,
  });

  return (
    <div ref={LdSectionRefs(sectionId)}>
      {childWithProps}
      {fnRenderFormBelowSection(sectionId)}
    </div>
  );
}
