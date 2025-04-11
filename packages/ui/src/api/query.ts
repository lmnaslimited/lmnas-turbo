import { gql } from '@apollo/client';
import { DocumentNode } from 'graphql';

// Navbar query
export const NAVBAR_QUERY = gql`
  query Navbar($locale: I18NLocaleCode) {
    navbar(locale: $locale) {
      locale
      Product {
        label
        description
        href
        icon
      }
      Industry {
        label
        description
        href
        icon
      }
      More {
        label
        href
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

const queries: { [key: string]: DocumentNode } = {
    NAVBAR_QUERY,
    navbar: NAVBAR_QUERY,
    FOOTER_QUERY,
    footer: FOOTER_QUERY,
  };
  
  export function getQueryByName(queryName: string): DocumentNode | null {
    return queries[queryName] || null;
  }
