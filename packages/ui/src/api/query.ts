import { gql } from '@apollo/client';
import { DocumentNode } from 'graphql';

// Navbar query
export const NAVBAR_QUERY = gql`
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
export const FOOTER_QUERY = gql`
  query Footer($locale: I18NLocaleCode) {
    footer(locale: $locale) {
      locale
      links {
        label
        href
      }
      socialMedia {
        platform
        url
      }
    }
  }
`;

// Query map with aliases
const queries = {
  navbar: NAVBAR_QUERY,
  footer: FOOTER_QUERY,
};

// Type-safe query name
export type QueryName = keyof typeof queries;

// Type-safe function to get query
export function getQueryByName(queryName: QueryName): DocumentNode {
  return queries[queryName];
}

