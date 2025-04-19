export type Middleware ={
    name: string;
    description: string;
    version: string;
}
export interface Iquery<T>  {
    query: string
    getQuery():string
    executeQuery():Promise<T>
}
export interface Itransformer<T, S=T, R=any> {
    contentType: string
    transformationRule: string
    sourceType: S
    targetType: R
    query: Iquery<T>
    performTransformation(idSourceData:IsourceType):Promise<R>
    getData():Promise<T>
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

