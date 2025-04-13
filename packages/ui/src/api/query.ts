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
    companyName
    companyInfo
    social {
      label
      href
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
    menu {
      itemOne
      itemTwo
      itemThree
      itemFour
    }
  }
}
`;


export const TREND_QUERY = gql`
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
}
`;

// Query map with aliases
const queries = {
  navbar: NAVBAR_QUERY,
  footer: FOOTER_QUERY,
  trend: TREND_QUERY
};

// Type-safe query name
export type QueryName = keyof typeof queries;

// Type-safe function to get query
export function getQueryByName(queryName: QueryName): DocumentNode {
  return queries[queryName];
}


