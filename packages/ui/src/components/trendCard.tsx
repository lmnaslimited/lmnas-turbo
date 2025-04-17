import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { Youtube, Linkedin, Twitter } from "lucide-react";
import Image from "next/image";
import { TtrendCardProps } from "@repo/ui/type";
import { ReactElement, ReactNode } from "react";
import Link from "next/link";

/**
 * Function to return the appropriate icon based on the source platform.
 */
const fnGetIcon = (iSource: string):ReactNode => {
  switch (iSource) {
    case "LinkedIn":
      return <Linkedin className="h-4 w-4" />;
    case "YouTube":
      return <Youtube className="h-4 w-4" />;
    case "Twitter":
      return <Twitter className="h-4 w-4" />;
    default:
      return null;
  }
};

const fnGetPlatformUrl = (iSource: string, iId: string): string => {
  switch (iSource) {
    case "LinkedIn":
      return `https://www.linkedin.com/posts/${iId}`;
    case "YouTube":
      return `https://www.youtube.com/watch?v=${iId}`;
    case "Twitter":
      return `https://twitter.com/${iId}`;
    default:
      return "#";
  }
};

export default function TrendCard({ idTrends }: {idTrends:TtrendCardProps}):ReactElement {
  const LPlatformUrl = fnGetPlatformUrl(idTrends.source, idTrends.id);
  return (
    <Link href={LPlatformUrl} >
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="flex items-center gap-1">
            {fnGetIcon(idTrends.source)}
            {idTrends.source}
          </Badge>
          <CardDescription>{new Date(idTrends.publishedAt).toLocaleDateString()}</CardDescription>
        </div>
        <CardTitle className="line-clamp-2">{idTrends.title}</CardTitle>
      </CardHeader>

      {idTrends.media?.url && (
         <div className="relative w-full aspect-video">
         <Image
          className="absolute top-0 left-0 w-full h-full object-cover"
          src={idTrends.media.url}  // Image URL
          alt={idTrends.media.alt || "Media preview"}  // Image alt text (optional)
          width={800} // Provide width and height for Image component optimization
          height={450}
         />
       </div>
      )}

      <CardContent className="p-4">
        <CardDescription className="line-clamp-3">{idTrends.description}</CardDescription>
        <p className="mt-2 text-sm font-medium">{idTrends.author}</p>
      </CardContent>
    </Card>
    </Link>
  );
}