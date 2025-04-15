import { fnGetQueryByName } from '@repo/ui/utils/query';
import type { QueryName } from '@repo/ui/utils/query';
import { client } from '@repo/ui/lib/apollo-client';

type LdFetchOptions = {
    query: QueryName;
    locale: string;
    variables?: Record<string, any>;
};

export async function fnFetchFromStrapi<T>({
    query: iQuery,
    locale: iLocale,
    variables: idVariables = {},
}: LdFetchOptions): Promise<T> {
    const LQuery = fnGetQueryByName(iQuery);

    const { data } = await client.query({
        query: LQuery,
        variables: {
            locale: iLocale,
            ...idVariables,
        },
        fetchPolicy: 'no-cache',
    });

    return (data as any)[iQuery] as T;
}
