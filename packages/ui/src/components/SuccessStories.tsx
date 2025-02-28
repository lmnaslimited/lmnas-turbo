import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card"

const successStories = [
  {
    company: "TechManufacture Inc.",
    result: "Reduced production delays by 40%",
    quote:
      "LMNAs ERP has revolutionized our operations. We now have full visibility across our entire production process.",
  },
  {
    company: "PrecisionParts Co.",
    result: "Increased revenue by 25%",
    quote:
      "The seamless integration between sales and production has allowed us to take on more orders with confidence.",
  },
  {
    company: "GlobalGoods Manufacturing",
    result: "Improved on-time delivery by 60%",
    quote: "LMNAs ERP's predictive analytics have been a game-changer for our supply chain management.",
  },
]

export default function SuccessStories() {
  return (
    <section className="py-12 bg-white" id="success-stories">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Success Stories</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Trusted by Manufacturers to Drive Results
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            See how LMNAs ERP has transformed manufacturing operations for our clients.
          </p>
        </div>

        <div className="mt-10">
          <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
            {successStories.map((story, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{story.company}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-primary">{story.result}</p>
                  <p className="mt-2 text-gray-500">&quot;{story.quote}&quot;</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

