import {
  UserId,
  getTemplatePublishingBlockingExpirationDate,
  isTemplatePublishingBlockedByCreationDate,
} from '../shared/user';

export type { UserId };

export interface User {
  id: UserId;
  displayName: string | null;
  photoURL: string | null;
  creationDate: Date;
}

export { getTemplatePublishingBlockingExpirationDate, isTemplatePublishingBlockedByCreationDate };
