"use client";
import { ReactElement, useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@repo/ui/components/ui/tabs";
import CustomCard from "@repo/ui/components/customCard";
import { ArrowRight } from "lucide-react";
import { TcardProps } from "@repo/middleware";

type TtabProps = {
  data: TcardProps[]
  TabDefault: { text: string, label: string }
}

export default function Tab({ idTab }: { idTab: TtabProps }): ReactElement {
  const [VisibleCount, fnSetVisibleCount] = useState(4);

  // Extract unique categories from the provided data, defaulting to "uncategorized" if a category is missing
  const Lacategories = Array.from(
    new Set(idTab.data.map((idItem) => idItem.category ?? "uncategorized"))
  );

  // Function to show all available items when "Show More" button is clicked
  const fnShowMoreItems = (): void => {
    fnSetVisibleCount(idTab.data.length);
  };

  return (
    <section className="py-10">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className={`grid grid-cols-2 md:grid-cols-${Math.min(Lacategories.length + 1, 6)} mb-8 md:gap-0 gap-4`}>
          <TabsTrigger value="all">{idTab.TabDefault.text}</TabsTrigger>
          {Lacategories.map((iCategory) => (
            <TabsTrigger key={iCategory} value={iCategory}>
              {iCategory.charAt(0).toUpperCase() + iCategory.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Content for the "All" tab, displaying limited items initially */}
        <TabsContent value="all">
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mt-4">
            {idTab.data.slice(0, VisibleCount).map((idItem, iIndex) => (
              <CustomCard key={iIndex} idCardProps={idItem} />
            ))}
          </div>
          {VisibleCount < idTab.data.length && (
            <div className="mt-8 text-center">
              <Button onClick={fnShowMoreItems} size="lg" variant="outline">
                {idTab.TabDefault.label} <ArrowRight className="size-5" />
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Generate content for each category tab */}
        {Lacategories.map((iCategory) => (
          <TabsContent key={iCategory} value={iCategory}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 mt-4 gap-6">
              {idTab.data
                .filter((idItem) => (idItem.category ?? "uncategorized") === iCategory)
                .map((idItem, iIndex) => (
                  <CustomCard key={iIndex} idCardProps={idItem} />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
