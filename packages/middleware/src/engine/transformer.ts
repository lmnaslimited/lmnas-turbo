import { IQuery, ITransformer, TpricingPageSource, TpricingPageTarget, TproductsPageSource, TproductsPageTarget, TsolutionsPageSource, TsolutionsPageTarget, TtrendsPageSource, TtrendsPageTarget, TcareersPageSource, TcareersPageTarget, TindustriesPageSource, TindustriesPageTarget, TtermsAndConditionsPageSource, TtermsAndConditionsPageTarget, TprivacyPolicyPageSource, TprivacyPolicyPageTarget, TslugsSource, TslugsTarget } from "../types";
import { clQueryFactory, clQuerySlug } from "../api/query";
// Sleep function to introduce a delay for every Promise
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export abstract class clTransformer<DynamicSourceType extends object, DynamicTargetType = any> implements ITransformer<DynamicSourceType, DynamicTargetType> {
  contentType: string
  transformationRule?: string
  // sourceData?: DynamicSourceType
  targetData?: DynamicTargetType
  query: IQuery<DynamicSourceType>
  locale: string
  async execute(context?: Record<string, any>): Promise<DynamicTargetType> {
    // Initialise the transformation
    await this.init(context)
    // Fire the query of the content type. Note the Query is intiated for the content type 
    // in the transformation constructor
    // this.sourceData = await this.getData()
    // Perform the transformation for the data retrived from the query
    this.targetData = await this.performTransformation(await this.getData())
    // finally retrun the transformed data
    return this.targetData
  }
  // Implement specific transformation rule of Source Data to Traget data in the respective
  // Content type implementation.
  abstract performTransformation(idSourceData: DynamicSourceType): Promise<DynamicTargetType>
  // Additional intiation specefic to Execute. Useful to have more controls for the execution
  // of the transformation
  async init(context?: Record<string, any>): Promise<void> {
    // initilaise the contect of the transformation
    // Intialalise the Loacle to language requested else fallback to English 
    this.locale = this.query.locale = context?.locale ?? 'en'
    // set the query vaiables
    this.query.setVariables(context)
    // Disallow any new Promise before 100 ms
    await sleep(100)
  }
  async getData(): Promise<DynamicSourceType> {
    return this.query.executeQuery()
  }
  // Intantiate the Transformation engine for the content type
  // inject dependecy of Query for unit testing
  constructor(iContentType: string, iQuery?: IQuery<DynamicSourceType>) {
    // Intialise the content type
    this.contentType = iContentType
    // create an query instance if for the content type
    // For unit testing scenarios the Query instance is injected
    this.locale = 'en'
    this.query = iQuery ?? clQueryFactory.createQuery<DynamicSourceType>(iContentType)

  }
}

export class clSlugsTransformer extends clTransformer<TslugsSource, TslugsTarget> {
  async performTransformation(idSourceData: TslugsSource): Promise<TslugsTarget> {
    // Return only the slugs
    this.targetData = idSourceData[this.contentType].map(entry => entry) 
    return this.targetData
  }
  constructor(iContentType: string) {
    super(iContentType)
  }
}

export class clTrendsTransformer extends clTransformer<TtrendsPageSource, TtrendsPageTarget> {
  async performTransformation(idSourceData: TtrendsPageSource): Promise<TtrendsPageTarget> {
    this.targetData = idSourceData
    return this.targetData
  }
  constructor(iContentType: string) {
    super(iContentType)
  }
}

export class clPricingTransformer extends clTransformer<TpricingPageSource, TpricingPageTarget> {
  async performTransformation(idSourceData: TpricingPageSource): Promise<TpricingPageTarget> {
    this.targetData = idSourceData
    return this.targetData
  }
  constructor(iContentType: string) {
    super(iContentType)
  }
}

export class clSolutionsTransformer extends clTransformer<TsolutionsPageSource, TsolutionsPageTarget> {
  async performTransformation(idSourceData: TsolutionsPageSource): Promise<TsolutionsPageTarget> {
    this.targetData = idSourceData
    return this.targetData
  }
  constructor(iContentType: string) {
    super(iContentType)
  }
}

export class clProductsTransformer extends clTransformer<TproductsPageSource, TproductsPageTarget> {
  async performTransformation(idSourceData: TproductsPageSource): Promise<TproductsPageTarget> {
    this.targetData = idSourceData
    return this.targetData
  }
  constructor(iContentType: string) {
    super(iContentType)
  }
}
export class clCareersTransformer extends clTransformer<TcareersPageSource, TcareersPageTarget> {
  async performTransformation(idSourceData: TcareersPageSource): Promise<TcareersPageTarget> {
    this.targetData = idSourceData
    return this.targetData
  }
  constructor(iContentType: string) {
    super(iContentType)
  }
}

export class clIndustriesTransformer extends clTransformer<TindustriesPageSource, TindustriesPageTarget> {
  async performTransformation(idSourceData: TindustriesPageSource): Promise<TindustriesPageTarget> {
    this.targetData =idSourceData
    return this.targetData
  }
  constructor(iContentType: string) {
    super(iContentType)
  }
}

// TermsandConditions transformer
export class clTermsandConditionsTransformer extends clTransformer<TtermsAndConditionsPageSource, TtermsAndConditionsPageTarget> {
  async performTransformation(idSourceData: TtermsAndConditionsPageSource): Promise<TtermsAndConditionsPageTarget> {
    this.targetData = idSourceData;
    return this.targetData;
  }
  constructor(iContentType: string) {
    super(iContentType);
  }
}

// PrivacyPolicy transformer
export class clPrivacyPolicyTransformer extends clTransformer<TprivacyPolicyPageSource, TprivacyPolicyPageTarget> {
  async performTransformation(idSourceData: TprivacyPolicyPageSource): Promise<TprivacyPolicyPageTarget> {
    this.targetData = idSourceData;
    return this.targetData;
  }
  constructor(iContentType: string) {
    super(iContentType);
  }
}

// An interface to hold the list of Transformer class
interface ITransformerMap {
  trend: clTrendsTransformer;
  Pricing: clPricingTransformer;
  Solutions: clSolutionsTransformer;
  Products: clProductsTransformer;
  Careers: clCareersTransformer;
  Industries: clIndustriesTransformer;
  PrivacyPolicy: clPrivacyPolicyTransformer;
  TermsAndConditions: clTermsandConditionsTransformer;
   // Add other content types and corresponding transformers
}
// A factory class to create a new instance for the transformation engine
export class clTransformerFactory {
  // method to return the respective class for the content type
  private static transformerMap: {
    [K in keyof ITransformerMap]: new (icontentType: K) => ITransformerMap[K];
  } = {
      trend: clTrendsTransformer,
      Pricing: clPricingTransformer,
      Solutions: clSolutionsTransformer,
      Products: clProductsTransformer,
      Careers: clCareersTransformer,
      Industries: clIndustriesTransformer,
      PrivacyPolicy: clPrivacyPolicyTransformer,
      TermsAndConditions: clTermsandConditionsTransformer,
      // Add other content types and corresponding transformers
    };

  // Create a new instance of the tranformer for the content type
  static createTransformer<K extends keyof ITransformerMap>(
    iContentType: K
  ): ITransformerMap[K] {
    const TransformerClass = this.transformerMap[iContentType];
    if (!TransformerClass) {
      // Log error if there isn't a specific implemenation for the content type
      // for debugging
      console.error(`Transformer not found for contentType: ${iContentType}`);
      throw new Error(`Invalid transformer type: ${iContentType}`);
    }

    return new TransformerClass(iContentType); // use contentType as constructor arg
  }
}
