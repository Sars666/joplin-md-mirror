import os from 'os';
import path from 'path';
import { mkdtemp } from 'fs/promises';
import { appendDeletions, loadDeletions, loadManifest, saveManifest } from '../src/export/stateStore';
import type { DeleteEntry, ManifestEntry } from '../src/types';

describe('stateStore', () => {
  it('returns empty state files when they do not exist yet', async () => {
    const baseDir = await mkdtemp(path.join(os.tmpdir(), 'joplin-md-mirror-'));

    await expect(loadManifest(baseDir)).resolves.toEqual({});
    await expect(loadDeletions(baseDir)).resolves.toEqual([]);
  });

  it('saves and reloads manifest entries', async () => {
    const baseDir = await mkdtemp(path.join(os.tmpdir(), 'joplin-md-mirror-'));
    const manifest: Record<string, ManifestEntry> = {
      'note-123': {
        noteId: 'note-123',
        filePath: path.join(baseDir, 'notes', 'note-123.md'),
        updatedAt: '2026-04-03T05:58:09.000Z',
        contentHash: 'body-hash',
        metadataHash: 'meta-hash',
        syncedAt: '2026-04-11T00:00:00.000Z',
        title: '教程：构建高效AI',
      },
    };

    await saveManifest(baseDir, manifest);

    await expect(loadManifest(baseDir)).resolves.toEqual(manifest);
  });

  it('appends deletion records without overwriting old ones', async () => {
    const baseDir = await mkdtemp(path.join(os.tmpdir(), 'joplin-md-mirror-'));
    const deletions: DeleteEntry[] = [
      { noteId: 'gone-1', deletedAt: '2026-04-11T00:00:00.000Z', lastKnownTitle: 'Old note' },
    ];

    await appendDeletions(baseDir, deletions);
    await appendDeletions(baseDir, [
      { noteId: 'gone-2', deletedAt: '2026-04-11T01:00:00.000Z', lastKnownTitle: 'Another old note' },
    ]);

    await expect(loadDeletions(baseDir)).resolves.toEqual([
      { noteId: 'gone-1', deletedAt: '2026-04-11T00:00:00.000Z', lastKnownTitle: 'Old note' },
      { noteId: 'gone-2', deletedAt: '2026-04-11T01:00:00.000Z', lastKnownTitle: 'Another old note' },
    ]);
  });
});
