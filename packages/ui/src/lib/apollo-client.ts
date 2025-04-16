import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

export const createApolloClient = () => {
    return new ApolloClient({
        ssrMode: true,
        link: new HttpLink({
            uri: 'https://dumps-240005.lmnaslens.com/graphql',
            fetch,
        }),
        cache: new InMemoryCache(),
    });
};
export const client = createApolloClient();