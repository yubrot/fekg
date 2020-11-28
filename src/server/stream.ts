import util from 'util';
import stream from 'stream';

// FIXME: In node v15, stream/promises are available.
export const pipeline = util.promisify(stream.pipeline);

export class SizeLimitter extends stream.Transform {
  private length = 0;

  constructor(readonly limit: number, src: stream.Readable, dest: stream.Writable) {
    super();

    this.on('error', e => {
      src.destroy(e);
      dest.destroy(e);
    });
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  _transform(chunk: any, encoding: BufferEncoding, callback: stream.TransformCallback): void {
    this.length += chunk.length;

    if (this.length > this.limit) {
      this.destroy(new Error('Size limit exceeded'));
      return;
    }

    this.push(chunk);
    callback();
  }
}
