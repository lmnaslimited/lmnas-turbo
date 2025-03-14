import * as LucideIcons from "lucide-react"
export type Titems = {
    question: string
    answer: string
    icon?: keyof typeof LucideIcons
}
export type Theader={
    textWithoutColor?:string
    badge?:string
    text?: string;
    subtitle?:string
    className?:string
    headingClass?:string
    descripClass?:string
}
export type Tbutton={
    label: string;
    href?:string;
    variant?: "default" | "outline" | "ghost" | "secondary" | "destructive" | "link";
    size?: "default" | "sm" | "lg" | "icon"
    icon?: React.ReactNode | keyof typeof LucideIcons
    iconPosition?: "before" | "after";
    className?:string
}
export type Timage ={
    src?: string
    alt: string
    aspectRatio?: "square" | "video" | "wide" | "auto"
    width?:string
    height?:string
    svg?: React.ReactNode
}

export type Tfeature = {
    header: Theader;
    button?:Tbutton
    items?:Titems[]
}
//component
export type TcalloutProps = {
    header: Theader
    buttons: Tbutton[]
    points?:{
      title:string
      items?:string[]
      actionText:string
    }
    variant?:string
};
//component
export type TcardProps = {
    image?: Timage
    header:Theader
    button?: Tbutton[]
    link?: Tbutton[]
    avatar?: Timage
    nameAndPlace?: {
      name: string
      place?: string
    }
    namePosition?: "top" | "bottom" | "left" | "right"
    footerClassName?: string
    tag?: string
    layout?: "vertical" | "horizontal"
    width?: "full" | "compact"
    onClick?: () => void
    className?: string
    buttonPosition?:string
}
//component
export type TlogoShowcaseProps = {
  logos: Timage[]
  variant: "marquee" | "grid"
  className?: string
  logoSize?: "small" | "medium" | "large"
  speed?: "slow" | "medium" | "fast"
  spacing?: "tight" | "normal" | "loose"
  logosPerRow?: number
  pauseOnHover?: boolean
}

//componnet
export type TfeatureProps = {
    buttonPosition?: "header" | "bottom-left" | "bottom-center" | "bottom-right";
    layout?: "classic" | "centered";
    iShowButton?: boolean;
    iFeature:Tfeature
  }

//component
export type TheroProps = {
    heading: Theader;
    buttons: Tbutton[]
  }