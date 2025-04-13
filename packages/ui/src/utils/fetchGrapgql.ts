import { getQueryByName } from '@repo/ui/api/query';
import type { QueryName } from '@repo/ui/api/query';
import { client } from '@repo/ui/lib/apollo-client';

type FetchOptions = {
  query: QueryName;
  locale?: string;
  variables?: Record<string, any>;
};

export async function fetchFromStrapi<T>({ query, locale = 'en', variables = {} }: FetchOptions): Promise<T> {
  const Query = getQueryByName(query);
  const { data } = await client.query({
    query: Query,
    variables: { locale, ...variables },
  });
  return (data as any)[query] as T;
}
