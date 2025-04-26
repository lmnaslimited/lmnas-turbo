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
      query: gql`${this.query}`,
      variables: this.variables || {},
    });
    return (data) as DynamicSourceType;
  }
  setVariables(variables: Record<string, any>): void {
    this.variables = variables;
  }
  constructor(iContentType: string) {
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
        variant
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
}

export class clQueryCareers extends clQuery<TcareersPageSource> {
  constructor(iContentType: string) {
    super(iContentType);
  }

  getQuery(): string {
    return `
  query Career($locale: I18NLocaleCode) {
   ${this.contentType}(locale: $locale) {
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
    trendingSection {
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
  ${this.contentType}(locale: $locale) {
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
  ${this.contentType}(locale: $locale) {
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

export class clQueryIndustries extends clQuery<TindustriesPageSource> {
  constructor(iContentType: string) {
    super(iContentType);
  }

  getQuery(): string {
    return `
  query Industries($locale: I18NLocaleCode, $filters: IndustryFiltersInput) {
  ${this.contentType}(locale: $locale, filters: $filters) {
    name
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
       source
        alternate
      }
      buttons {
        formMode
        href
        icon
        label
        variant
      }
    }
    problemSection {
      header {
        highlight
        title
        subtitle
      }
      list {
        icon
        label
        description
      }
      title
      subtitle
      buttons {
        label
        href
        variant
        formMode
        icon
      }
    }
    featuresSectionHeader {
      title
      subtitle
    }
    feature {
      header {
        title
        subtitle
      }
      image {
        source
        alternate
      }
      card {
        header {
          title
          subtitle
        }
        buttons {
          label
          href
        }
      }
    }
    allFeatureHeader {
      title
    }
    allFeatureCard {
      header {
        title
        subtitle
      }
      image {
        source
        alternate
      }
      category
      link {
        label
        href
      }
    }
    cta {
      header {
        title
        subtitle
      }
      list {
        icon
        label
        description
      }
      title
      buttons {
        label
        formMode
      }
    }
    successStoryHeaderFooter {
      header {
        title
        subtitle
      }
      title
      buttons {
        label
        formMode
      }
    }
    successStoryCard {
      header {
        title
        subtitle
      }
      category
      image {
        source
        alternate
      }
      buttons {
        label
        href
      }
    }
  }
}`}
}

export class clQueryPricing extends clQuery<TpricingPageSource> {
  constructor(iContentType: string) {
    super(iContentType);
  }

  getQuery(): string {
    return `
  query Pricing($locale: I18NLocaleCode) {
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
        variant
      }
    }
    problemSection {
      header {
        highlight
        subtitle
      }
      list {
        icon
        label
        description
      }
      title
      buttons {
        label
        href
        formMode
        variant
      }
    }
  }
}`
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
  query Products($locale: I18NLocaleCode, $filters: ProductFiltersInput) {
  ${this.contentType}(locale: $locale, filters: $filters) {
    slug
    heroSection {
      heading {
        title
        subtitle
      }
      buttons {
        label
        href
        formMode
        variant
      }
      image {
        source
        alternate
      }
    }
    problemsHeader {
      title
      subtitle
    }
    problemsSection {
      title
      list {
        label
        description
      }
      header {
        title
        subtitle
      }
      buttons {
        variant
        label
        href
        formMode
      }
    }
    solutionsHeaderFooter {
      header {
        title
        subtitle
      }
      buttons {
        label
        href
        variant
      }
    }
    solutionsCard {
      header {
        title
        subtitle
      }
      buttons {
        label
        href
      }
    }
    guideSectionHeaderFooter {
      header {
        title
      }
      title
      buttons {
        label
        href
        formMode
        variant
      }
    }
    guideFeature {
      highlight {
        icon
        label
      }
      heading {
        title
        subtitle
      }
      buttons {
        label
        href
      }
      image {
        svg
      }
    }
    successStoryHeaderFooter {
      header {
        title
      }
      title
      subtitle
      buttons {
        label
        href
        formMode
        variant
      }
    }
    successStoryCard {
      header {
        subtitle
      }
      avatar {
        source
        alternate
      }
      link {
        label
      }
    }
    successStoryHighlight {
      label
      description
    }
    pricingSectionHeaderFooter {
      header {
        title
        subtitle
        badge
      }
      title
      subtitle
      buttons {
        label
        href
        formMode
        variant
      }
    }
    pricingHighlight {
      header {
        title
        subtitle
        badge
      }
      list {
        label
        description
      }
    }
    ctaSectionHeader {
      title
      subtitle
    }
    ctaSection {
      header {
        title
        subtitle
        badge
      }
      title
      subtitle
      buttons {
        label
        href
        variant
        formMode
      }
    }
  }
}`;
  }
}

export class clQueryFactory {
  private static queryMap: { [key: string]: new (icontentType: string) => IQuery<any> } = {
    "trend": clQueryTrends,
    "career": clQueryCareers,
    "pricing": clQueryPricing,
    "Solutions": clQuerySolutions,
    "products": clQueryProducts,
    "industries": clQueryIndustries,
    "termsAndCondition": clQueryTermsAndConditions,
    "privacyPolicy": clQueryPrivacyPolicy,
    // Add more mappings here
  };

  static createQuery<T extends object>(iContentType: string): IQuery<T> {
    const QueryClass = this.queryMap[iContentType];
    if (!QueryClass) throw new Error(`Invalid query type: ${iContentType}`);
    return new QueryClass(iContentType);
  }
}