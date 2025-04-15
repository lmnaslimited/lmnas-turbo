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
  svg?: React.ReactNode | keyof typeof LucideIcons
  position?: string
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
  onButtonClick?: (mode: TformMode) => void
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
  title: string;
  description: string;
  source: string;
  imageUrl?: string;
  author: string;
  date: string;
}


// Form types
export type TformMode = "booking" | "contact" | "download" | undefined | null

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
  id: string
  title: string
  description?: string
  fields: TformFieldConfig[]
  submitText: string
  schema: z.ZodObject<any>
  successTitle: string
  successMessage: string
  showTerms?: boolean
  termsText?: string
  privacyText?: string
}

export type TdynamicFormProps = {
  config: TformConfig
  onSuccess: (message: string, title: string) => void
  onCancel?: () => void
  className?: string
  defaultValues?: Record<string, any>
  hideCardHeader?: boolean
}

//solution individual

export type TproblemSection = {
  header: Theader;
  button: Tbutton;
  challenges: string[];
  footer: {
    title: string;
    header: Theader;
  };
};

export type TsolutionSection = {
  header: Theader
  products: string[]
  details: string[]
  results: Theader[]
  title: string
  testimonial?: {
    author: string
    title: string
    quote: string
    verify: string
  },
  footer: {
    title: string
    handles: {
      label: string, icon: string
    }[]
    button: Tbutton
  }
}

export type TSidebarCardType = {
  title: string;
  content: string;
  button?: {
    label: string;
    link?: string;
  };
  solutions?: string[];
  solutionsDescription?: string[];
  link?: {
    label: string;
    href: string;
  };
};

//page
export type Tindustry = {
  hero: TheroProps
  problems: {
    header: Theader
    items: Titems[]
    footer: {
      header: Theader
      points: {
        title: string
      }
      buttons: Tbutton[]
    }
  }
  features: {
    header: Theader
    feature: {
      header: Theader
      image: Timage
      card: TcardProps
    }[]
  }
  allFeature: {
    header: Theader
    cards: TcardProps[]
  }
  cta: {
    header: Theader
    cards: TcardProps[]
    footer: {
      title: string
      button: Tbutton
    }
  }
  successStory: {
    header: Theader
    cards: TcardProps[]
    footer: {
      title: string
      button: Tbutton
    }
  }
}

//page
export type Tproduct = {
  hero: TheroProps
  problems: {
    header: Theader
    card: TcardProps
    footer: {
      header: Theader
      button: Tbutton[]
    }
  }
  solutions: {
    header: Theader
    cards: TcardProps[]
    footer: {
      button: Tbutton[]
    }
  }
  guide: {
    header: Theader
    features: {
      icons: {
        icon: React.ReactNode | keyof typeof LucideIcons
        text: string
      }[]
      header: Theader
      link: Tbutton
      img: string | React.ReactNode | keyof typeof LucideIcons
    }[]
    footer: {
      header: Theader
      button: Tbutton[]
    }
  }
  successStory: {
    header: Theader
    cards: TcardProps[]
    items: {
      header: Theader
    }[]
    footer: {
      header: Theader
      button: Tbutton[]
    }
  }
  pricing: {
    header: Theader
    items: {
      header: Theader
      points: {
        header: Theader
      }[]
    }
    footer: {
      header: Theader
      button: Tbutton[]
    }
  }
  cta: {
    header: Theader
    item: {
      header: Theader
    }
    footer: {
      header: Theader
      button: Tbutton[]
    }
  }
}

export type TapiResponse = {
  message?: string
  error?: string
  data?: any
}

export type Tslot = {
  time: string
  availability: boolean
}

export type TslotResponse = {
  message?: string
  data?: Tslot[]
  error?: string
}
