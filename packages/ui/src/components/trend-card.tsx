import Link from "next/link";
import Image from "next/image";
import { ReactElement, ReactNode } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Youtube, Linkedin, Twitter, Clipboard, ArrowRight } from "lucide-react";
import { TformMode, TtrendCardProps } from "@repo/middleware/types";

/**
 * Function to return the appropriate icon based on the source platform.
 */
const fnGetIcon = (iSource: string): ReactNode => {
  switch (iSource) {
    case "LinkedIn":
      return <Linkedin className="h-4 w-4" />;
    case "YouTube":
      return <Youtube className="h-4 w-4" />;
    case "Twitter":
      return <Twitter className="h-4 w-4" />;
    case "webinar":
      return <Clipboard className="h-4 w-4" />
    default:
      return <Clipboard className="h-4 w-4" />
  }
};

const fnGetPlatformUrl = (iSource: string, iId: string): string => {
  switch (iSource) {
    case "LinkedIn":
      return `https://www.linkedin.com/feed/update/${iId}`;
    case "YouTube":
      return `https://www.youtube.com/watch?v=${iId}`;
    case "Twitter":
      return `https://twitter.com/${iId}`;
    default:
      return "#";
  }
};

type TtrendsProps = {
  idTrends: TtrendCardProps
  onButtonClick?: (mode: TformMode, formTitle?: string) => void
}
export default function TrendCard({ idTrends, onButtonClick }: TtrendsProps): ReactElement {
  const LPlatformUrl = fnGetPlatformUrl(idTrends.source, idTrends.id);
  return (
    <Link href={LPlatformUrl}
      {...(LPlatformUrl !== "#" ? { target: "_blank", rel: "noopener noreferrer" } : {})} >
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
          <div className="relative w-full aspect-video mb-4">
            <Image
              className="absolute top-0 left-0 w-full h-full object-cover"
              src={idTrends.media.url}  // Image URL
              alt={idTrends.media.alt || "Media preview"}  // Image alt text (optional)
              width={800} // Provide width and height for Image component optimization
              height={450}
            />
          </div>
        )}

        <CardContent className="px-4">
          <div className="min-h-[80px]">{idTrends.description && (<CardDescription className="line-clamp-3">{idTrends.description}</CardDescription>)}</div>
          {idTrends.author && <p className="mt-2 text-sm font-medium">{idTrends.author}</p>}
          {idTrends.formMode && (
            <div className="py-2 mt-auto"><Button
              size="sm"
              onClick={() => onButtonClick?.(idTrends.formMode as TformMode, idTrends.title)}
            >
              {idTrends.btnLabel}
              <ArrowRight />
            </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}