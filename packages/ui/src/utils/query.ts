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

// Query map with aliases
const LdQueryMap = {
  navbar: LNavbarQuery,
  footer: LFooterQuery,
};

// Type-safe query name
export type QueryName = keyof typeof LdQueryMap;

// Type-safe function to get query
export function fnGetQueryByName(iQueryName: QueryName): DocumentNode {
  return LdQueryMap[iQueryName];
}