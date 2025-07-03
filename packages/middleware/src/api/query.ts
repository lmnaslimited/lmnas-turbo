import {
  IQuery,
  TpricingPageSource,
  TproductsPageSource,
  TcareerPageSource,
  TtrendsPageSource,
  TindustriesPageSource,
  TtermsAndConditionsPageSource,
  TprivacyPolicyPageSource,
  TslugsSource,
  ThomePageSource,
  TnavbarSource,
  TfooterSource,
  TcontactSource,
  TsolutionPageSource,
  TcaseStudiesPageSource,
  TaboutUsPageSource,
  TeventPageSource,
  TformsPageSource,
} from "../types";
import { client } from "../lib/apollo-client";
import { gql } from "@apollo/client";

// The clQuery class implements the Iquery interface and provides a base implementation for executing GraphQL queries.
export abstract class clQuery<DynamicSourceType>
  implements IQuery<DynamicSourceType> {
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
      query: gql`
        ${this.query}
      `,
      variables: this.variables || {},
      fetchPolicy: "no-cache",
    });
    return data as DynamicSourceType;
  }
  setVariables(variables: Record<string, any>): void {
    this.variables = variables;
  }
  constructor(iContentType: string) {
    this.contentType = iContentType;
    this.locale = "en";
    this.query = this.getQuery();
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
    }`;
  }
}

export class clQueryGlobalMeta extends clQuery<TnavbarSource> {
  constructor(iContentType: string) {
    super(iContentType);
  }

  getQuery(): string {
    return `
  query GlobalMeta {
  globalMeta {
      metadataBase
      robotsIndex
      robotsFollow
      robotsNocache
      googleBotIndex
      googleBotFollow
      googleBotMaxSnippet
      googleBotMaxImagePreview
      googleBotMaxVideoPreview
      authorsName
      authorsURL
      creator
      publisher
      applicationName
      icons {
        url
        type
        sizes
      }
      apple {
        url
        type
        sizes
      }
      shortcut
      appleWebAppCapable
      appleWebAppTitle
      appleWebAppStatusBarStyle
      manifest
      schemaData
  }
}`;
  }
}

export class clQueryNavbar extends clQuery<TnavbarSource> {
  constructor(iContentType: string) {
    super(iContentType);
  }

  getQuery(): string {
    return `
  query Navbar($locale: I18NLocaleCode) {
  ${this.contentType}(locale: $locale) {
    locale
    logo {
      label
      href
    }
    menu {
      label
      href
      icon
    }
    product {
      label
      href
      description
      icon
    }
    industry {
      label
      href
      description
      icon
    }
    more {
      label
      href
    }
    language {
      label
      description
      icon
    }
  }
}`;
  }
}

export class clQueryFooter extends clQuery<TfooterSource> {
  constructor(iContentType: string) {
    super(iContentType);
  }

  getQuery(): string {
    return `
  query Footer($locale: I18NLocaleCode) {
    ${this.contentType}(locale: $locale) {
      companyName
      companyInfo
      social {
        label
        href
        icon
      }
      menu {
        label
        description
        icon
      }
      product {
        label
        href
      }
      more {
        label
        href
      }
      contact {
        address
        phoneLabel
        phoneHref
        emailLabel
        emailHref
      }
      policies {
        label
        href
      }
    }
  }`;
  }
}

export class clQueryHome extends clQuery<ThomePageSource> {
  constructor(iContentType: string) {
    super(iContentType);
  }

  getQuery(): string {
    return `
  query Home($locale: I18NLocaleCode) {
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
      source
        alternate
      }
    }
      problemSection {
      highlight {
        label
        description
        icon
      }
      buttons {
        label
        href
        icon  
      }
      heading {
        title
        subtitle
        highlight
        badge
      }
    }
    faqSection {
      title
      list {
        label
        description
      }
    }
    calloutSection {
      header {
        title
        subtitle
      }
      buttons {
        label
        formMode
        variant
        icon
      }
      title
      subtitle
      list {
        label
        icon
        description
      }
    }
    socialSection {
      heading {
        title
        subtitle
      }
      description
      highlight {
        label
        description
      }
      buttons {
        label
        href
        icon
      }
    }
    trendingNowSection {
      header {
        title
        subtitle
      }
      title
      subtitle
      buttons {
        label
        href
        description
        icon
        variant
      }
    }
    testimonials {
      header {
        title
        subtitle
      }
      avatar {
        svg
        alternate
        source
      }
      avatarDetails {
        icon
        label
        description
      }
      image {
        svg
        alternate
        source
      }
    }
    successClients {
      svg
      source
      alternate
    }
    metaData {
      title
      description
      keywords {
        description
      }
      canonical
      ogTitle
      ogDescription
      ogUrl
      ogType
      ogSiteName
      ogLocale
      ogImages {
        url
        width
        height
        alt
      }
      twitterCard
      twitterTitle
      twitterDescription
      twitterImage 
      twitterCreator
      category
      schemaData
    }
  }
}`;
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
      description
    }
    calloutSection {
      header {
        title
      }
      title
      buttons {
        icon
        label
        variant
        formMode
      }
    }
    metaData {
      title
      description
      keywords {
        description
      }
      canonical
      ogTitle
      ogDescription
      ogUrl
      ogType
      ogSiteName
      ogLocale
      ogImages {
        url
        width
        height
        alt
      }
      twitterCard
      twitterTitle
      twitterDescription
      twitterImage
      twitterCreator
      category
      schemaData
    }
  }
}`;
  }
}

