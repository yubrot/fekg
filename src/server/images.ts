import { Readable } from 'stream';
import { getStorage } from './firebase';
import { pipeline, SizeLimitter } from './stream';
import { getSupportedMimeTypeExtension, supportedFileSize } from '../shared/image';

export type Location = 'base-images';

export type ImageId = string;

export interface Image {
  id: ImageId;
}

export async function update(location: Location, name: string, file: File): Promise<Image> {
  const extension = getSupportedMimeTypeExtension(file.mimetype);
  if (!extension) throw `Unsupported filetype: ${file.mimetype}`;

  const id = `${location}/${name}${extension}`;
  const storageFile = getStorage().bucket().file(id);

  const src = file.createReadStream();
  const dest = storageFile.createWriteStream({ contentType: file.mimetype });
  const sizeLimitter = new SizeLimitter(supportedFileSize, src, dest);
  await pipeline(src, sizeLimitter, dest);

  return { id };
}

export async function invalidate(imageId: ImageId): Promise<void> {
  await getStorage().bucket().file(imageId).delete({ ignoreNotFound: true });
}

// NOTE: This type and graphql-upload/FileUpload are sturcturally compatible.
export interface File {
  mimetype: string;
  createReadStream(): Readable;
}
