import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client"

// Apollo Client setup for interacting with the GraphQL API endpoint.
// This function initializes and returns an Apollo Client instance configured for SSR (Server-Side Rendering).

const API_URL = `${process.env.STRAPI_BASE_URL}/graphql`
export const createApolloClient = () => {
  return new ApolloClient({
    ssrMode: true,
    link: new HttpLink({
      uri: API_URL,
      fetch,
    }),
    cache: new InMemoryCache(),
  })
}
export const client = createApolloClient()
