import Header from "@repo/ui/components/header";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import Link from "next/link";


export default function Home() {

  const articles = [
    {
      id: 1,
      title: "AI in Web Development: Transforming the Future",
      description: "How artificial intelligence is reshaping modern web applications.",
      image: "/path-to-your-image.jpg",
      date: "March 2, 2025",
      link: "/blog/ai-in-web-development",
    },
    {
      id: 2,
      title: "The Rise of No-Code and Low-Code AI Platforms",
      description: "Exploring the power of AI-driven no-code development tools.",
      image: "/path-to-your-image.jpg",
      date: "February 25, 2025",
      link: "/blog/no-code-ai",
    },
    {
      id: 3,
      title: "Optimizing Business with AI-Driven Automation",
      description: "How AI automation is streamlining workflows and boosting productivity.",
      image: "/path-to-your-image.jpg",
      date: "February 18, 2025",
      link: "/blog/ai-driven-automation",
    },
  ]
  
  return (
<div>
<Header />
<section className="relative flex items-center justify-center min-h-[80vh] px-6 sm:px-12 lg:px-20">

      <div className="container relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="text-center lg:text-left">
          <h1 className="text-4xl font-extrabold text-primary sm:text-5xl md:text-6xl">
            Stay Ahead of the Curve with <span className="text-primary/70">AI Insights</span>
          </h1>
          <p className="mt-4 text-lg text-primary/50">
            Explore the latest trends in AI-driven development, automation, and digital transformation.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-4">
            <Button asChild size="lg">
              <Link href="/blog/latest">Read Latest Articles</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#categories">Browse Categories</Link>
            </Button>
          </div>
        </div>

        {/* Right Image */}
        <div className="w-full flex justify-center lg:justify-end">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" className="w-full max-w-md sm:max-w-lg lg:max-w-xl">
            <rect width="100%" height="100%" fill="#ddd" />
            <text
              x="400"
              y="300"
              textAnchor="middle"
              fill="#555"
              fontSize="48"
              fontFamily="Arial, sans-serif"
              fontWeight="bold"
            >
              Blog Image
            </text>
          </svg>
        </div>
      </div>
    </section>

    <section className="w-full py-12 md:py-24 lg:py-32">
  <div className="container px-4 md:px-6">
    <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
      {/* Left Content */}
      <div className="flex flex-col justify-center space-y-4">
        <div className="space-y-2">
          <Badge variant="outline" className="w-fit">Featured</Badge>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
            The Future of Web Development: AI-Driven Design
          </h1>
          <p className="max-w-[600px] text-muted-foreground md:text-xl">
            Exploring how artificial intelligence is revolutionizing the way we build and design websites in 2024 and beyond.
          </p>
        </div>
        <div className="flex flex-col gap-2 min-[400px]:flex-row">
          <Link href="/blog/ai-driven-design" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
            Read Article
          </Link>
        </div>
      </div>

      {/* Image without next/image */}
      <div className="flex justify-center lg:justify-end">
        <img
          src="/placeholder.jpg"
          alt="Featured blog post"
          width="550"
          height="550"
          className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
        />
      </div>
    </div>
  </div>
</section>

</div>
  )
}

