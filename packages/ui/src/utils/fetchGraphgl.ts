// Utility function to fetch data from Strapi CMS using Apollo Client and GraphQL.
// This is a generic function that accepts a query name, optional locale, and optional variables.
// It retrieves the actual GraphQL query from a registry via `getQueryByName`, then performs the query.

import { client } from '@repo/ui/lib/apollo-client';
import { fnGetQueryByName, TQueryName } from '@repo/ui/api/query';

type FetchOptions = {
  iQuery: TQueryName;
  locale?: string;
  iDvariables?: Record<string, any>;
};

export async function fnFetchFromStrapi<T>({ iQuery, locale = 'en', iDvariables = {} }: FetchOptions): Promise<T> {

    // Retrieve the actual GraphQL query by name
    const Query=fnGetQueryByName(iQuery); 

    // Apollo Client that triggers strapi's Graphql 
    const { data } = await client.query({
        query:Query,
        variables: { locale, ...iDvariables },
    });    
    return (data as any)[iQuery] as T;
}