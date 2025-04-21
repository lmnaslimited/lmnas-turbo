import { gql } from '@apollo/client';
import { DocumentNode } from 'graphql';

// Utility function to generate a GraphQL query for a specific type.  

function fnGetQueryByType(typeName: string) {
  return gql`query Query($locale: I18NLocaleCode) {
    ${typeName}(locale: $locale) {
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

export const LTrendQuery: DocumentNode = gql`
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
    trendHeader {
      title
      subtitle
      highlight
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
      ... on ComponentSharedCallout {
        header {
          highlight
        }
        buttons {
          label
          icon
          formMode
          variant
        }
      }
      ... on ComponentCoreHeader {
        highlight
        title
        subtitle
      }
    }
    calloutSection {
      header {
        highlight
      }
      title
      buttons {
        label
        href
        icon
        variant
        formMode
      }
    }
  }
}`;

export const LContactQuery: DocumentNode = gql`
query Contact($locale: I18NLocaleCode) {
  contact(locale: $locale) {
    header {
      highlight
      title
      subtitle
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
      buttons {
        label
        href
        variant
      }
    }
    problemSection {
      ... on ComponentCoreHeader {
        highlight
        subtitle
      }
      ... on ComponentCoreHighlight {
        label
        description
      }
      ... on ComponentSharedCallout {
        header {
          title
        }
        buttons {
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
  termsAndCondition: fnGetQueryByType('termsAndCondition'),
  privacyPolicy: fnGetQueryByType('privacyPolicy'),
  trend: LTrendQuery,
  contact: LContactQuery,
  pricing: LPricingQuery,
};


// Type-safe query name
export type TQueryName = keyof typeof LdQueryMap;

// Type-safe function to get query
export function fnGetQueryByName(iQueryName: TQueryName): DocumentNode {
  return LdQueryMap[iQueryName];
}