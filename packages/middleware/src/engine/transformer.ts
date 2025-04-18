import { Iquery, IsourceType, ItargetType, Itransformer } from "../types/types";

export abstract class clTransformer<T> implements Itransformer<T> {
    contentType: string
    transformationRule: string 
    sourceType: IsourceType
    targetType: ItargetType 
    query: Iquery<T>
    abstract performTransformation(idSourceData:IsourceType):ItargetType 
    getData():Promise<T> {
        return this.query.executeQuery()
    }
    constructor(iContentType: string) {
        this.contentType = iContentType
        
    }
}

export class clTrendsPageTransformer extends clTransformer<ItargetType> {
    constructor() {
        super("trends")
        this.transformationRule = "trends"
        this.sourceType = {
            heroSection: {
                heading: {
                    title: "",
                    subtitle: "",
                    highlight: ""
                },
                description: "",
                buttons: [
                    {
                        label: "",
                        href: "",
                        icon: "",
                        formMode: ""
                    }
                ]
            }
        }
        this.targetType = {
            heroSection: {
                heading: {
                    title: "",
                    subtitle: "",
                    highlight: ""
                },
                description: "",
                buttons: [
                    {
                        label: "",
                        href: "",
                        icon: "",
                        formMode: ""
                    }
                ]
            }
        }
    }

}