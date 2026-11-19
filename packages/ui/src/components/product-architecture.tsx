"use client";

import Link from "next/link";
import styles from "./product-architecture.module.css";

import { Button } from "@repo/ui/components/ui/button";
import { getIconComponent } from "@repo/ui/lib/icon";

import { DynamicIcon } from "lucide-react/dynamic";

import type {
  Tbutton,
  TformMode,
  TproductArchitectureSection,
} from "@repo/middleware/types";

type TproductArchitectureProps = {
  data: TproductArchitectureSection[];
  onFormButtonClick: (mode: TformMode, label: string) => void;
};

export default function ProductArchitecture({
  data,
  onFormButtonClick,
}: TproductArchitectureProps) {
const renderIcon = (icon: Tbutton["icon"]) => {
  const LIconName = typeof icon === "string" ? icon : "HelpCircle";
  const IconComponent = getIconComponent(LIconName);

  return <IconComponent className="h-4 w-4" />;
};

  return (
    <section className={styles.section}>
      <div className="container mx-auto px-4">
        <div className={styles.content}>
          {data?.map((category, categoryIndex) => (
            <div className={styles.category} key={categoryIndex}>
              <h3 className={styles.categoryTitle}>
                {category.category}
              </h3>

              <div className={styles.products}>
                {category.products?.map((product, productIndex) => (
                  <div className={styles.product} key={productIndex}>
                    {product.badge && (
                      <div className={styles.productIcon}>
                        <DynamicIcon
                          name={product.badge as any}
                          size={24}
                          strokeWidth={1.7}
                        />
                      </div>
                    )}

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
                          {product.buttons.map((button, buttonIndex) => (
                            button.href ? (
                              <Button
                                key={buttonIndex}
                                asChild
                                size="sm"
                                variant={button.variant ?? "default"}
                              >
                                <Link href={button.href}>
                                  {button.label}
                                  {renderIcon(button.icon)}
                                </Link>
                              </Button>
                            ) : (
                              <Button
                                key={buttonIndex}
                                size="sm"
                                variant={button.variant ?? "default"}
                                onClick={() => {
                                  if (button.formMode) {
                                    onFormButtonClick(
                                      button.formMode,
                                      button.label ?? "Request Demo"
                                    );
                                  }
                                }}
                              >
                                {button.label}
                                {renderIcon(button.icon)}
                              </Button>
                            )
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}