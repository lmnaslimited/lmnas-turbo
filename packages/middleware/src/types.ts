import * as LucideIcons from "lucide-react"

export type Middleware = {
    name: string;
    description: string;
    version: string;
}
export interface IBaseComponent {
    contentType: string
    locale: string
    // execute?(): Promise<DynamicDataType>
}
export interface IQuery<DynamicSourceType> extends IBaseComponent {
    query: string
    getQuery(): string
    executeQuery(): Promise<DynamicSourceType>
    variables?: Record<string, any>;
    setVariables(variables?: Record<string, any>): void;
}
export interface ITransformer<DynamicSourceType, DynamicTargetType = any> extends IBaseComponent {
    contentType: string
    transformationRule?: string
    // sourceData?: DynamicSourceType
    targetData?: DynamicTargetType
    query: IQuery<DynamicSourceType>
    execute(context?: Record<string, any>): Promise<DynamicTargetType>
    init?(context?: Record<string, any>): Promise<void>
    getData(): Promise<DynamicSourceType>
    performTransformation(idSourceData: DynamicSourceType): Promise<DynamicTargetType>
}
export interface ItransformationRule {

}
export interface IsourceType {

}
export interface ItargetType {

}
export type TslugsSource = {
    [key: string]: {
        slug: string;
    }[];
};

export type TslugsTarget = Tslug[]

export type Tslug = {
    slug: string
}

export type Titems = {
    question: string
    answer: string
    icon?: keyof typeof LucideIcons | React.ReactNode | string
    label?: string
    description?: string
    title: string
    subtitle: string
}

export type Theader = {
    badge?: string
    subtitle?: string
    className?: string
    headingClass?: string
    descripClass?: string
    title?: string
    highlight?: string
}

export type TcalloutProps = {
    header: Theader
    buttons: Tbutton[]
    list: Titems[]
    variant?: string
    layout?: "classic" | "simple" | string
    title?: string
    subtitle?: string
};

export type Tbutton = {
    label?: string;
    href: string;
    variant?: "default" | "outline" | "ghost" | "secondary" | "destructive" | "link";
    size?: "default" | "sm" | "lg" | "icon"
    icon?: React.ReactNode | keyof typeof LucideIcons | string
    iconPosition?: "before" | "after";
    className?: string
    formMode?: "booking" | "contact" | "download"
    description?: string
}

export type Timage = {
    source?: string
    alternate: string
    aspectRatio?: "square" | "video" | "wide" | "auto"
    width?: string
    height?: string
    svg?: React.ReactNode | keyof typeof LucideIcons
    position?: string
}

export type TheroSection = {
    heading: Theader;
    highlight?: Titems[]
    description?: string;
    buttons: Tbutton[]
    image?: Timage;
}

type TtechStack = {
    heading: Theader
    point: Titems[]
}

export type TcardProps = {
    image?: Timage
    header: Theader
    buttons?: Tbutton[]
    link?: Tbutton[]
    list?: Titems[];
    avatar?: Timage
    avatarDetails?: {
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

export type TcontactData = {
    address: string
    phoneLabel: string
    phoneHref: string
    emailLabel: string
    emailHref: string
    description: string
    websiteLabel: string
    websiteHref: string
    label: string
}


export type TformMode = "booking" | "contact" | "download" | undefined | null

// trending now
export type TtrendsPageSource = {
    trend: Ttrend
}
export type TtrendsPageTarget = {
    trend: Ttrend
}
type TnoiseSection = {
    heading: Theader
    point: Titems[]
}
type Ttrend = {
    heroSection: TheroSection
    frustrationSection: [Theader, TcalloutProps]
    noiseSection: TnoiseSection[]
    trendingSection: Theader
    showAll: Tbutton
    calloutSection: TcalloutProps
}

// careers
export type TcareersPageSource = {
    career: Tcareers
}
export type TcareersPageTarget = {
    career: Tcareers
}
type GuideSection = [
    {
        heading: Theader;
        point: Titems[];
    },
    Tbutton
];
type Tcareers = {
    heroSection: TheroSection
    challengeSection: TheroSection
    guideSection: GuideSection
    jobsSection: TcalloutProps
    planSection: TheroSection
    trendingSection: Theader
}

// terms and conditions
export type TtermsAndConditionsPageSource = {
    termsAndCondition: TtermsAndCondition
}

export type TtermsAndConditionsPageTarget = {
    termsAndCondition: TtermsAndCondition
}
type TtermsAndCondition = {
    header: Theader
    acknowledgment: string
    faq: TtechStack
    contact: TcontactData
}

// privacy policy
export type TprivacyPolicyPageSource = {
    privacyPolicy: TprivacyPolicy
}
export type TprivacyPolicyPageTarget = {
    privacyPolicy: TprivacyPolicy
}
type TprivacyPolicy = {
    header: Theader
    acknowledgment: string
    faq: TtechStack
    contact: TcontactData
}

// pricing
export type TpricingPageSource = {
    pricing: Tpricing

}
export type TpricingPageTarget = {
    pricing: Tpricing
}


type Tpricing = {
    heroSection: TheroSection
    problemSection: TcalloutProps
}

// industries

export type TindustriesPageSource = {
    industries: Tindustries[]
}
export type TindustriesPageTarget = {
    industries: Tindustries[]
}
export type Tindustries = {
    slug: string;
    heroSection: TheroSection
    problemSection: TcalloutProps
    featuresSectionHeader: Theader
    feature: {
        header?: Theader;
        image?: Timage;
        card?: TcardProps
    }[]
    allFeatureHeader: Theader
    allFeatureCard: TcardProps[]
    cta: TcalloutProps
    successStoryHeaderFooter: TcalloutProps
    successStoryCard: TcardProps[]
}

//solutions

export type TsolutionsPageSource = {
    solution: Tsolution
}
export type TsolutionsPageTarget = {
    solution: Tsolution
}

type Tsolution = {
    heroSection: TheroSection
}

//products

export type TproductsPageSource = {
    products: Tproducts[]
}
export type TproductsPageTarget = {
    products: Tproducts[]
}
export type Tproducts = {
    slug: string;
    heroSection: TheroSection
    problemsHeader: Theader
    problemsSection: TcalloutProps
    solutionsHeaderFooter: TcalloutProps
    solutionsCard: TcalloutProps[]
    guideSectionHeaderFooter: TcalloutProps
    guideFeature: TheroSection[]
    successStoryHeaderFooter: TcalloutProps
    successStoryCard: TcardProps[]
    successStoryHighlight: Titems[]
    pricingSectionHeaderFooter: TcalloutProps
    pricingHighlight: TcalloutProps
    ctaSectionHeader: Theader
    ctaSection: TcalloutProps
}