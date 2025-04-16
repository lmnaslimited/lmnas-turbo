import { gql } from '@apollo/client';
import { DocumentNode } from 'graphql';

// Queries to fetch data from Strapi
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


// Query map with aliases
const LdQueryMap = {
  termsAndCondition: LTermsAndConditionsQuery,
  privacyPolicy: LPrivacyPolicyQuery
};


// Type-safe query name
export type TQueryName = keyof typeof LdQueryMap;

// Type-safe function to get query
export function fnGetQueryByName(iQueryName: TQueryName): DocumentNode {
  return LdQueryMap[iQueryName];
}