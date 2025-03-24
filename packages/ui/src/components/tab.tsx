"use client";

import { ReactElement, useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@repo/ui/components/ui/tabs";
import { ArrowRight } from "lucide-react";
import CustomCard from "@repo/ui/components/customCard";
import { TcardProps } from "@repo/ui/type";
type TtabProps = {
  data: TcardProps[]
  TabDefault: {text:string, label:string}
}
export default function Tab({ idTab }: { idTab:TtabProps }):ReactElement {
  const [VisibleCount, fnSetVisibleCount] = useState(4);

  // Ensure categories are always strings
  const Lacategories = Array.from(
    new Set(idTab.data.map((idItem) => idItem.category ?? "uncategorized"))
  );

  const fnShowMoreItems = ():void => {
    fnSetVisibleCount(idTab.data.length);
  };

  return (
    <section className="py-10">
      <div className="container px-4 md:px-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8 md:gap-0 gap-4">
            <TabsTrigger value="all">{idTab.TabDefault.text}</TabsTrigger>
            {Lacategories.map((iCategory) => (
              <TabsTrigger key={iCategory} value={iCategory}>
                {iCategory.charAt(0).toUpperCase() + iCategory.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

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

          {Lacategories.map((iCategory) => (
            <TabsContent key={iCategory} value={iCategory}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                {idTab.data
                  .filter((idItem) => (idItem.category ?? "uncategorized") === iCategory)
                  .map((idItem, iIndex) => (
                    <CustomCard key={iIndex} idCardProps={idItem} />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
