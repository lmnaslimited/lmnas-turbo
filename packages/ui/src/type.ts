import * as LucideIcons from "lucide-react"
import { z } from "zod"

export type Titems = {
  question: string
  answer: string
  icon?: keyof typeof LucideIcons | React.ReactNode
}
export type Theader = {
  textWithoutColor?: string
  badge?: string
  text?: string;
  subtitle?: string
  className?: string
  headingClass?: string
  descripClass?: string
}
export type Tbutton = {
  label: string;
  href?: string;
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive" | "link";
  size?: "default" | "sm" | "lg" | "icon"
  icon?: React.ReactNode | keyof typeof LucideIcons
  iconPosition?: "before" | "after";
  className?: string
  formMode?: "booking" | "contact" | "download"
}
export type Timage = {
  src?: string
  alt: string
  aspectRatio?: "square" | "video" | "wide" | "auto"
  width?: string
  height?: string
  svg?: React.ReactNode
}

//component
export type TcalloutProps = {
  header: Theader
  buttons: Tbutton[]
  points?: {
    title: string
    items?: string[]
    actionText: string
  }
  variant?: string
  layout?: "classic" | "simple" | string
};
//component
export type TcardProps = {
  image?: Timage
  header: Theader
  button?: Tbutton[]
  link?: Tbutton[]
  list?: {
    icon?: React.ReactNode | keyof typeof LucideIcons;
    text: string;
    subtitle?: string;
  }[];
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
  buttonPosition?: string
  category?: string
}
//component
export type TlogoShowcaseProps = {
  logos: Timage[]
  variant: "marquee" | "grid"
  className?: string
  logoSize?: "small" | "medium" | "large"
  speed?: "slow" | "medium" | "fast" | number
  spacing?: "tight" | "normal" | "loose" | string
  logosPerRow?: number
  pauseOnHover?: boolean
  dimensions?: { width: number; height: number }
}

//componnet
export type TfeatureProps = {
  buttonPosition?: "header" | "bottom-left" | "bottom-center" | "bottom-right";
  layout?: "classic" | "centered";
  iShowButton?: boolean;
  header: Theader;
  button?: Tbutton
  items?: Titems[]
}

//component
export type TheroProps = {
  heading: Theader;
  items?: {
    icon: React.ReactNode | keyof typeof LucideIcons
    item: string
  }[];
  description?: string;
  buttons: Tbutton[];
  image: Timage;
}

//component
export type TtrendSource = "LinkedIn" | "YouTube" | "Twitter"

export type TtrendCardProps = {
  title: string
  description: string
  source: TtrendSource
  imageUrl?: string
  author?: string
  date: string
}


// Form types
export type TformMode = "booking" | "contact" | "download" | null

export type TfieldType = "text" | "email" | "phone" | "textarea" | "select" | "date" | "timezone" | "timeslot" | "checkbox"

export type TformFieldConfig = {
  name: string
  label?: string
  placeholder?: string
  type: TfieldType
  required?: boolean
  options?: { value: string; label: string }[]
  className?: string
  inputClassName?: string
}

export type TformConfig = {
  title: string
  description?: string
  fields: TformFieldConfig[]
  submitText: string
  schema: z.ZodObject<any>
  successMessage: string
  showTerms?: boolean
  termsText?: string
  privacyText?: string
}

export type TdynamicFormProps = {
  config: TformConfig
  onSuccess: (data: any, message: string) => void
  onCancel?: () => void
  className?: string
  defaultValues?: Record<string, any>
}