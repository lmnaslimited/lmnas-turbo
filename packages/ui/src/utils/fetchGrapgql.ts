import { DocumentNode } from 'graphql';
import { createApolloClient } from '@repo/ui/lib/apollo-client';

type FetchOptions = {
    query: DocumentNode;
    locale?: string;
    variables?: Record<string, any>;
};

export async function fetchFromStrapi<T>({ query, locale = 'en', variables = {} }: FetchOptions): Promise<T> {
    const client = createApolloClient();    const { data } = await client.query({
        query,
        variables: { locale, ...variables },
    });    
    // :point_down: Only return `navbar` from the data
    return (data as any).navbar as T;
}