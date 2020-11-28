import { useCallback } from 'react';
import useSWR, { responseInterface } from 'swr';
import { ClientError, GraphQLClient } from 'graphql-request';
import { Sdk, getSdk } from './graphql-sdk';

export interface RequestOptions {
  authorization?(): Promise<string | null>;
}

async function request<T>(handler: (sdk: Sdk) => Promise<T>, options?: RequestOptions): Promise<T> {
  const client = new GraphQLClient('/api/graphql');
  if (options?.authorization) {
    const authorization = await options.authorization();
    if (authorization) client.setHeader('Authorization', authorization);
  }
  const sdk = getSdk(client);
  try {
    return await handler(sdk);
  } catch (e) {
    if (e instanceof ClientError && e.response.errors) throw e.response.errors[0].message;
    throw e;
  }
}

export type Query<T> = responseInterface<T, Error>;

export function useQuery<Path extends readonly unknown[], T>(
  path: [...Path] | (() => [...Path] | null),
  handler: (sdk: Sdk, ...args: Path) => Promise<T>,
  options?: RequestOptions
): Query<T> {
  return useSWR(path, (...args) => request(sdk => handler(sdk, ...args), options));
}

export type Mutation<I extends readonly unknown[], O> = (...args: I) => Promise<O>;

export function useMutation<I extends readonly unknown[], O>(
  f: (sdk: Sdk, ...args: I) => Promise<O>,
  options?: RequestOptions
): Mutation<I, O> {
  return useCallback((...args) => request(sdk => f(sdk, ...args), options), [f, options]);
}
