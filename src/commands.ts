import type { PluginSettings } from './settings';
import type { NoteRepository } from './export/syncEngine';
import type { SyncController } from './syncController';
import type { SyncTrigger } from './state';

export type RunSyncMode = 'full' | 'incremental';

export type RunSyncDeps = {
  mode: RunSyncMode;
  trigger: SyncTrigger;
  settings: PluginSettings;
  repository: NoteRepository;
  controller: SyncController;
};

export const runSyncCommand = async ({
  mode,
  trigger,
  settings,
  repository,
  controller,
}: RunSyncDeps) => {
  if (!settings.syncDirectory.trim()) {
    throw new Error('Please choose a local sync directory first.');
  }

  return controller.run({
    mode,
    trigger,
    syncDirectory: settings.syncDirectory,
    repository,
  });
};
