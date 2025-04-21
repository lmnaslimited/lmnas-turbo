import { Iquery, TpricingPageSource, TproductsPageSource, TsolutionsPageSource, TtrendsPageSource } from "../types";
import { client } from '../lib/apollo-client';
import { gql } from "@apollo/client";

// The clQuery class implements the Iquery interface and provides a base implementation for executing GraphQL queries.
export abstract class clQuery<DynamicSourceType> implements Iquery<DynamicSourceType> {
  query: string;
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
  constructor() {
    this.query = this.getQuery()
  }
}
// The clQueryTrends class extends the clQuery class and provides a specific implementation for the "Trends" query.

export class clQueryTrends extends clQuery<TtrendsPageSource> {
  constructor() {
    super();
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
}`;
  }

  async executeQuery(): Promise<TtrendsPageSource> {
    return super.executeQuery();
  }
}

export class clQueryPricing extends clQuery<TpricingPageSource> {
  constructor() {
    super();
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
  constructor() {
    super();
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

export class clQueryProducts extends clQuery<TproductsPageSource> {
  constructor() {
    super();
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
export class clQueryFactory {
  private static queryMap: { [key: string]: new () => Iquery<any> } = {
    "Trends": clQueryTrends,
    "Pricing": clQueryPricing,
    "Solutions": clQuerySolutions,
    "Products": clQueryProducts,
    // Add more mappings here
  };

  static createQuery<T extends object>(queryType: string): Iquery<T> {
    const QueryClass = this.queryMap[queryType];
    if (!QueryClass) throw new Error(`Invalid query type: ${queryType}`);
    return new QueryClass();
  }
}