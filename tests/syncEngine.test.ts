import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { mkdtemp } from 'fs/promises';
import { fullSync, incrementalSync } from '../src/export/syncEngine';
import { loadDeletions, loadManifest } from '../src/export/stateStore';

describe('syncEngine', () => {
  it('writes mirrored markdown files and manifest entries', async () => {
    const baseDir = await mkdtemp(path.join(os.tmpdir(), 'joplin-md-mirror-'));
    const repository = {
      listExportNotes: jest.fn(async () => [
        {
          id: 'note-123',
          title: '教程：构建高效AI',
          body: '这里是正文。',
          notebook: 'OpenClaw',
          tags: ['AI'],
          createdAt: '2026-03-25T14:36:39.000Z',
          updatedAt: '2026-04-03T05:58:09.000Z',
          isTodo: false,
          todoCompleted: false,
        },
      ]),
    };

    const summary = await fullSync(repository, baseDir);
    const markdown = await fs.readFile(path.join(baseDir, 'notes', 'note-123.md'), 'utf8');
    const manifest = await loadManifest(baseDir);

    expect(summary).toEqual({ created: 1, updated: 0, deleted: 0, skipped: 0, errors: [] });
    expect(markdown).toContain('note_id: "note-123"');
    expect(markdown).toContain('# 教程：构建高效AI');
    expect(manifest['note-123'].noteId).toBe('note-123');
    expect(manifest['note-123'].title).toBe('教程：构建高效AI');
  });

  it('removes stale note files during full sync', async () => {
    const baseDir = await mkdtemp(path.join(os.tmpdir(), 'joplin-md-mirror-'));

    await fullSync({
      listExportNotes: jest.fn(async () => [
        {
          id: 'note-123',
          title: '旧笔记',
          body: '旧正文',
          notebook: 'OpenClaw',
          tags: [],
          createdAt: '2026-03-25T14:36:39.000Z',
          updatedAt: '2026-04-03T05:58:09.000Z',
          isTodo: false,
          todoCompleted: false,
        },
      ]),
    }, baseDir);

    const summary = await fullSync({
      listExportNotes: jest.fn(async () => []),
    }, baseDir);

    await expect(fs.access(path.join(baseDir, 'notes', 'note-123.md'))).rejects.toThrow();
    expect(summary.deleted).toBe(1);
  });

  it('updates changed notes, creates new notes, and records deletions', async () => {
    const baseDir = await mkdtemp(path.join(os.tmpdir(), 'joplin-md-mirror-'));

    const initialRepository = {
      listExportNotes: jest.fn(async () => [
        {
          id: 'note-123',
          title: '旧标题',
          body: '旧正文',
          notebook: 'OpenClaw',
          tags: ['AI'],
          createdAt: '2026-03-25T14:36:39.000Z',
          updatedAt: '2026-04-03T05:58:09.000Z',
          isTodo: false,
          todoCompleted: false,
        },
        {
          id: 'note-456',
          title: '将被删除的笔记',
          body: '删除前正文',
          notebook: 'OpenClaw',
          tags: [],
          createdAt: '2026-03-25T14:36:39.000Z',
          updatedAt: '2026-04-03T05:58:09.000Z',
          isTodo: false,
          todoCompleted: false,
        },
      ]),
    };

    await fullSync(initialRepository, baseDir);

    const nextRepository = {
      listExportNotes: jest.fn(async () => [
        {
          id: 'note-123',
          title: '新标题',
          body: '新正文',
          notebook: 'OpenClaw',
          tags: ['AI'],
          createdAt: '2026-03-25T14:36:39.000Z',
          updatedAt: '2026-04-11T00:00:00.000Z',
          isTodo: false,
          todoCompleted: false,
        },
        {
          id: 'note-789',
          title: '新增笔记',
          body: '新增正文',
          notebook: 'OpenClaw',
          tags: ['workflow'],
          createdAt: '2026-04-11T00:00:00.000Z',
          updatedAt: '2026-04-11T00:00:00.000Z',
          isTodo: false,
          todoCompleted: false,
        },
      ]),
    };

    const summary = await incrementalSync(nextRepository, baseDir);
    const deletions = await loadDeletions(baseDir);
    const note123 = await fs.readFile(path.join(baseDir, 'notes', 'note-123.md'), 'utf8');

    await expect(fs.access(path.join(baseDir, 'notes', 'note-456.md'))).rejects.toThrow();
    expect(summary).toEqual({ created: 1, updated: 1, deleted: 1, skipped: 0, errors: [] });
    expect(note123).toContain('# 新标题');
    expect(deletions).toContainEqual({
      noteId: 'note-456',
      deletedAt: expect.any(String),
      lastKnownTitle: '将被删除的笔记',
    });
  });
});
