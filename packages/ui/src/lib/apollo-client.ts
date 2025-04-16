import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

export const createApolloClient = () => {
    return new ApolloClient({
        ssrMode: true,
        link: new HttpLink({
            uri: 'http://localhost:1337/graphql',
            fetch,
        }),
        cache: new InMemoryCache(),
    });
};
export const client = createApolloClient();