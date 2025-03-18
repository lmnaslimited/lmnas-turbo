"use client"

import React, { useState } from "react"
import { Button } from "@repo/ui/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@repo/ui/components/ui/tabs"
import { ArrowRight } from "lucide-react"

export default function Tab({ data, renderItem }: { data: any[], renderItem: (item: any, index: number) => React.ReactNode }) {
  const [VisibleCount  , fnSetVisibleCount] = useState(4)

  const LaCategories = Array.from(new Set(data.map((item) => item.category)))

  const fnShowMoreItems = () => {
    fnSetVisibleCount(data.length)
  }

  return (
    <section className="py-10">
      <div className="container px-4 md:px-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8 md:gap-0 gap-4">
            <TabsTrigger value="all">All</TabsTrigger>
            {LaCategories.map((iCategory) => (
              <TabsTrigger key={iCategory} value={iCategory}>
                {iCategory.charAt(0).toUpperCase() + iCategory.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mt-4">
              {data.slice(0, VisibleCount).map(renderItem)}
            </div>
            {VisibleCount < data.length && (
              <div className="mt-8 text-center">
                <Button onClick={fnShowMoreItems} size="lg" variant="outline">
                  Show More <ArrowRight className="size-5"/>
                </Button>
              </div>
            )}
          </TabsContent>

          {LaCategories.map((iCategory) => (
            <TabsContent key={iCategory} value={iCategory}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                {data.filter((idItem) => idItem.category === iCategory).map(renderItem)}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
