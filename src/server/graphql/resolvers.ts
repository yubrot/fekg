import { ForbiddenError, UserInputError } from 'apollo-server-micro';
import { Context } from './context';
import * as gql from './types';
import * as users from '../users';
import * as templates from '../templates';
import * as images from '../images';

const fetchLimit = 100;

export const Query: gql.QueryResolvers<Context> = {
  async template(parent, { id }) {
    const result = await templates.repository().doc(id).get();
    const ret = toGQLTemplate(result);
    if (!ret) throw new UserInputError('Template not found');
    return ret;
  },

  async my(parent, { first, after }, context) {
    const userId = await context.requestedUser();

    if (fetchLimit < first) throw new UserInputError('Too much fetch');

    const repository = templates.repository();
    const q1 = repository.where('creator', '==', userId).orderBy('createdAt', 'desc');
    const q2 = after ? q1.startAfter(await repository.doc(after).get()) : q1;
    const result = await q2.limit(first).get();
    return result.docs.map(doc => toGQLTemplate(doc));
  },

  async published(parent, { first, after }) {
    if (fetchLimit < first) throw new UserInputError('Too much fetch');

    const repository = templates.repository();
    const q1 = repository.where('accessibility', '==', 'PUBLIC').orderBy('publishedAt', 'desc');
    const q2 = after ? q1.startAfter(await repository.doc(after).get()) : q1;
    const result = await q2.limit(first).get();
    return result.docs.map(doc => toGQLTemplate(doc));
  },
};

// FIXME: An unsuccessful deletion may leave an image

export const Mutation: gql.MutationResolvers<Context> = {
  async deleteUser(parent, { id }, context) {
    const userId = await context.requestedUser();

    if (id != userId) throw new ForbiddenError('Other users cannot be removed');

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const snapshot = await templates
        .repository()
        .where('creator', '==', userId)
        .limit(fetchLimit)
        .get();
      if (snapshot.size == 0) break;

      const batch = templates.batch();
      for (const doc of snapshot.docs) batch.delete(doc.ref);
      await batch.commit();

      for (const doc of snapshot.docs) await images.invalidate(doc.data().baseImage);
    }

    return await users.deleteUser(userId);
  },

  async createTemplate(parent, { name, image }, context) {
    const userId = await context.requestedUser();

    const doc = templates.repository().doc();

    const baseImage = await images.update('base-images', doc.id, await image);

    try {
      await doc.set(
        templates.create({
          name,
          creator: userId,
          baseImage: baseImage.id,
          accessibility: 'PRIVATE',
        })
      );
    } catch (e) {
      await images.invalidate(baseImage.id);
      throw e;
    }

    return doc.id;
  },

  async deleteTemplate(parent, { id }, context) {
    const userId = await context.requestedUser();

    const doc = templates.repository().doc(id);
    const data = (await doc.get()).data();

    if (!data) throw new UserInputError('Template not found');
    if (data.creator != userId) throw new UserInputError('Template is not owned by user');

    await doc.delete();

    try {
      await images.invalidate(data.baseImage);
    } catch {}

    return true;
  },

  async updateTemplate(parent, { id, input }, context) {
    const userId = await context.requestedUser();

    const doc = templates.repository().doc(id);
    const data = (await doc.get()).data();

    if (!data) throw new UserInputError('Template not found');
    if (data.creator != userId) throw new UserInputError('Template is not owned by user');

    const { name, image, accessibility, labels } = input;

    if (accessibility == 'PUBLIC') {
      const user = await users.getUser(userId);
      if (!user || users.isTemplatePublishingBlockedByCreationDate(user)) {
        throw new ForbiddenError('New users cannot publish the template');
      }
    }

    const newImage = image ? await images.update('base-images', doc.id, await image) : null;
    const publishedAt = accessibility == 'PUBLIC' && !data.publishedAt ? new Date() : null;

    await doc.set(
      {
        ...(name ? { name } : {}),
        ...(newImage ? { baseImage: newImage.id } : {}),
        ...(accessibility ? { accessibility } : {}),
        ...(labels ? { labels } : {}),
        ...(publishedAt ? { publishedAt } : {}),
      },
      { merge: true }
    );

    if (newImage && data.baseImage != newImage?.id) {
      try {
        await images.invalidate(data.baseImage);
      } catch {}
    }

    return true;
  },
};

export const Template: gql.TemplateResolvers<Context> = {};

function toGQLTemplate(item: templates.QueryDocumentSnapshot): gql.Template;
function toGQLTemplate(item: templates.DocumentSnapshot): gql.Template | null;

function toGQLTemplate(item: templates.DocumentSnapshot): gql.Template | null {
  const id = item.id;
  const data = item.data();
  if (!data) return null;
  const { name, creator, baseImage, accessibility, labels } = data;
  return { id, name, creator, baseImage, accessibility, labels };
}

export default { Query, Mutation, Template };