export class clQueryCareer extends clQuery<TcareerPageSource> {
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
      source
        alternate
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
        source
        alternate
      }
      buttons {
        label
        href
        icon
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
        source
        alternate
      }
      buttons {
        label
        href
        variant
        icon
      }
    }
    trendingSection {
      title
      highlight
      subtitle
    }
    trendingFooter {
      label
      description
    }
    metaData {
      title
      description
      keywords {
        description
      }
      canonical
      ogTitle
      ogDescription
      ogUrl
      ogType
      ogSiteName
      ogLocale
      ogImages {
        url
        width
        height
        alt
      }
      twitterCard
      twitterTitle
      twitterDescription
      twitterImage
      twitterCreator
      category
      schemaData
    }
  }
}`;
  }
}

export class clQueryAboutUs extends clQuery<TaboutUsPageSource> {
  constructor(iContentType: string) {
    super(iContentType);
  }

  getQuery(): string {
    return `
  query AboutUs($locale: I18NLocaleCode) {
  ${this.contentType}(locale: $locale) {
    heroSection {
      heading {
        title
        subtitle
      }
      highlight {
        label
      }
    }
    valuesSectionHeaderFooter {
      header {
        title
        subtitle
        badge
      }
      title
    }
    valuesSection {
      title
      subtitle
      highlight
      badge
    }
    previousYears {
      label
      icon
      description
    }
    currentAndBeyondYears {
      heading {
        title
        subtitle
        highlight
      }
      highlight {
        label
      }
    }
    timeLineHeader {
      title
      subtitle
    }
    testimonialHeader {
      title
      subtitle
    }
    testimonalCard {
      header {
        subtitle
      }
      image {
        svg
        alternate
      }
      avatar {
        source
        alternate
      }
      avatarDetails {
        label
        description
      }
    }
    ctaSection {
      header {
        title
        subtitle
      }
      title
      buttons {
        icon
        label
        href
        formMode
      }
    }
    metaData {
      title
      description
      keywords {
        description
      }
      canonical
      ogTitle
      ogDescription
      ogUrl
      ogType
      ogSiteName
      ogLocale
      ogImages {
        url
        width
        height
        alt
      }
      twitterCard
      twitterTitle
      twitterDescription
      twitterImage 
      twitterCreator
      category
      schemaData
    }
  }
}`;
  }
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
      }
      description
      buttons {
        label
        href
        variant
        icon
        formMode
      }
    }
    problemSection {
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
        href
        formMode
        variant
        icon
      }
    }
    planHeader {
      title
      badge
      subtitle
    }
    planSection {
      tableHead
      pricingPlans {
        name
        users
        warranty
        support
        maintenance
        db
        consulting
      }
      features {
        label
      }
    }
    planFooter {
      title
      header {
        title
        subtitle
      }
      buttons {
        label
        href
        variant
        formMode
        icon
      }
      list {
        label
      }
    }
    testimonialHeader {
      header {
        title
      }
      buttons {
        label
        href
        icon
      }
    }
    testimonialSection {
      header {
        title
        subtitle
      }
      avatar {
        source
        alternate
      }
      avatarDetails {
        label
        description
      }
    }
    faqSection {
      heading {
        title
        subtitle
        badge
      }
      point {
        label
        description
      }
    }
    guideHeader {
      title
      subtitle
      badge
    }
    guideCategories {
      label
    }
    guideTableHeader {
      label
    }
    guideSection {
      badge
      title
      highlight
      subtitle
    }
    guideFooter {
      header {
        title
        subtitle
      }
      buttons {
        label
        href
        icon
        formMode
        variant
      }
    }
    guideCallout {
      highlight
      subtitle
      badge
  }
  ctaSection {
    heading {
        title
        subtitle
        badge
      }
      description
      buttons {
        description
        label
        href
        formMode
        variant
        icon
    }
  }
  metaData {
      title
      description
      keywords {
        description
      }
      canonical
      ogTitle
      ogDescription
      ogUrl
      ogType
      ogSiteName
      ogLocale
      ogImages {
        url
        width
        height
        alt
      }
      twitterCard
      twitterTitle
      twitterDescription
      twitterImage
      twitterCreator
      category
      schemaData
    }
  }
}`;
  }
}

