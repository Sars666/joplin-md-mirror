import { createRuntimeState, setRunningState, setSuccessState, setErrorState } from '../src/state';

describe('runtime state helpers', () => {
  it('creates an idle initial state', () => {
    expect(createRuntimeState()).toEqual({
      isRunning: false,
      lastRunMode: null,
      lastTrigger: null,
      lastRunAt: null,
      status: 'idle',
      summary: null,
      errorMessage: null,
    });
  });

  it('stores the startup trigger when startup auto-sync begins', () => {
    const next = setRunningState(createRuntimeState(), 'incremental', 'auto-startup');

    expect(next.lastTrigger).toBe('auto-startup');
    expect(next.status).toBe('running');
  });

  it('stores summary and timestamp on success', () => {
    const running = setRunningState(createRuntimeState(), 'full', 'manual');
    const next = setSuccessState(running, {
      created: 1,
      updated: 2,
      deleted: 0,
      skipped: 3,
      errors: [],
    }, '2026-04-11T06:40:00.000Z');

    expect(next.isRunning).toBe(false);
    expect(next.status).toBe('success');
    expect(next.lastRunAt).toBe('2026-04-11T06:40:00.000Z');
    expect(next.summary?.updated).toBe(2);
  });

  it('stores error details on failure', () => {
    const running = setRunningState(createRuntimeState(), 'full', 'manual');
    const next = setErrorState(running, 'Directory picker failed');

    expect(next.isRunning).toBe(false);
    expect(next.status).toBe('error');
    expect(next.errorMessage).toBe('Directory picker failed');
  });
});
