import { getQueryByName } from '@repo/ui/api/query';
import type { QueryName } from '@repo/ui/api/query';
import { createApolloClient } from '@repo/ui/lib/apollo-client';

type FetchOptions = {
    query: QueryName;
    locale?: string;
    variables?: Record<string, any>;
};

export async function fetchFromStrapi<T>({ query, locale = 'en', variables = {} }: FetchOptions): Promise<T> {
    console.log("API Triggered")

    const Query = getQueryByName(query);
    const client = createApolloClient();
    const { data } = await client.query({
        query: Query,
        variables: { locale, ...variables },
    });
    return (data as any).navbar as T;
}