export type Middleware ={
    name: string;
    description: string;
    version: string;
}
export interface Iquery<DynamicSourceType>  {
    query: string
    getQuery():string
    executeQuery():Promise<DynamicSourceType>
}
export interface Itransformer<DynamicSourceType, DynamicTargetType=any> {
    contentType: string
    transformationRule: string
    sourceData: DynamicSourceType
    targetData: DynamicTargetType
    query: Iquery<DynamicSourceType>
    locale: string
    execute(context?: Record<string, any>):Promise<DynamicTargetType>
    init?(context?: Record<string, any>): Promise<void>
    getData():Promise<DynamicSourceType>
    performTransformation(idSourceData:DynamicSourceType):Promise<DynamicTargetType>  
}
export interface ItransformationRule {

}
export interface IsourceType {
    
}
export interface ItargetType {

}



export type TtrendsPageSource  = {
    trend: Ttrend

}
export type TtrendsPageTarget = {
    trend: Ttrend
}

type Ttrend = {
    heroSection: TheroSection

}
export type TheroSection = {
        heading: Theading
        description: string
        buttons: Tbutton[]  
}

export type Theading = {
    title: string
    subtitle: string
    highlight: string
    badge: string
  
}

export type Thighlight = {
    icon: string
    label: string
    description: string
}
export type Tbutton = {
    icon: string
    fromMode: string
    description: string
    label: string
    href: string
}

