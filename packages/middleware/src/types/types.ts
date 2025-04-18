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
export interface Itransformer<T> {
    contentType: string
    transformationRule: string
    sourceType: IsourceType
    targetType: ItargetType
    query: Iquery<T>
    performTransformation(idSourceData:IsourceType):ItargetType
    getData():Promise<T>
}
export interface ItransformationRule {

}
export interface IsourceType {
    
}
export interface ItargetType {

}



