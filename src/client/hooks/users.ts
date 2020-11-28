import { Mutation, useMutation } from './infrastructure/graphql-api';
import { useRequestOptions } from './request-options';
import type { UserId } from '../user';

export function useDeleteUser(): Mutation<[id: UserId], boolean> {
  return useMutation(
    async (sdk, id) => (await sdk.deleteUser({ id })).succeed,
    useRequestOptions()
  );
}
