import { beforeEach, describe, expect, it } from 'vitest';

import { useImportQueue, usePendingUploads, type PendingUpload } from './captureQueue';

const upload = (id: string): PendingUpload => ({
  id,
  garmentId: `g-${id}`,
  uri: 'file://x',
  type: 'original',
  mime: 'image/jpeg',
  width: 100,
  height: 100,
});

beforeEach(() => {
  useImportQueue.getState().clear();
  usePendingUploads.setState({ items: [] });
});

describe('useImportQueue', () => {
  it('enqueues and dequeues in FIFO order', () => {
    useImportQueue.getState().enqueue([
      { imageId: 'a', uri: 'ua' },
      { imageId: 'b', uri: 'ub' },
    ]);
    expect(useImportQueue.getState().items[0]?.imageId).toBe('a');
    useImportQueue.getState().dequeue();
    expect(useImportQueue.getState().items.map((i) => i.imageId)).toEqual(['b']);
  });
});

describe('usePendingUploads', () => {
  it('enqueues and removes by id', () => {
    usePendingUploads.getState().enqueue(upload('1'));
    usePendingUploads.getState().enqueue(upload('2'));
    usePendingUploads.getState().remove('1');
    expect(usePendingUploads.getState().items.map((i) => i.id)).toEqual(['2']);
  });
});
