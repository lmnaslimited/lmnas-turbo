import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { CalendarIcon } from "lucide-react"

interface BlogCardProps {
  title: string
  excerpt: string
  date: string
  slug: string
}

export default function BlogCard({ title, excerpt, date, slug }: BlogCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{excerpt}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarIcon className="mr-1 h-4 w-4" />
          {date}
        </div>
        <a href={`/blog/${slug}`} className="text-primary hover:underline">
          Read more
        </a>
      </CardFooter>
    </Card>
  )
}

