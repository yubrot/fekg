import type { IncomingMessage } from 'http';
import { getAuth } from './firebase';
import {
  UserId,
  isTemplatePublishingBlockedByCreationDate,
  getTemplatePublishingBlockingExpirationDate,
} from '../shared/user';

export type { UserId };

export interface User {
  displayName: string | null;
  photoURL: string | null;
  creationDate: Date;
}

export async function getUser(id: UserId): Promise<User | null> {
  try {
    const user = await getAuth().getUser(id);
    return {
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      creationDate: new Date(user.metadata.creationTime),
    };
  } catch (e) {
    return null;
  }
}

export async function deleteUser(id: UserId): Promise<boolean> {
  try {
    await getAuth().deleteUser(id);
    return true;
  } catch (e) {
    return false;
  }
}

export { isTemplatePublishingBlockedByCreationDate, getTemplatePublishingBlockingExpirationDate };

export async function authorizeUserAccount(req: IncomingMessage): Promise<UserId | null> {
  const authorization = req.headers.authorization;
  if (!authorization) return null;

  const match = authorization.match(/^Bearer (.+)$/);
  if (!match) throw 'Unsupported authorization';

  const idToken = match[1];

  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    return decodedToken.uid;
  } catch (e) {
    console.log(`Authorization failed: ${e}`);
    throw 'Authorization failed';
  }
}
