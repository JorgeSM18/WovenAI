import { beforeEach, describe, expect, it } from 'vitest';

import { useStudioDraft } from './studioDraft';

const draft = () => useStudioDraft.getState();
const g = (id: string) => ({ garmentId: id, thumbnailUrl: null });

beforeEach(() => draft().reset());

describe('useStudioDraft', () => {
  it('adds items and ignores duplicates', () => {
    draft().addItem(g('a'));
    draft().addItem(g('a'));
    draft().addItem(g('b'));
    expect(draft().items.map((i) => i.garmentId)).toEqual(['a', 'b']);
  });

  it('moves, scales and removes items', () => {
    draft().addItem(g('a'));
    draft().moveItem('a', 100, 50);
    draft().scaleItem('a', 2);
    expect(draft().items[0]).toMatchObject({ posX: 100, posY: 50, scale: 2 });
    draft().removeItem('a');
    expect(draft().items).toHaveLength(0);
  });

  it('bringToFront raises the z-index above the others', () => {
    draft().addItem(g('a'));
    draft().addItem(g('b'));
    draft().bringToFront('a');
    const a = draft().items.find((i) => i.garmentId === 'a');
    const b = draft().items.find((i) => i.garmentId === 'b');
    expect(a && b && a.zIndex > b.zIndex).toBe(true);
  });

  it('undo/redo step through the history', () => {
    draft().addItem(g('a'));
    draft().moveItem('a', 100, 100);
    expect(draft().items[0]?.posX).toBe(100);

    draft().undo();
    expect(draft().items[0]?.posX).toBe(0);

    draft().redo();
    expect(draft().items[0]?.posX).toBe(100);
  });

  it('undo past the start and redo past the end are no-ops', () => {
    draft().undo();
    expect(draft().items).toHaveLength(0);
    draft().addItem(g('a'));
    draft().redo();
    expect(draft().items).toHaveLength(1);
  });
});
