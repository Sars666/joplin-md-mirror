import type { SyncSummary } from './types';
import type { PluginSettings } from './settings';
import type { NoteRepository } from './export/syncEngine';

export type RunSyncMode = 'full' | 'incremental';

export type RunSyncDeps = {
  mode: RunSyncMode;
  settings: PluginSettings;
  repository: NoteRepository;
  fullSync: (repository: NoteRepository, baseDir: string) => Promise<SyncSummary>;
  incrementalSync: (repository: NoteRepository, baseDir: string) => Promise<SyncSummary>;
};

const formatSummary = (mode: RunSyncMode, summary: SyncSummary): string => {
  const modeLabel = mode === 'full' ? 'Full sync' : 'Incremental sync';
  return `${modeLabel} complete — created ${summary.created}, updated ${summary.updated}, deleted ${summary.deleted}, skipped ${summary.skipped}.`;
};

export const runSyncCommand = async ({
  mode,
  settings,
  repository,
  fullSync,
  incrementalSync,
}: RunSyncDeps): Promise<string> => {
  if (!settings.syncDirectory.trim()) {
    throw new Error('Set a sync directory before running sync.');
  }

  const summary =
    mode === 'full'
      ? await fullSync(repository, settings.syncDirectory)
      : await incrementalSync(repository, settings.syncDirectory);

  return formatSummary(mode, summary);
};
