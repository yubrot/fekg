import firestore from '@google-cloud/firestore';
import { getFirestore } from './firebase';
import { UserId } from './users';
import type { TemplateId, BaseImageId, Accessibility, Label } from '../shared/template';

export type { TemplateId };

export interface Template {
  name: string;
  creator: UserId;
  baseImage: BaseImageId;
  accessibility: Accessibility;
  labels?: Label[];
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type { BaseImageId, Accessibility, Label };

export function create({
  name,
  creator,
  baseImage,
  accessibility,
}: Omit<Template, 'createdAt' | 'updatedAt'>): Template {
  const now = new Date();
  const template = {
    name,
    creator,
    baseImage,
    accessibility,
    createdAt: now,
    updatedAt: now,
  };
  validate(template);
  return template;
}

export function validate({ name }: Partial<Template>): void {
  if (name !== null && name !== undefined) {
    if (name.length == 0) throw 'Template name must not be empty';
    if (200 < name.length) throw 'Template name is too long';
  }
}

export function repository(): Repository {
  return getFirestore().collection('templates').withConverter(converter);
}

export function batch(): firestore.WriteBatch {
  return getFirestore().batch();
}

const converter: firestore.FirestoreDataConverter<Template> = {
  toFirestore(template: Partial<Template>): firestore.DocumentData {
    const { publishedAt, createdAt, updatedAt, ...document } = template;
    return {
      ...document,
      ...(publishedAt ? { publishedAt: firestore.Timestamp.fromDate(publishedAt) } : {}),
      ...(createdAt ? { createdAt: firestore.Timestamp.fromDate(createdAt) } : {}),
      ...(updatedAt ? { updatedAt: firestore.Timestamp.fromDate(updatedAt) } : {}),
    };
  },

  fromFirestore(snapshot: firestore.QueryDocumentSnapshot): Template {
    const { publishedAt, createdAt, updatedAt, ...document } = snapshot.data();
    return {
      ...document,
      publishedAt: publishedAt?.toDate() || null,
      createdAt: createdAt.toDate(),
      updatedAt: updatedAt.toDate(),
    } as Template;
  },
};

export type Repository = firestore.CollectionReference<Template>;

export type Document = firestore.DocumentReference<Template>;

export type DocumentSnapshot = firestore.DocumentSnapshot<Template>;

export type Query = firestore.Query<Template>;

export type QuerySnapshot = firestore.QuerySnapshot<Template>;

export type QueryDocumentSnapshot = firestore.QueryDocumentSnapshot<Template>;
