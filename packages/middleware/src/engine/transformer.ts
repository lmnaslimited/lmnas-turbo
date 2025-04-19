import { Iquery, IsourceType, ItargetType, Itransformer, TtrendsPageSource, TtrendsPageTarget } from "../types";
import { clQueryFactory } from "../api/query";
import { threadId } from "worker_threads";

export abstract class clTransformer<T, S=T, R=any> implements Itransformer<T,S,R> {
    contentType: string
    transformationRule: string 
    sourceType: S
    targetType: R
    query: Iquery<T>
    abstract performTransformation(idSourceData:S):Promise<R>
    async getData():Promise<T> {
        return this.query.executeQuery()
    }
    constructor(iContentType: string) {
        this.contentType = iContentType
        
    }
}

export class clTrendsTransformer extends clTransformer<TtrendsPageSource, TtrendsPageSource, TtrendsPageTarget> {
  contentType: string
  transformationRule: string 
  sourceType: TtrendsPageSource
  targetType: TtrendsPageTarget 
  query: Iquery<TtrendsPageSource>
  async performTransformation(idSourceData:TtrendsPageSource):Promise<TtrendsPageTarget> {
    this.sourceType = await this.getData()
    this.targetType = this.sourceType
    return this.targetType
  }
  async getData():Promise<TtrendsPageSource> {
      return this.query.executeQuery()
  }
  constructor(iContentType: string) {
      super(iContentType)
      this.contentType = iContentType
      
  }

}

interface ITransformerMap {
  Trends: clTrendsTransformer;
  // Add other content types and corresponding transformers
}

export class clTransformerFactory {
  private static transformerMap: {
    [K in keyof ITransformerMap]: new (contentType: K) => ITransformerMap[K];
  } = {
    Trends: clTrendsTransformer,
    // Add more mappings
  };

  static createTransformer<K extends keyof ITransformerMap>(
    contentType: K
  ): ITransformerMap[K] {
    const TransformerClass = this.transformerMap[contentType];
    if (!TransformerClass) throw new Error(`Invalid transformer type: ${contentType}`);

    return new TransformerClass(contentType); // use contentType as constructor arg
  }
}
