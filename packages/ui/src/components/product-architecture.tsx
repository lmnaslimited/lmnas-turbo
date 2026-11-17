"use client";
//import styles from csss modules files
import styles from "./product-architecture.module.css";
import { DynamicIcon } from "lucide-react/dynamic";
import type { TproductArchitectureSection } from "@repo/middleware/types";

type TproductArchitectureProps = {
  data: TproductArchitectureSection[];
};

export default function ProductArchitecture({
  data,
}: TproductArchitectureProps) {
  return (
    <section className={styles.section}>
      <div className="container mx-auto px-4">
        <div className={styles.content}>
          {data?.map((category, categoryIndex) => (
            <div className={styles.category} key={categoryIndex}>
              <h3 className={styles.categoryTitle}>{category.category}</h3>

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
                      <h4 className={styles.productTitle}>{product.title}</h4>

                      <p className={styles.productSubtitle}>
                        {product.subtitle}
                      </p>
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
