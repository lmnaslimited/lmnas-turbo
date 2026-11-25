"use client";

import { useEffect } from "react";
import Link from "next/link";
import styles from "./product-architecture.module.css";
import { Button } from "@repo/ui/components/ui/button";
import type { ReactNode } from "react";

import type {
  TformMode,
  TproductArchitectureSection,
} from "@repo/middleware/types";

type TproductArchitectureProps = {
  idData: TproductArchitectureSection[];
  activeFormSection: string | null;
  onFormButtonClick: (
    mode: TformMode,
    sectionId: string,
    label: string,
  ) => void;
renderFormBelowSection: (sectionId: string) => ReactNode;  onFormClose: () => void;
};

export default function ProductArchitecture({
  idData,
  activeFormSection,
  onFormButtonClick,
  renderFormBelowSection,
  onFormClose,
}: TproductArchitectureProps) {
  
  // Close the Product Architecture form when clicking outside it.
  useEffect(() => {
    if (!activeFormSection?.startsWith("productArchitecture-")) {
      return;
    }

    const handleOutsideClick = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) return;

      // Do not close when clicking inside the form.
      if (target.closest("[data-product-architecture-form]")) {
        return;
      }

      // Allow product CTA clicks to be handled by their own click handlers.
      if (target.closest("[data-product-architecture-trigger]")) {
        return;
      }

      onFormClose();
    };

    document.addEventListener("pointerdown", handleOutsideClick);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
    };
  }, [activeFormSection, onFormClose]);

  return (
    <section className={styles.section}>
      <div className="container mx-auto px-4">
        <div className={styles.content}>
          {idData?.map((category, categoryIndex) => {
            const sectionId = `productArchitecture-${categoryIndex}`;

            return (
              <div className={styles.category} key={category.category}>
                <h3 className={styles.categoryTitle}>
                  {category.category}
                </h3>

                <div className={styles.products}>
                  {category.products?.map((product) => (
                    <div className={styles.product} key={product.title}>
                      <div className={styles.productInfo}>
                        <h4 className={styles.productTitle}>
                          {product.href ? (
                            <Link href={product.href}>
                              {product.title}
                            </Link>
                          ) : (
                            product.title
                          )}
                        </h4>

                        <p className={styles.productSubtitle}>
                          {product.subtitle}
                        </p>

                        {product.buttons?.length > 0 && (
                          <div className={styles.productButtons}>
                            {product.buttons.map((button, buttonIndex) =>
                              button.href ? (
                                <Button
                                  key={buttonIndex}
                                  asChild
                                  size="sm"
                                  variant={button.variant ?? "default"}
                                >
                                  <Link href={button.href}>
                                    {button.label}
                                  </Link>
                                </Button>
                              ) : (
                                <Button
                                  key={buttonIndex}
                                  size="sm"
                                  variant={button.variant ?? "default"}
                                  data-product-architecture-trigger
                                  onClick={() => {
                                    if (button.formMode) {
                                      onFormButtonClick(
                                        button.formMode,
                                        sectionId,
                                        button.label ?? "Request Demo",
                                      );
                                    }
                                  }}
                                >
                                  {button.label}
                                </Button>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Render the form immediately below its category */}
                {activeFormSection === sectionId && (
                  <div data-product-architecture-form>
                    {renderFormBelowSection(sectionId)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}