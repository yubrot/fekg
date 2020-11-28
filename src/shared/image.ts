const typesAndExtensions = new Map<string, string>();
typesAndExtensions.set('image/jpeg', '.jpg');
typesAndExtensions.set('image/png', '.png');
typesAndExtensions.set('image/gif', '.gif');
typesAndExtensions.set('image/webp', '.webp');

export function getSupportedMimeTypeExtension(mimetype: string): string | undefined {
  return typesAndExtensions.get(mimetype);
}

export const supportedMimeTypes = Array.from(typesAndExtensions.keys()).join(',');

export const supportedFileSize = 4 * 1000 * 1000;
