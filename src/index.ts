import joplin from 'api';
import { JoplinRepository } from './export/joplinRepository';
import { fullSync, incrementalSync } from './export/syncEngine';
import { runSyncCommand } from './commands';
import {
  loadPluginSettings,
  registerPluginSettings,
  syncDirectoryKey,
} from './settings';
import { renderPanelHtml } from './panel';
import { createRuntimeState, setErrorState } from './state';
import { createSyncController, SyncInProgressError } from './syncController';

joplin.plugins.register({
  onStart: async function () {
    await registerPluginSettings();

    let state = createRuntimeState();
    const controller = createSyncController({
      getState: () => state,
      setState: (next) => {
        state = next;
      },
      fullSync,
      incrementalSync,
      now: () => new Date().toISOString(),
    });

    const panel = await joplin.views.panels.create('joplinMdMirror.panel');

    const refreshPanel = async () => {
      const settings = await loadPluginSettings();
      await joplin.views.panels.setHtml(panel, renderPanelHtml({
        syncDirectory: settings.syncDirectory,
        state,
      }));
    };

    const runMode = async (
      mode: 'full' | 'incremental',
      trigger: 'manual' | 'auto-sync-complete',
    ) => {
      const settings = await loadPluginSettings();
      const repository = new JoplinRepository(joplin.data as any);
      const runPromise = runSyncCommand({
        mode,
        trigger,
        settings,
        repository,
        controller,
      });
      await refreshPanel();
      try {
        await runPromise;
      } catch (error) {
        if (error instanceof SyncInProgressError && trigger === 'auto-sync-complete') {
          return;
        }
        console.error(error);
      }
      await refreshPanel();
    };

    await joplin.views.panels.onMessage(panel, async (message: { type: string }) => {
      if (message.type === 'browse') {
        try {
          const result = await joplin.views.dialogs.showOpenDialog({ properties: ['openDirectory'] });
          const selectedPaths = Array.isArray(result?.filePaths)
            ? result.filePaths
            : Array.isArray(result)
              ? result
              : [];
          if (selectedPaths.length > 0) {
            await joplin.settings.setValue(syncDirectoryKey, selectedPaths[0]);
          }
        } catch (error) {
          state = setErrorState(state, (error as Error).message);
        }
        await refreshPanel();
        return;
      }

      if (message.type === 'full-sync') {
        const answer = await joplin.views.dialogs.showMessageBox(
          'Run Full Sync?\n\nThis will rewrite the mirrored Markdown files in the configured sync directory.'
        );
        if (answer === 0) {
          await runMode('full', 'manual');
        }
        return;
      }

      if (message.type === 'incremental-sync') {
        await runMode('incremental', 'manual');
      }
    });

    const registerCommand = async (name: 'full' | 'incremental', label: string) => {
      await joplin.commands.register({
        name: `joplinMdMirror.${name}`,
        label,
        execute: async () => {
          if (name === 'full') {
            const answer = await joplin.views.dialogs.showMessageBox(
              'Run Full Sync?\n\nThis will rewrite the mirrored Markdown files in the configured sync directory.'
            );
            if (answer !== 0) return;
          }
          await runMode(name, 'manual');
        },
      });
    };

    await registerCommand('full', 'Joplin Markdown Mirror: Full Sync');
    await registerCommand('incremental', 'Joplin Markdown Mirror: Incremental Sync');

    await joplin.workspace.onSyncComplete(async () => {
      const settings = await loadPluginSettings();
      if (!settings.autoSyncAfterJoplinSyncComplete) return;
      await runMode('incremental', 'auto-sync-complete');
    });

    const settings = await loadPluginSettings();
    if (settings.autoSyncOnStart) {
      await runMode('incremental', 'manual');
    }

    await refreshPanel();
  },
});
