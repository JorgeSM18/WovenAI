import { describe, expect, it, vi, beforeEach } from 'vitest';

import type { WovenClient } from '@woven/api';

import { uploadImage, type UploadImageInput } from './uploadImage';

vi.mock('@woven/api', () => ({ signUpload: vi.fn() }));
import { signUpload } from '@woven/api';

const signUploadMock = vi.mocked(signUpload);

function makeClient() {
  const single = vi.fn().mockResolvedValue({ data: { id: 'asset-1' }, error: null });
  const select = vi.fn(() => ({ single }));
  const insert = vi.fn(() => ({ select }));
  const from = vi.fn(() => ({ insert }));
  const uploadToSignedUrl = vi.fn().mockResolvedValue({ error: null });
  const upload = vi.fn().mockResolvedValue({ error: null });
  const storageFrom = vi.fn(() => ({ uploadToSignedUrl, upload }));
  const client = { from, storage: { from: storageFrom } } as unknown as WovenClient;
  return { client, insert, uploadToSignedUrl, upload };
}

const input: UploadImageInput = {
  userId: 'u1',
  bytes: new Uint8Array([1, 2, 3]).buffer,
  type: 'original',
  mime: 'image/jpeg',
  width: 10,
  height: 20,
};

beforeEach(() => {
  signUploadMock.mockReset();
  signUploadMock.mockResolvedValue({
    bucket: 'images',
    path: 'u1/original/x.jpg',
    token: 'tok',
    signedUrl: 'https://example/x',
  });
});

describe('uploadImage', () => {
  it('uses the signed URL, then records the asset', async () => {
    const { client, uploadToSignedUrl, upload, insert } = makeClient();

    const result = await uploadImage(client, input);

    expect(uploadToSignedUrl).toHaveBeenCalledWith('u1/original/x.jpg', 'tok', input.bytes, {
      contentType: 'image/jpeg',
    });
    expect(upload).not.toHaveBeenCalled();
    expect(insert).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ id: 'asset-1', storagePath: 'images/u1/original/x.jpg' });
  });

  it('falls back to a direct authenticated upload when the signed upload fails', async () => {
    const { client, upload, uploadToSignedUrl } = makeClient();
    // Signed upload returns an error → the fallback direct upload runs.
    uploadToSignedUrl.mockResolvedValue({ error: new Error('signed rejected') });

    const result = await uploadImage(client, input);

    expect(upload).toHaveBeenCalledTimes(1);
    // Path stays scoped to the user's folder so the storage RLS policy admits it.
    expect(upload.mock.calls[0]?.[0]).toBe('u1/original/x.jpg');
    expect(result.id).toBe('asset-1');
  });

  it('propagates a hard failure when both signed and direct uploads fail', async () => {
    const { client, uploadToSignedUrl, upload } = makeClient();
    uploadToSignedUrl.mockResolvedValue({ error: new Error('signed rejected') });
    upload.mockResolvedValue({ error: new Error('storage denied') });

    await expect(uploadImage(client, input)).rejects.toThrow('storage denied');
  });
});
