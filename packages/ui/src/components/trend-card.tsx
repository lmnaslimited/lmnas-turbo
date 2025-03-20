import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Badge } from "@repo/ui/components/ui/badge"
import { Youtube, Linkedin, Twitter } from "lucide-react"
import Image from "next/image"

type TrendSource = "LinkedIn" | "YouTube" | "Twitter"

interface TrendCardProps {
  title: string
  description: string
  source: TrendSource
  imageUrl?: string
  author?: string
  date: string
}

export function TrendCard({ title, description, source, imageUrl, author, date }: TrendCardProps) {
  const getIcon = (source: TrendSource) => {
    switch (source) {
      case "LinkedIn":
        return <Linkedin className="h-4 w-4" />
      case "YouTube":
        return <Youtube className="h-4 w-4" />
      case "Twitter":
        return <Twitter className="h-4 w-4" />
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="flex items-center gap-1">
            {getIcon(source)}
            {source}
          </Badge>
          <CardDescription>{date}</CardDescription>
        </div>
        <CardTitle className="line-clamp-2">{title}</CardTitle>
      </CardHeader>
      {imageUrl && (
        <div className="relative h-48 w-full">
          <Image src={imageUrl || "/placeholder.svg"} alt={title} layout="fill" objectFit="cover" />
        </div>
      )}
      <CardContent className="p-4">
        <CardDescription className="line-clamp-3">{description}</CardDescription>
        {author && <p className="mt-2 text-sm font-medium">By {author}</p>}
      </CardContent>
    </Card>
  )
}

