import { Iquery, Itransformer, TtrendsPageSource, TtrendsPageTarget } from "../types";
import { clQueryFactory } from "../api/query";
// Sleep function to introduce a delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export abstract class clTransformer<DynamicSourceType, DynamicTargetType=any> implements Itransformer<DynamicSourceType, DynamicTargetType> {
    contentType: string
    transformationRule: string 
    sourceData: DynamicSourceType
    targetData: DynamicTargetType
    query: Iquery<DynamicSourceType>
    async execute(): Promise<DynamicTargetType> {
      await this.init()
      this.sourceData = await this.getData()
      this.targetData = await this.performTransformation(this.sourceData)
      return this.targetData
    }
    abstract performTransformation(idSourceData:DynamicSourceType):Promise<DynamicTargetType>
    async init(): Promise<void> {
        await sleep(100)
    }
    async getData():Promise<DynamicSourceType> {
        return this.query.executeQuery()
    }
    constructor(iContentType: string) {
        this.contentType = iContentType
        this.query = clQueryFactory.createQuery(iContentType)
        
    }
}

export class clTrendsTransformer extends clTransformer< TtrendsPageSource, TtrendsPageTarget> {
  contentType: string
  transformationRule: string 
  sourceData: TtrendsPageSource
  targetData: TtrendsPageTarget 
  query: Iquery<TtrendsPageSource>
  async performTransformation(idSourceData:TtrendsPageSource):Promise<TtrendsPageTarget> {
    this.targetData = this.sourceData
    return this.targetData
  }
  constructor(iContentType: string) {
      super(iContentType)
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
