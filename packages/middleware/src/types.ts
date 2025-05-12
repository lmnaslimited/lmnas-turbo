import * as LucideIcons from "lucide-react"
import { z } from "zod"

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

export type Tcontext = {
    locale: string;
    filters?: {
        slug: {
            eq: string;
        };
    };
    caseStudiesFilters2?: {
        heroSection: {
            tag: {
                eq: string;
            };
        };
    };
};


export type Titems = {
    icon?: React.ReactNode | keyof typeof LucideIcons | string
    className?: string
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
    href?: string;
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
    svg?: React.ReactNode | keyof typeof LucideIcons | string
    className?: string
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
    header?: Theader
    buttons?: Tbutton[]
    link?: Tbutton[]
    list?: Titems[];
    avatar?: Timage
    avatarDetails?: {
        label: string
        description?: string
    }
    nameAndPlace?: {
        label: string
        description?: string
    }
    namePosition?: "top" | "bottom" | "left" | "right"
    footerClassName?: string
    tag?: string
    layout?: "vertical" | "horizontal"
    width?: "full" | "compact"
    onClick?: () => void
    className?: string
    buttonPosition?: string
    cardPosition?: string
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

export type TPlanFeature = {
    tableHead: string
    pricingPlans: {
        name: string
        users: string
        warranty: string
        support: string
        db: string
        maintenance: string
        consulting: string
    }[]
    features: Titems[]
}

//component
export type TfeatureProps = {
    buttonPosition?: "header" | "bottom-left" | "bottom-center" | "bottom-right";
    layout?: "classic" | "centered";
    iShowButton?: boolean;
    heading: Theader;
    buttons?: Tbutton[]
    highlight?: Titems[]
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

//component
export type TtrendCardProps = {
    id: string
    title: string;
    description: string;
    source: string;
    media?: {
        url: string
        alt: string
    };
    author: string;
    publishedAt: string;
    formMode?: string
    btnLabel?: string
}


// solution Section
export type TsolutionSection = {
    title: string
    header: Theader
    products: Titems[]
    details: Titems[]
    results: Theader[]
    testimonial: {
        title: string
        quote: string
        author: string
        verify: string
    }
    successCard: TcardProps[]
    footer: TheroSection
}

// Form Type
export type TformMode = "booking" | "contact" | "download" | "webinar" | undefined | null

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
    pdfData?: any
    data?: any
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

export type TcontactApi = {
    formData: {
        name: string
        job: string
        company: string
        email: string
        phone: string
    }
    recaptchaToken: string
}

// Navbar
export type TnavbarSource = {
    navbar: Tnavbar
}
export type TnavbarTarget = {
    navbar: Tnavbar
}
export type Tnavbar = {
    logo: Tbutton
    menu: Tbutton[]
    product: Tbutton[]
    industry: Tbutton[]
    more: Tbutton[]
    language: Tbutton[]
}

// Footer
export type TfooterSource = {
    footer: Tfooter
}
export type TfooterTarget = {
    footer: Tfooter
}
export type Tfooter = {
    companyName: string
    companyInfo: string
    menu: Titems[]
    social: Tbutton[]
    product: Tbutton[]
    more: Tbutton[]
    contact: TcontactData
    policies: Tbutton[]
}

// home
export type ThomePageSource = {
    home: Thome
}
export type ThomePageTarget = {
    home: Thome
}
export type Thome = {
    heroSection: TheroSection
    problemSection: TfeatureProps[]
    calloutSection: TcalloutProps[]
    faqSection: TcalloutProps
    socialSection: TheroSection
}

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

// career
export type TcareerPageSource = {
    career: Tcareer
}
export type TcareerPageTarget = {
    career: Tcareer
}

// about us
export type TaboutUsPageSource = {
    aboutUs: TaboutUs
}
export type TaboutUsPageTarget = {
    aboutUs: TaboutUs
}
type TaboutUs = {
    heroSection: TheroSection
    valuesSectionHeaderFooter: TcalloutProps
    valuesSection: Theader[]
    timeLineHeader: Theader
    previousYears: Titems[]
    currentAndBeyondYears: TheroSection
    testimonialHeader: Theader
    testimonalCard: TcardProps[]
    ctaSection: TcalloutProps
}
type GuideSection = [
    {
        heading: Theader;
        point: Titems[];
    },
    Tbutton
];
type Tcareer = {
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
export type Tpricing = {
    heroSection: TheroSection
    problemSection: TcalloutProps
    planHeader: Theader
    planSection: TPlanFeature
    planFooter: TcalloutProps
    testimonialHeader: TcalloutProps
    testimonialSection: TcardProps[]
    faqSection: TtechStack
    guideHeader: Theader
    guideCategories: Titems[]
    guideTableHeader: Titems[]
    guideSection: Theader[]
    guideFooter: TcalloutProps
    guideCallout: Theader
    ctaSection: TheroSection
}

// industries
export type TindustriesPageSource = Tindustries
export type TindustriesPageTarget = Tindustries
export type Tindustries = {
    industries: {
        slug: string
        heroSection: TheroSection
        problemSection: TcalloutProps
        featuresSectionHeader: Theader
        feature: {
            header?: Theader
            image?: Timage
            card?: TcardProps
        }[]
        allFeatureHeader: Theader
        allFeatureCard: TcardProps[]
        cta: TcalloutProps
        successStoryHeaderFooter: TcalloutProps
        successStoryCard: TcardProps[]
    }[]
    caseStudies: TcaseStudies[]
}

//solutions
export type TsolutionPageSource = {
    solution: Tsolution
}
export type TsolutionPageTarget = {
    solution: Tsolution
}
export type Tsolution = {
    heroSection: TheroSection
    problemSection: TcalloutProps
    guideHeader: Theader
    guideSection: TcardProps[]
    guideFooter: TcalloutProps
    planHeader: Theader
    planCard: TcardProps[]
    planFooter: TcalloutProps
    solutionHeader: Theader
    solutionSection: TcardProps[]
    solutionFooter: TcalloutProps
    successHeader: Theader
    successSection: TcardProps[]
    successFooter: TcalloutProps
    storyHeader: Theader
    storySection: TcardProps[]
    storyFooter: Tbutton
    calloutHeader: Theader
    calloutCard: TcardProps[]
    calloutSection: TcalloutProps
    calloutFooter: TcalloutProps
}

// casestudies
export type TcaseStudiesPageSource = {
    caseStudies: TcaseStudies[]
}
export type TcaseStudiesPageTarget = {
    caseStudies: TcaseStudies[]
}
export type TcaseStudies = {
    slug: string
    name: string
    heroSection: TcardProps
    problemSection: TcalloutProps
    solutionSection: TsolutionSection
    sidebarData: TcardProps[]
    relatedCaseStudies: TcardProps[]
}

//products
export type TproductsPageSource = {
    products: Tproducts[]
}
export type TproductsPageTarget = {
    products: Tproducts[]
}
export type Tproducts = {
    slug: string
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

// Contact
export type TcontactSource = {
    contact: Tcontact
}
export type TcontactTarget = {
    contact: Tcontact
}
export type Tcontact = {
    header: Theader[]
}

// Event
export type TeventPageSource = {
    event: Tevent
}
export type TeventPageTarget = {
    event: Tevent
}
export type Tevent = {
    heroSection: TheroSection
}

// -------------------------------------------------------------------------------------------

//job api
export type JobOpening = {
    name: string;
    job_title: string;
    status: string;
    designation: string;
    custom_exert_description: string;
    location?: string;
    _user_tags: string[];
    creation: string;
};

export type JobFilters = {
    role: string[];
    location: string[];
};

export type JobData = {
    id: string;
    title: string;
    location: string;
    role: string;
    description: string;
};

export type MappedResult = {
    filters: JobFilters;
    data: JobData[];
};

//tweeter
export type TwitterUser = {
    id: string;
    name: string;
    username: string;
}

export type TwitterMedia = {
    media_key: string;
    url?: string;
    alt_text?: string;
    preview_image_url?: string;
}

export type TwitterTweet = {
    id: string;
    created_at: string;
    text: string;
    author_id: string;
    attachments?: {
        media_keys: string[];
    };
}

export type TwitterApiResponse = {
    data: TwitterTweet[];
    includes?: {
        users?: TwitterUser[];
        media?: TwitterMedia[];
    };
}