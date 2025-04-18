export type Middleware ={
    name: string;
    description: string;
    version: string;
}
export interface Iquery  {
    query: string
    getQuery():string
    executeQuery():<T>
}
export interface Itransformer {
    contentType: string
    transformationRule: string
    sourceType: IsourceType
    targetType: ItargetType
    performTransformation(idSourceData:IsourceType):ItargetType
}
export interface ItransformationRule {

}
export interface IsourceType {
    
}
export interface ItargetType {

}



