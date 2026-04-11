import { runSyncCommand } from '../src/commands';

describe('runSyncCommand', () => {
  it('throws a clear error when no sync directory is configured', async () => {
    await expect(
      runSyncCommand({
        mode: 'full',
        settings: { syncDirectory: '', autoSyncOnStart: false },
        repository: { listExportNotes: jest.fn() },
        fullSync: jest.fn(),
        incrementalSync: jest.fn(),
      }),
    ).rejects.toThrow('Set a sync directory before running sync.');
  });

  it('formats a readable success summary', async () => {
    const message = await runSyncCommand({
      mode: 'incremental',
      settings: { syncDirectory: '/tmp/joplin-mirror', autoSyncOnStart: true },
      repository: { listExportNotes: jest.fn() },
      fullSync: jest.fn(),
      incrementalSync: jest.fn(async () => ({ created: 1, updated: 2, deleted: 1, skipped: 3, errors: [] })),
    });

    expect(message).toBe('Incremental sync complete — created 1, updated 2, deleted 1, skipped 3.');
  });
});
