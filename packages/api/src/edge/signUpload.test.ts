import { describe, expect, it } from 'vitest';

import { signUploadResultSchema } from './signUpload';

describe('signUploadResultSchema', () => {
  it('accepts a well-formed Edge response', () => {
    const value = {
      bucket: 'images',
      path: 'u1/original/x.jpg',
      token: 'tok',
      signedUrl: 'https://x',
    };
    expect(signUploadResultSchema.parse(value)).toEqual(value);
  });

  it('rejects a response missing fields', () => {
    expect(() => signUploadResultSchema.parse({ bucket: 'images', path: 'p' })).toThrow();
  });
});
