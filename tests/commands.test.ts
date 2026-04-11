import { runSyncCommand } from '../src/commands';

describe('runSyncCommand', () => {
  it('throws a clear error when no sync directory is configured', async () => {
    await expect(
      runSyncCommand({
        mode: 'full',
        trigger: 'manual',
        settings: { syncDirectory: '', autoSyncOnStart: false, autoSyncAfterJoplinSyncComplete: false },
        repository: { listExportNotes: jest.fn() },
        controller: { run: jest.fn() },
      }),
    ).rejects.toThrow('Set a sync directory before running sync.');
  });

  it('returns the structured controller result for the caller to display', async () => {
    const result = await runSyncCommand({
      mode: 'incremental',
      trigger: 'manual',
      settings: { syncDirectory: '/tmp/joplin-mirror', autoSyncOnStart: true, autoSyncAfterJoplinSyncComplete: false },
      repository: { listExportNotes: jest.fn() },
      controller: {
        run: jest.fn(async () => ({
          message: 'Incremental sync complete — created 1, updated 2, deleted 1, skipped 3.',
          summary: { created: 1, updated: 2, deleted: 1, skipped: 3, errors: [] },
          mode: 'incremental' as const,
          trigger: 'manual' as const,
          ranAt: '2026-04-11T07:00:00.000Z',
        })),
      },
    });

    expect(result.mode).toBe('incremental');
    expect(result.summary.updated).toBe(2);
  });
});
