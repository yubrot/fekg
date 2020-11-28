import { useMemo } from 'react';
import { useAccount } from './account';
import { RequestOptions } from './infrastructure/graphql-api';

export function useRequestOptions(): RequestOptions {
  const { getUserToken: getAccountUserToken } = useAccount();
  return useMemo<RequestOptions>(
    () => ({
      async authorization() {
        const token = await getAccountUserToken();
        return token ? `Bearer ${token}` : null;
      },
    }),
    [getAccountUserToken]
  );
}
