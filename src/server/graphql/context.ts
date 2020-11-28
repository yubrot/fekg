import type { IncomingMessage } from 'http';
import { AuthenticationError } from 'apollo-server-micro';
import * as users from '../users';

export interface Context {
  requestedUser(): Promise<users.UserId>;
}

export default async function context({ req }: { req: IncomingMessage }): Promise<Context> {
  const userId = await users.authorizeUserAccount(req);
  return {
    async requestedUser() {
      if (!userId) throw new AuthenticationError('Unauthorized');
      return userId;
    },
  };
}
