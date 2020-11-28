export type UserId = string;

export const allowTemplatePublishingTime = 7 * 24 * 60 * 60 * 1000;

export function getTemplatePublishingBlockingExpirationDate(user: { creationDate: Date }): Date {
  return new Date(user.creationDate.getTime() + allowTemplatePublishingTime);
}

export function isTemplatePublishingBlockedByCreationDate(user: { creationDate: Date }): boolean {
  return Date.now() < user.creationDate.getTime() + allowTemplatePublishingTime;
}
