import { createRuntimeState } from '../src/state';
import { createSyncController } from '../src/syncController';

describe('syncController', () => {
  it('runs incremental sync, updates state, and returns a structured result', async () => {
    let state = createRuntimeState();
    const controller = createSyncController({
      getState: () => state,
      setState: (next) => {
        state = next;
      },
      fullSync: jest.fn(),
      incrementalSync: jest.fn(async () => ({ created: 1, updated: 2, deleted: 0, skipped: 3, errors: [] })),
      now: () => '2026-04-11T07:00:00.000Z',
    });

    const result = await controller.run({
      mode: 'incremental',
      trigger: 'manual',
      syncDirectory: '/tmp/joplin-mirror',
      repository: { listExportNotes: jest.fn() },
    });

    expect(result.message).toBe('Incremental sync complete — created 1, updated 2, deleted 0, skipped 3.');
    expect(state.status).toBe('success');
    expect(state.lastTrigger).toBe('manual');
    expect(state.summary?.created).toBe(1);
  });

  it('rejects re-entry while a sync is already running', async () => {
    const controller = createSyncController({
      getState: () => ({
        isRunning: true,
        lastRunMode: 'incremental',
        lastTrigger: 'manual',
        lastRunAt: null,
        status: 'running',
        summary: null,
        errorMessage: null,
      }),
      setState: jest.fn(),
      fullSync: jest.fn(),
      incrementalSync: jest.fn(),
      now: () => '2026-04-11T07:00:00.000Z',
    });

    await expect(
      controller.run({
        mode: 'incremental',
        trigger: 'auto-sync-complete',
        syncDirectory: '/tmp/joplin-mirror',
        repository: { listExportNotes: jest.fn() },
      }),
    ).rejects.toThrow('A sync is already running.');
  });
});
