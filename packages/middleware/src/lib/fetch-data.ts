// Utility function to fetch data from Strapi CMS using Apollo Client and GraphQL.
// This is a generic function that accepts a query name, optional locale, and optional variables.
// It retrieves the actual GraphQL query from a registry via `getQueryByName`, then performs the query.

import { client, createApolloClient } from "./apollo-client"
import { DocumentNode } from "graphql"

type FetchOptions = {
  iQuery: DocumentNode
  locale?: string
  iDvariables?: Record<string, any>
}

export async function fnFetchFromStrapi<T>({
  iQuery,
  locale = "en",
  iDvariables = {},
}: FetchOptions): Promise<T> {
  // new client for every request to avoid authorization cache
  const LdApolloClient = createApolloClient() 
  // Apollo Client that triggers strapi's Graphql
  const { data } = await LdApolloClient.query({
    query: iQuery,
    variables: { locale, ...iDvariables },
  })
  return data as T
}
