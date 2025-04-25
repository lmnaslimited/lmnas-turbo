import { IQuery, TpricingPageSource, TproductsPageSource, TsolutionsPageSource, TcareersPageSource, TtrendsPageSource, TindustriesPageSource, TtermsAndConditionsPageSource, TprivacyPolicyPageSource, TslugsSource } from "../types";
import { client } from '../lib/apollo-client';
import { gql } from "@apollo/client";

// The clQuery class implements the Iquery interface and provides a base implementation for executing GraphQL queries.
export abstract class clQuery<DynamicSourceType> implements IQuery<DynamicSourceType> {
    query: string;
    contentType: string;
    locale: string;
    variables?: Record<string, any>;
    // The getQuery method is abstract and must be implemented by subclasses to return the actual GraphQL query string. 
    abstract getQuery(): string;
    
    async executeQuery(): Promise<DynamicSourceType> {
      // Set params of the query
      // this.setVariables({locale: this.locale})
      const { data } = await client.query({
        query:gql`${this.query}`,
        variables: this.variables || {},
      });    
      return (data) as DynamicSourceType;   
    }
    setVariables(variables: Record<string, any>): void {
      this.variables = variables;
    }
    constructor(iContentType: string){
        this.contentType = iContentType
        this.locale = 'en'
        this.query = this.getQuery()
    }
}
// The clQueryTrends class extends the clQuery class and provides a specific implementation for the "Trends" query.
export class clQuerySlug extends clQuery<TslugsSource> {
  constructor(iContentType: string) {
    super(iContentType);
  }
  getQuery(): string {
    return `
    query Slugs {
      ${this.contentType} {
        slug
      }
    }`
  }
}

export class clQueryTrends extends clQuery<TtrendsPageSource> {
  constructor(iContentType: string) {
    super(iContentType);
  }

  getQuery(): string {
    return `
  query Trend($locale: I18NLocaleCode) {
  ${this.contentType}(locale: $locale) {
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
      }
    }
    frustrationSection {
      ... on ComponentCoreHeader {
        title
        
      }
      ... on ComponentSharedCallout {
        header {
          title
        }
        buttons {
          label
          formMode
          variant
          icon
        }
        title
        subtitle
      }
    }
    noiseSection {
      heading {
        title
        subtitle
      }
      point {
        label
        description
      }
    }
    trendingSection {
      title
      highlight
      subtitle
    }
    showAll {
      label
    }
    calloutSection {
      header {
        highlight
        title
      }
      title
      buttons {
        icon
        href
        label
        variant
        formMode
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
       source:src
        alternate:alt
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
        source:src
        alternate:alt
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
      }
    image {
      source:src
        alternate:alt
      
    }
  }
  challengeSection {
      heading {
        title
        subtitle
        badge
      }
      highlight {
        label
        description
      }
      image {
        source:src
        alternate:alt
      }
      buttons {
        label
        href
      }
    }
    guideSection {
      ... on ComponentSharedTeckStack {
        heading {
          title
          subtitle
          badge
        }
        point {
          icon
          title:label
          subtitle:description
        }
      }
      ... on ComponentCoreButton {
        label
        href
      }
    }
    jobsSection {
      header {
        title
        subtitle
        highlight
      }
      list {
        title:label
        subtitle:description
      }
      buttons {
        label
        href
        formMode
        description
        icon
        variant
      }
    }
    planSection {
      heading {
        title
        subtitle
        badge
        highlight
      }
      highlight {
        title:label
        subtitle:description
      }
      image {
        source:src
        alternate:alt
      }
      buttons {
        label
        href
        variant
      }
    }
      trendingSection{
      title
      subtitle
      }
    
  }
}`
  }
}


export class clQueryTermsAndConditions extends clQuery<TtermsAndConditionsPageSource> {
  constructor(iContentType: string) {
    super(iContentType);
  }

  getQuery(): string {
    return `
  query Query($locale: I18NLocaleCode) {
  termsAndCondition(locale: $locale) {
    header {
      title
      subtitle
      highlight
    }
    acknowledgment
    faq {
      heading {
        title
      }
      point {
        label
        description
      }
    }
    contact {
      label
      description
      websiteLabel
      websiteHref
      emailLabel
      emailHref
    }
  }
}`
  }
}


export class clQueryPrivacyPolicy extends clQuery<TprivacyPolicyPageSource> {
  constructor(iContentType: string) {
    super(iContentType);
  }

  getQuery(): string {
    return `
  query Query($locale: I18NLocaleCode) {
  privacyPolicy(locale: $locale) {
    header {
      title
      subtitle
      highlight
    }
    acknowledgment
    faq {
      heading {
        title
      }
      point {
        label
        description
      }
    }
    contact {
      label
      description
      websiteLabel
      websiteHref
      emailLabel
      emailHref
    }
  }
}`
  }
}




export class clQueryFactory {
  private static queryMap: { [key: string]: new (icontentType: string) => IQuery<any> } = {
    "trend": clQueryTrends,
    "Pricing": clQueryPricing,
    "Solutions": clQuerySolutions,
    "Products": clQueryProducts,
    "Careers": clQueryCareers,
    "Industries": clQueryIndustries,
    "TermsAndConditions": clQueryTermsAndConditions,
    "PrivacyPolicy": clQueryPrivacyPolicy,  
    // Add more mappings here
  };

  static createQuery<T extends object>(iContentType: string): IQuery<T> {
    const QueryClass = this.queryMap[iContentType];
    if (!QueryClass) throw new Error(`Invalid query type: ${iContentType}`);
    return new QueryClass(iContentType);
  }
}