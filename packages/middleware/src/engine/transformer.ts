import { IsourceType, ItargetType, Itransformer } from "../types/types";

export abstract class clTransformer<T> implements Itransformer {
    contentType: string
    transformationRule: string 
    sourceType: IsourceType
    targetType: ItargetType 
    abstract performTransformation(idSourceData:IsourceType):ItargetType 
    constructor(iContentType: string) {
        this.contentType = iContentType
    }
}

export class clTrendsPageTransformer extends clTransformer implements