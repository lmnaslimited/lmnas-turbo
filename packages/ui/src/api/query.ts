import { gql } from '@apollo/client';
import { DocumentNode } from 'graphql';


const SharedTermsQuery = `{
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
  }`

// Queries to fetch data from Strapi   

// Privacy Policy query
  export const LTermsAndConditionsQuery: DocumentNode = gql`
  query Query($locale: I18NLocaleCode) {
    termsAndCondition(locale: $locale) ${SharedTermsQuery}
  }`;

// Terms and Conditions query
export const LPrivacyPolicyQuery: DocumentNode = gql`
query Query($locale: I18NLocaleCode) {
  privacyPolicy(locale: $locale) ${SharedTermsQuery}
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