export class clQueryContact extends clQuery<TcontactSource> {
  constructor(iContentType: string) {
    super(iContentType);
  }

  getQuery(): string {
    return `
  query Contact($locale: I18NLocaleCode, $filters: FormFiltersInput) {
  ${this.contentType}(locale: $locale)  {
    header {
      title
      subtitle
      highlight
    }
    contactForm {
      fieldDisplay
      defaultValue
      loading {
        label
        description
      }
      name
      options {
        label
        value
      }
      placeholder
      required
      type
      validationMessage
    }
    bookingForm {
      fieldDisplay
      defaultValue
      loading {
        label
        description
      }
      name
      options {
        label
        value
      }
      placeholder
      required
      type
      validationMessage
    }
    metaData {
      title
      description
      keywords {
        description
      }
      canonical
      ogTitle
      ogDescription
      ogUrl
      ogType
      ogSiteName
      ogLocale
      ogImages {
        url
        width
        height
        alt
      }
      twitterCard
      twitterTitle
      twitterDescription
      twitterImage 
      twitterCreator
      category
      schemaData
    }
  }
  forms(filters: $filters) {
    title
    terms {
      label
      href
    }
    successTitle
    successMessage
    submitText
    showTerms
    privacy {
      label
      href
    }
    description
    formId
    verifiedMessage {
      label
      description
    }
    unVerifiedMessage {
      label
      description
    }
    policyDescription
  }
}`;
  }
}

export class clQueryEvent extends clQuery<TeventPageSource> {
  constructor(iContentType: string) {
    super(iContentType);
  }

  getQuery(): string {
    return `
  query Event($locale: I18NLocaleCode) {
  ${this.contentType}(locale: $locale) {
    heroSection {
      heading {
        highlight
        title
      }
      buttons {
        label
      }
    }
    metaData {
      title
      description
      keywords {
        description
      }
      canonical
      ogTitle
      ogDescription
      ogUrl
      ogType
      ogSiteName
      ogLocale
      ogImages {
        url
        width
        height
        alt
      }
      twitterCard
      twitterTitle
      twitterDescription
      twitterImage 
      twitterCreator
      category
      schemaData
    }
  }
}`;
  }
}

export class clQuerySolution extends clQuery<TsolutionPageSource> {
  constructor(iContentType: string) {
    super(iContentType);
  }

