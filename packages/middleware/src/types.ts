import * as LucideIcons from "lucide-react"

export type Middleware = {
    name: string;
    description: string;
    version: string;
}
export interface Iquery<DynamicSourceType> {
    query: string
    getQuery(): string
    executeQuery(): Promise<DynamicSourceType>
}
export interface Itransformer<DynamicSourceType, DynamicTargetType = any> {
    contentType: string
    transformationRule: string
    sourceData: DynamicSourceType
    targetData: DynamicTargetType
    query: Iquery<DynamicSourceType>
    locale: string
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

export type Titems = {
    question: string
    answer: string
    icon?: keyof typeof LucideIcons | React.ReactNode | string
    label?: string
    description?: string
}

export type Theader = {
    textWithoutColor?: string
    badge?: string
    text?: string;
    subtitle?: string
    className?: string
    headingClass?: string
    descripClass?: string
    title?: string
    highlight?: string
}

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
    src?: string
    alt: string
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
    image: Timage;
}

export type TtrendsPageSource = {
    trend: Ttrend

}
export type TtrendsPageTarget = {
    trend: Ttrend
}

type Ttrend = {
    heroSection: TheroSection
}

export type TcareersPageSource = {
    career: Ttrend

}
export type TcareersPageTarget = {
    career: Ttrend
}

type Tcareers = {
    heroSection: TheroSection
}
