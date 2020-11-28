import { ApolloServer } from 'apollo-server-micro';
import typeDefs from '../../shared/graphql/schema.graphql';
import resolvers from '../../server/graphql/resolvers';
import context from '../../server/graphql/context';

const apolloServer = new ApolloServer({ typeDefs, resolvers, context });

export const config = { api: { bodyParser: false } };

export default apolloServer.createHandler({ path: '/api/graphql' });
