/*
 This component renders a tabbed interface to display categorized data.
  - Users can switch between tabs to view specific categories.
  - The "All" tab displays all items with a "Show More" button for additional items.
  - Each tab dynamically generates content based on provided data.
Props:
  - data: An array of objects where each object contains a category and content (ex: json of the card component).
  - renderItem: A function to render each item (this can be a card).
usage:
   <Tab
    data={cardContent}
    renderItem={(study, index) => (
      <CustomCard
        key={index}
        header={study.header}
        className=""
        image={{
          src: study.image,
          alt: study.alt,
          aspectRatio: "wide",
        }}
        button={[...study.button]}
        tag={study.category}
      />
    )}
  />
 */

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
