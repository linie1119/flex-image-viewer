import ExifReader from 'exifreader';

export async function getImageOrientation(
  source: string | Blob | ArrayBuffer
): Promise<number | undefined> {
  try {
    let input: string | ArrayBuffer;
    if (typeof source === 'string') {
      input = source;
    } else if (source instanceof Blob) {
      input = await source.arrayBuffer();
    } else {
      input = source;
    }

    const tags =
      typeof input === 'string' ? await ExifReader.load(input) : await ExifReader.load(input);
    const orientation = tags?.Orientation?.value;
    if (typeof orientation === 'number') {
      return orientation;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

export function shouldSwapDimensions(orientation?: number): boolean {
  return orientation === 6 || orientation === 8;
}
