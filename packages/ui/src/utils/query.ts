import { gql } from '@apollo/client';
import { DocumentNode } from 'graphql';

// Navbar query
export const LNavbarQuery: DocumentNode = gql`
 query Navbar($locale: I18NLocaleCode) {
  navbar(locale: $locale) {
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
}
`;

// Footer query
export const LFooterQuery: DocumentNode = gql`
  query Footer($locale: I18NLocaleCode) {
    footer(locale: $locale) {
      companyName
      companyInfo
      social {
        label
        href
        icon
      }
      menu {
        label
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
  }
`;

export const LPrivacyPolicyQuery: DocumentNode = gql`
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
}`;

export const LTermsAndConditionsQuery: DocumentNode = gql`
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
}`;

export const LConatctQuery: DocumentNode = gql`
query Contact($locale: I18NLocaleCode) {
  contact(locale: $locale) {
    header {
      highlight
      title
      subtitle
    }
  }
}`;

export const LTrendQuery: DocumentNode = gql`
query Trend($locale: I18NLocaleCode) {
  trend(locale: $locale) {
    heroSection {
      heading {
        highlight
        title
        subtitle
      }
      description
      button {
        label
        href
        formMode
      }
    }
    trendHeader {
      highlight
      title
      subtitle
    }
    trendFooter {
      title
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
    frustrationSection {
      ... on ComponentCoreHeader {
        highlight
      }
      ... on ComponentSharedCallout {
        header {
          highlight
        }
        title
        subtitle
        button {
          label
          formMode
        }
      }
    }
    calloutSection {
      header {
        highlight
      }
      subtitle
      button {
        label
        href
      }
    }
  }
}`;

export const LPricingQuery: DocumentNode = gql`
query Pricing($locale: I18NLocaleCode) {
  pricing(locale: $locale) {
    heroSection {
      heading {
        highlight
        subtitle
      }
      description
      button {
        label
        href
      }
    }
    problemSection {
      ... on ComponentCoreHeader {
        highlight
      }
      ... on ComponentCoreHighlight {
        label
        description
      }
      ... on ComponentSharedCallout {
        header {
          title
        }
        button {
          label
          href
          formMode
        }
      }
    }
}
}`;

// Query map with aliases
const LdQueryMap = {
  navbar: LNavbarQuery,
  footer: LFooterQuery,
  contact: LConatctQuery,
  privacyPolicy: LPrivacyPolicyQuery,
  termsAndCondition: LTermsAndConditionsQuery,
  trend: LTrendQuery,
  pricing: LPricingQuery
};

// Type-safe query name
export type QueryName = keyof typeof LdQueryMap;

// Type-safe function to get query
export function fnGetQueryByName(iQueryName: QueryName): DocumentNode {
  return LdQueryMap[iQueryName];
}