  getQuery(): string {
    return `
  query Solution($locale: I18NLocaleCode,$caseStudiesLocale2: I18NLocaleCode, $caseStudiesFilters2: CaseStudyFiltersInput) {
  solution(locale: $locale) {
  heroSection {
      heading {
        title
        subtitle
        highlight
      }
      image {
        source
        alternate
      }
      buttons {
        label
        href
        icon
        formMode
        variant
      }
    }
    guideHeader {
      title
      subtitle
    }
    guideSection {
      header {
        title
        subtitle
      }
      buttons {
        label
        variant
        href
        icon
      }
    }
    guideFooter {
      header {
        title
        subtitle
      }
      buttons {
        label
        formMode
        icon
        href
        variant
      }
    }
    planHeader {
      title
      subtitle
    }
    planCard {
      header {
        title
        subtitle
        badge
      }
      image {
        svg
      }
    }
    planFooter {
      header {
        title
        subtitle
      }
      buttons {
        formMode
        variant
        icon
        label
        href
      }
    }
    solutionHeader {
      title
      subtitle
    }
    solutionSection {
      header {
        title
        subtitle
      }
      buttons {
        label
        variant
        href
        icon
        formMode
      }
    }
    solutionFooter {
      title
      buttons {
        label
        formMode
        icon
      }
    }
    successHeader {
      title
      subtitle
    }
    successSection {
      header {
        subtitle
        title
      }
      category
      image {
        source
        alternate
      }
      buttons {
        label
        href
        variant
        formMode
        icon
      }
    }
    successFooter {
      label
      variant
      formMode
      icon
    }
    storyHeader {
      title
      subtitle
    }
    storySection {
      header {
        title
        subtitle
      }
    }
    storyFooter {
      label
      formMode
      variant
      icon
      description
    }
    calloutHeader {
      title
      subtitle
    }
    calloutCard {
      header {
        subtitle
      }
      image {
        svg
        alternate
      }
      avatar {
        alternate
        source
      }
      avatarDetails {
        label
        description
      }
    }
    calloutFooter {
      header {
        title
        subtitle
      }
      title
      buttons {
        label
        href
        icon
      }
    }
    calloutSection {
      header {
        title
      }
      title
      subtitle
      list {
        label
      }
      buttons {
        variant
        formMode
        label
        icon
      }
    }
    metaData {
      title
      description
      keywords {
        description
      }
      canonical
      ogTitle
      ogDescription
      ogUrl
      ogType
      ogSiteName
      ogLocale
      ogImages {
        url
        width
        height
        alt
      }
      twitterCard
      twitterTitle
      twitterDescription
      twitterImage 
      twitterCreator
      category
      schemaData
    }
  }
  caseStudies(locale: $caseStudiesLocale2, filters: $caseStudiesFilters2) {
    solutionSection {
      successCard {
        header {
        title
        subtitle
      }
      buttons {
        label
        href
        icon
      }
      }
    }
    heroSection {
      tag
      image {
        source
        alternate
      }
    }
  }
  home {
    successClients {
      svg
      source
      alternate
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
        badge
      }
      buttons {
        label
        href
        formMode
        variant
        icon
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
        icon
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
        icon
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
        formMode
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
        icon
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
        source
        alternate
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
        icon
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
        icon
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
      badge
    }
    ctaSection {
      header {
        title
        subtitle
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
    metaData {
      title
      description
      keywords {
        description
      }
      canonical
      ogTitle
      ogDescription
      ogUrl
      ogType
      ogSiteName
      ogLocale
      ogImages {
        url
        width
        height
        alt
      }
      twitterCard
      twitterTitle
      twitterDescription
      twitterImage
      twitterCreator
      category
      schemaData
    }
  }
}`;
  }
}

export class clQueryForms extends clQuery<TformsPageSource> {
  constructor(iContentType: string) {
    super(iContentType);
  }

  getQuery(): string {
    return `
 query Forms($locale: I18NLocaleCode) {
   ${this.contentType}(locale: $locale) {
     formId
    title
    description
    submitText
    showTerms
    successMessage
    successTitle
    verifiedMessage {
      label
      description
    }
    unVerifiedMessage {
      label
      description
    }
    privacy {
      href
      label
    }
    terms {
      href
      label
    }
    policyDescription
    fields {
      fieldDisplay
      defaultValue
      loading {
        label
        description
      }
      name
      options {
        label
        value
      }
      placeholder
      required
      type
      validationMessage
    }
  }
}`;
  }
}

export class clQueryIndustries extends clQuery<TindustriesPageSource> {
  constructor(iContentType: string) {
    super(iContentType);
  }

  getQuery(): string {
    return `
 query Industries($locale: I18NLocaleCode, $filters: IndustryFiltersInput, $caseStudiesLocale2: I18NLocaleCode, $caseStudiesFilters2: CaseStudyFiltersInput) {
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
          icon
        }
      }
    }
    allFeatureHeader {
      title
      highlight
      badge
    }
    allFeatureCard {
      header {
        title
        subtitle
      }
      image {
        svg
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
        icon
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
      list {
        label
        description
      }
    }
    metaData {
      title
      description
      keywords {
        description
      }
      canonical
      ogTitle
      ogDescription
      ogUrl
      ogType
      ogSiteName
      ogLocale
      ogImages {
        url
        width
        height
        alt
      }
      twitterCard
      twitterTitle
      twitterDescription
      twitterImage
      twitterCreator
      category
      schemaData
    }
  }
  caseStudies(locale: $caseStudiesLocale2, filters: $caseStudiesFilters2) {
    solutionSection {
      successCard {
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
        icon
      }
      }
    }
  }
}`;
  }
}

