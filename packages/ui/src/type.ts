import * as LucideIcons from "lucide-react"
export type Titems = {
    question: string
    answer: string
    icon?: keyof typeof LucideIcons
}
export type Theader={
    textWithoutColor:string
    badge?:string
    text?: string;
    subtitle?:string
}
export type Tbutton={
    label: string;
    href?:string;
    variant?: "default" | "outline" | "ghost" | "secondary" | "destructive" | "link";
    size?: "default" | "sm" | "lg" | "icon"
}
export type Timage ={
    src?: string
    alt?: string
    aspectRatio?: "square" | "video" | "wide" | "auto"
    fallback?: string 
    width?:string
    height?:string
    svg?: React.ReactNode
}

//component
export type Tfeature = {
    header: Theader;
    button?:Tbutton
    items:Titems[]
}
//component
export type TcalloutProps = {
    header: Theader
    buttons: Tbutton[]
    points?:{
      title:string
      items:string[]
      actionText:string
    }
    variant?:string
};
//component
export type TcardProps = {
    image?: Timage
    title: string
    description: string
    button?: Tbutton[]
    link?: Tbutton[]
    avatar?: Timage
    nameAndPlace?: {
      name: string
      place?: string
    }
    namePosition?: "top" | "bottom" | "left" | "right"
    tags?: string[]
    layout?: "vertical" | "horizontal"
    width?: "full" | "compact"
    onClick?: () => void
    className?: string
}
//component
export type TlogoShowcaseProps = {
  logos: Timage[]
  variant: "marquee" | "carousel" | "grid"
  className?: string
  logoSize?: "small" | "medium" | "large"
  speed?: "slow" | "medium" | "fast"
  spacing?: "tight" | "normal" | "loose"
  logosPerRow?: number
  autoplay?: boolean
  autoplayInterval?: number
  pauseOnHover?: boolean
  showControls?: boolean
}