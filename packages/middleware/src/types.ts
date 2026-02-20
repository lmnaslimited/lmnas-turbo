import { z } from "zod"
import * as LucideIcons from "lucide-react"

export type Middleware = {
  name: string
  description: string
  version: string
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
  variables?: Record<string, any>
  setVariables(variables?: Record<string, any>): void
}
export interface ITransformer<DynamicSourceType, DynamicTargetType = any>
  extends IBaseComponent {
  contentType: string
  transformationRule?: string
  // sourceData?: DynamicSourceType
  targetData?: DynamicTargetType
  query: IQuery<DynamicSourceType>
  execute(context?: Record<string, any>): Promise<DynamicTargetType>
  init?(context?: Record<string, any>): Promise<void>
  getData(): Promise<DynamicSourceType>
  performTransformation(
    idSourceData: DynamicSourceType,
  ): Promise<DynamicTargetType>
}
export interface ItransformationRule {}
export interface IsourceType {}
export interface ItargetType {}

export type TslugsSource = {
  [key: string]: {
    slug: string
  }[]
}

export type TslugsTarget = Tslug[]

export type Tslug = {
  slug: string
}

export type Tcontext = {
  locale: string
  filters?: {
    slug: {
      eq: string
    }
  }
  status?: string
  caseStudiesLocale2?: string
  footerLocale2?: string
  caseStudiesFilters2?: {
    heroSection?: {
      tag: {
        eq: string
      }
    }
    slug?: {
      ne: string
    }
  }
}

export type TglobalMetaSource = TglobalMeta

export type TglobalMetaTarget = TglobalMeta

export type TglobalMeta = {
  globalMeta: {
    metadataBase?: string
    robotsIndex?: boolean
    robotsFollow?: boolean
    robotsNocache?: boolean
    googleBotIndex?: boolean
    googleBotFollow?: boolean
    googleBotMaxSnippet?: number
    googleBotMaxImagePreview?: "none" | "standard" | "large"
    googleBotMaxVideoPreview?: number
    authorsName?: string
    authorsURL?: string
    creator?: string
    publisher?: string
    applicationName?: string
    icons?: TseoIcons[]
    apple?: TseoIcons[]
    shortcut?: string
    appleWebAppCapable?: boolean
    appleWebAppTitle?: string
    appleWebAppStatusBarStyle?: "default" | "black" | "black-translucent"
    manifest?: string
    schemaData?: Record<string, any>[]
  }
}

export type TpageMetadata = {
  title: string
  description: string
  keywords: { description: string }[]
  canonical: string
  ogTitle: string
  ogDescription: string
  ogUrl: string
  ogType:
    | "website"
    | "article"
    | "book"
    | "profile"
    | "music.song"
    | "music.album"
    | "music.playlist"
    | "music.radio_station"
    | "video.movie"
    | "video.episode"
    | "video.tv_show"
    | "video.other"
  ogSiteName: string
  ogLocale: string
  ogImages: TseoIcons[]
  twitterCard: "summary" | "summary_large_image" | "player" | "app"
  twitterTitle: string
  twitterDescription: string
  twitterImage: string
  twitterCreator: string
  category: string
  schemaData?: Record<string, any>[]
}

export type TseoIcons = {
  url: string
  alt?: string
  type?: string
  sizes?: string
  width?: number
  height?: number
}

export type Titems = {
  icon?: React.ReactNode | keyof typeof LucideIcons | string
  className?: string
  label?: string
  description?: string
  title?: string
  subtitle?: string
  type?: string
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
}

export type Tbutton = {
  label?: string
  href?: string
  variant?:
    | "default"
    | "outline"
    | "ghost"
    | "secondary"
    | "destructive"
    | "link"
  size?: "default" | "sm" | "lg" | "icon"
  icon?: React.ReactNode | keyof typeof LucideIcons | string
  iconPosition?: "before" | "after"
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
  heading: Theader
  highlight?: Titems[]
  description?: string
  buttons: Tbutton[]
  image?: Timage
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
  list?: Titems[]
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
  onButtonClick?: (mode: TformMode, formTitle?: string) => void
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
  buttonPosition?: "header" | "bottom-left" | "bottom-center" | "bottom-right"
  layout?: "classic" | "centered"
  iShowButton?: boolean
  heading: Theader
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
  title: string
  description: string
  source: string
  media?: {
    url: string
    alt: string
  }
  author: string
  publishedAt: string
  formMode?: string
  btnLabel?: string
}

// solution Section
export type TsolutionSection = {
  title: string
  // header: Theader
  products: Titems[]
  details: Titems[]
  results: Theader[]
  testimonial: {
    title: string
    quote: string
    author: string
    verify: string
  }
  successCard: TcardProps
  footer: TheroSection
}

export type TlocationCard = {
  index: number
  type: string
  badge: string
  title: string
  description: string
  contacts: Titems[]
  svg: Timage
  navigation: Tbutton
  isReversed: boolean
}

