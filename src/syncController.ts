import { setErrorState, setRunningState, setSuccessState } from './state';
import type { RuntimeState, SyncTrigger } from './state';
import type { NoteRepository } from './export/syncEngine';
import type { SyncSummary } from './types';

export class SyncInProgressError extends Error {
  constructor() {
    super('A sync is already running.');
  }
}

export type SyncRunResult = {
  message: string;
  summary: SyncSummary;
  mode: 'full' | 'incremental';
  trigger: SyncTrigger;
  ranAt: string;
};

export type SyncController = {
  run(input: {
    mode: 'full' | 'incremental';
    trigger: SyncTrigger;
    syncDirectory: string;
    repository: NoteRepository;
  }): Promise<SyncRunResult>;
};

export const formatSyncMessage = (
  mode: 'full' | 'incremental',
  summary: SyncSummary,
): string => {
  const modeLabel = mode === 'full' ? 'Full sync' : 'Incremental sync';
  return `${modeLabel} complete — created ${summary.created}, updated ${summary.updated}, deleted ${summary.deleted}, skipped ${summary.skipped}.`;
};

export const createSyncController = (deps: {
  getState: () => RuntimeState;
  setState: (next: RuntimeState) => void;
  fullSync: (repository: NoteRepository, baseDir: string) => Promise<SyncSummary>;
  incrementalSync: (repository: NoteRepository, baseDir: string) => Promise<SyncSummary>;
  now: () => string;
}): SyncController => ({
  async run({ mode, trigger, syncDirectory, repository }) {
    const current = deps.getState();
    if (current.isRunning) throw new SyncInProgressError();

    deps.setState(setRunningState(current, mode, trigger));

    try {
      const summary =
        mode === 'full'
          ? await deps.fullSync(repository, syncDirectory)
          : await deps.incrementalSync(repository, syncDirectory);
      const ranAt = deps.now();
      deps.setState(setSuccessState(deps.getState(), summary, ranAt));
      return {
        message: formatSyncMessage(mode, summary),
        summary,
        mode,
        trigger,
        ranAt,
      };
    } catch (error) {
      deps.setState(setErrorState(deps.getState(), (error as Error).message));
      throw error;
    }
  },
});