export class clQueryCaseStudies extends clQuery<TcaseStudiesPageSource> {
  constructor(iContentType: string) {
    super(iContentType);
  }

  getQuery(): string {
    return `
    query CaseStudies($locale: I18NLocaleCode,  $filters: CaseStudyFiltersInput, $footerLocale2: I18NLocaleCode,$caseStudiesFilters2: CaseStudyFiltersInput) {
    ${this.contentType}(locale: $locale, filters: $filters) {
    slug
    name
    pdfName
    heroSection {
      tag
      header {
        title
        subtitle
      }
      image{
        source
        }
      buttons {
        label
        href
        formMode
      }
      link {
        label
        href
      }
      list {
        label
        icon
      }
    }
    problemSection {
      ... on ComponentSharedCallout {
        header {
          subtitle
          title
          badge
        }
        buttons {
          label
          formMode
        }
        list {
          label
        }
        title
        subtitle
      }
    }
    solutionSection {
      successCard {
        header {
          title
          subtitle
        }
      }
      products {
        label
      }
      details {
        label
      }
      title
      results {
        title
        subtitle
      }
      testimonial {
        author
        quote
        verify
        title
      }
      footer {
        description
        highlight {
          label
          icon
        }
        buttons {
          label
          formMode
        }
      }
    }
    sidebarData {
      header {
        title
        subtitle
      }
      buttons {
        label
        href
        icon
        formMode
      }
      list {
        label
        description
      }
      link {
        label
        href
      }
    }
    ctaSection {
      header {
        title
        subtitle
        badge
      }
        title
      buttons {
        label
        href
      }
    }
    conclusion {
      subtitle
    }
  }
  allCaseStudies: caseStudies(locale: $locale,filters: $caseStudiesFilters2) {
    solutionSection {
      successCard {
        header {
        title
        subtitle
      }
      buttons {
        label
        href
        icon
      }
      }
    }
    heroSection {
      tag
      image {
        source
        alternate
      }
    }
  }
  footer(locale: $footerLocale2) {
      contact {
        address
        phoneLabel
        phoneHref
        emailLabel
        emailHref
        websiteLabel
        websiteHref
      }
      social {
        label
        href
        icon
      }
  }
}
`;
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
    metaData {
      title
      description
      keywords {
        description
      }
      canonical
      ogTitle
      ogDescription
      ogUrl
      ogType
      ogSiteName
      ogLocale
      ogImages {
        url
        width
        height
        alt
      }
      twitterCard
      twitterTitle
      twitterDescription
      twitterImage 
      twitterCreator
      category
      schemaData
    }
  }
}`;
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
    metaData {
      title
      description
      keywords {
        description
      }
      canonical
      ogTitle
      ogDescription
      ogUrl
      ogType
      ogSiteName
      ogLocale
      ogImages {
        url
        width
        height
        alt
      }
      twitterCard
      twitterTitle
      twitterDescription
      twitterImage 
      twitterCreator
      category
      schemaData
    }
  }
}`;
  }
}

export class clQueryFactory {
  private static queryMap: {
    [key: string]: new (icontentType: string) => IQuery<any>;
  } = {
      navbar: clQueryNavbar,
      footer: clQueryFooter,
      home: clQueryHome,
      trend: clQueryTrends,
      career: clQueryCareer,
      contact: clQueryContact,
      pricing: clQueryPricing,
      solution: clQuerySolution,
      products: clQueryProducts,
      industries: clQueryIndustries,
      caseStudies: clQueryCaseStudies,
      termsAndCondition: clQueryTermsAndConditions,
      privacyPolicy: clQueryPrivacyPolicy,
      aboutUs: clQueryAboutUs,
      event: clQueryEvent,
      forms: clQueryForms,
      globalMeta: clQueryGlobalMeta,
      // Add more mappings here
    };

  static createQuery<T extends object>(iContentType: string): IQuery<T> {
    const QueryClass = this.queryMap[iContentType];
    if (!QueryClass) throw new Error(`Invalid query type: ${iContentType}`);
    return new QueryClass(iContentType);
  }
}