// Form Type
export type TformMode =
  | "booking"
  | "contact"
  | "download"
  | "webinar"
  | undefined
  | null

export type TfieldType =
  | "text"
  | "email"
  | "phone"
  | "textarea"
  | "select"
  | "date"
  | "timezone"
  | "timeslot"
  | "checkbox"

export type TformFieldConfig = {
  name: string
  label?: string
  placeholder?: string
  type: TfieldType
  required?: boolean
  options?: { value: string; label: string }[]
  className?: string
  fieldDisplay: string
  inputClassName?: string
  validationMessage?: string
  defaultValue?: string
  loading: Titems
}

export type TformConfig = {
  formId: string
  title: string
  description?: string
  fields: TformFieldConfig[]
  submitText: string
  schema: z.ZodObject<any>
  successTitle: string
  successMessage: string
  verifiedMessage?: Titems
  unVerifiedMessage?: Titems
  showTerms?: boolean
  terms?: Tbutton
  privacy?: Tbutton
  policyDescription?: string
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

//API
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

export type TleadApi = {
  name: string
  email: string
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
  trendingNowSection: TcalloutProps
  testimonials: TcardProps[]
  successClients: Timage[]
  metaData: TpageMetadata
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
  metaData: TpageMetadata
}

// career
export type TcareerPageSource = {
  career: Tcareer
}
export type TcareerPageTarget = {
  career: Tcareer
}
type GuideSection = [
  {
    heading: Theader
    point: Titems[]
  },
  Tbutton,
]
type Tcareer = {
  heroSection: TheroSection
  challengeSection: TheroSection
  guideSection: GuideSection
  jobsSection: TcalloutProps
  planSection: TheroSection
  trendingSection: Theader
  trendingFooter: Tbutton[]
  metaData: TpageMetadata
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
  metaData: TpageMetadata
}

export type TformsPageSource = {
  forms: TformConfig[]
}
export type TformsPageTarget = {
  forms: TformConfig[]
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
  metaData: TpageMetadata
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
  metaData: TpageMetadata
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
  metaData: TpageMetadata
}

// industries
export type TindustriesPageSource = Tindustries
export type TindustriesPageTarget = Tindustries
export type Tindustry = {
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
  metaData: TpageMetadata
}
export type Tindustries = {
  industries: Tindustry[]
  caseStudies: TcaseStudy[]
}

//solutions
export type TsolutionPageSource = {
  solution: Tsolution
  caseStudies: TcaseStudy[]
  home: {
    successClients: Timage[]
  }
}
export type TsolutionPageTarget = {
  solution: Tsolution
  caseStudies: TcaseStudy[]
  home: {
    successClients: Timage[]
  }
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
  metaData: TpageMetadata
}

// casestudies
export type TcaseStudiesPageSource = TcaseStudies
export type TcaseStudiesPageTarget = TcaseStudies
export type TcaseStudy = {
  slug: string
  name: string
  pdfName: string
  heroSection: TcardProps
  problemSection: TcalloutProps
  solutionSection: TsolutionSection
  sidebarData: TcardProps[]
  relatedCaseStudies: TcardProps[]
  ctaSection?: TcalloutProps[]
  conclusion?: Theader
  moreCaseStudies?: Theader
}
export type TcaseStudies = {
  caseStudies: TcaseStudy[]
  footer: Tfooter
  allCaseStudies: TcaseStudy[]
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
  metaData: TpageMetadata
}

// Contact
export type TcontactSource = {
  contact: Tcontact
  forms: TformConfig[]
}
export type TcontactTarget = {
  contact: Tcontact
  forms: TformConfig[]
}
export type Tcontact = {
  header: Theader[]
  contactForm: TformFieldConfig[]
  bookingForm: TformFieldConfig[]
  metaData: TpageMetadata
  locationHeadline: string
  locationHeader: Theader
  locationCard: TlocationCard[]
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
  metaData: TpageMetadata
}

// -------------------------------------------------------------------------------------------

//job api
export type JobOpening = {
  name: string
  job_title: string
  status: string
  designation: string
  custom_excerpt_description: string
  custom_job_location?: string
  _user_tags: string[]
  creation: string
  route: string
}

export type JobFilters = {
  role: string[]
  location: string[]
}

export type JobData = {
  id: string
  title: string
  location: string
  role: string
  description: string
  applyUrl: string
}

export type MappedResult = {
  filters: JobFilters
  data: JobData[]
}

//tweeter
export type TwitterUser = {
  id: string
  name: string
  username: string
}

export type TwitterMedia = {
  media_key: string
  url?: string
  alt_text?: string
  preview_image_url?: string
}

export type TwitterTweet = {
  id: string
  created_at: string
  text: string
  author_id: string
  attachments?: {
    media_keys: string[]
  }
}

export type TwitterApiResponse = {
  data: TwitterTweet[]
  includes?: {
    users?: TwitterUser[]
    media?: TwitterMedia[]
  }
}
