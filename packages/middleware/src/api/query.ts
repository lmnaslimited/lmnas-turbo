import { IQuery, TpricingPageSource, TproductsPageSource, TsolutionsPageSource, TcareersPageSource, TtrendsPageSource, TindustriesPageSource } from "../types";
import { client } from '../lib/apollo-client';
import { gql } from "@apollo/client";

// The clQuery class implements the Iquery interface and provides a base implementation for executing GraphQL queries.
export abstract class clQuery<DynamicSourceType> implements IQuery<DynamicSourceType> {
  query: string;
  contentType: string;
  locale: string;
  iDvaribles: {}
  // The getQuery method is abstract and must be implemented by subclasses to return the actual GraphQL query string. 
  abstract getQuery(): string;

  async executeQuery(): Promise<DynamicSourceType> {
    const { data } = await client.query({
      query: gql`${this.query}`
    });
    return (data) as DynamicSourceType;
  }
  constructor(iContentType: string) {
    this.contentType = iContentType
    this.query = this.getQuery()
  }
}
// The clQueryTrends class extends the clQuery class and provides a specific implementation for the "Trends" query.

export class clQueryTrends extends clQuery<TtrendsPageSource> {
  constructor(iContentType: string) {
    super(iContentType);
  }

  getQuery(): string {
    return `
  query Trend($locale: I18NLocaleCode) {
  trend(locale: $locale) {
  heroSection {
      heading {
        title
        subtitle
        highlight
      }
      description
      buttons {
        label
        href
        icon
        formMode
        variant
      }
    }
  }
}`
  }

  async executeQuery(): Promise<TtrendsPageSource> {
    return super.executeQuery();
  }
}

export class clQueryIndustries extends clQuery<TindustriesPageSource> {
  constructor(iContentType: string) {
    super(iContentType);
  }

  getQuery(): string {
    return `
  query Industrie($locale: I18NLocaleCode){
  industries(locale: $locale) {
    slug
    heroSection {
      heading {
        title
        subtitle
        highlight
        badge
      }
      highlight {
        label
        icon
      }
      image {
        alt
        src
      }
      buttons {
        formMode
        href
        icon
        label
        variant
      }
    }
  }
}
`
  }
}

export class clQueryPricing extends clQuery<TpricingPageSource> {
  constructor(iContentType: string) {
    super(iContentType);
  }

  getQuery(): string {
    return `
  query Pricing($locale: I18NLocaleCode) {
  pricing(locale: $locale) {
  heroSection {
      heading {
        title
        subtitle
        highlight
      }
      description
      buttons {
        label
        href
        icon
        formMode
        variant
      }
    }
  }
}`;
  }
}

export class clQuerySolutions extends clQuery<TsolutionsPageSource> {
  constructor(iContentType: string) {
    super(iContentType);
  }

  getQuery(): string {
    return `
  query Solution($locale: I18NLocaleCode) {
  solution(locale: $locale) {
  heroSection {
      heading {
        title
        subtitle
        highlight
      }
      image {
        src
        alt
      }
      buttons {
        label
        href
        icon
        formMode
        variant
      }
    }
  }
}`;
  }
}

export class clQueryProducts extends clQuery<TproductsPageSource> {
  constructor(iContentType: string) {
    super(iContentType);
  }

  getQuery(): string {
    return `
  query Products($locale: I18NLocaleCode) {
  products(locale: $locale) {
  heroSection {
      heading {
        title
        subtitle
        highlight
      }
      description
      buttons {
        label
        href
        icon
        formMode
        variant
      }
    }
  }
}`;
  }
}

export class clQueryCareers extends clQuery<TcareersPageSource> {
  constructor(iContentType: string) {
    super(iContentType);
  }

  getQuery(): string {
    return `
  query Career($locale: I18NLocaleCode) {
  career(locale: $locale) {
  heroSection {
      heading {
        title
        subtitle
        highlight
        badge
      }
      description
      buttons {
        label
        href
        icon
        formMode
        variant
      }
    image {
      src
      alt
    }
  }
  }
}`
  }
}


export class clQueryFactory {
  private static queryMap: { [key: string]: new (icontentType: string) => IQuery<any> } = {
    "Trends": clQueryTrends,
    "Pricing": clQueryPricing,
    "Solutions": clQuerySolutions,
    "Products": clQueryProducts,
    "Careers": clQueryCareers,
    "Industries": clQueryIndustries,
    // Add more mappings here
  };

  static createQuery<T extends object>(iContentType: string): IQuery<T> {
    const QueryClass = this.queryMap[iContentType];
    if (!QueryClass) throw new Error(`Invalid query type: ${iContentType}`);
    return new QueryClass(iContentType);
  }
}