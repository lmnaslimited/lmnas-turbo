import { gql } from '@apollo/client';
import { DocumentNode } from 'graphql';

// Utility function to generate a GraphQL query for a specific type.  


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
      }
    }
  }
}`;

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
// Query map with aliases
const LdQueryMap = {
  termsAndCondition: fnGetQueryByType('termsAndCondition'),
  privacyPolicy: fnGetQueryByType('privacyPolicy'),
  trend: LTrendQuery,
};


// Type-safe query name
export type TQueryName = keyof typeof LdQueryMap;

// Type-safe function to get query
export function fnGetQueryByName(iQueryName: TQueryName): DocumentNode {
  return LdQueryMap[iQueryName];
}