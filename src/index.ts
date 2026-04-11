import joplin from 'api';
import { ToastType } from 'api/types';
import { JoplinRepository } from './export/joplinRepository';
import { fullSync, incrementalSync } from './export/syncEngine';
import { runSyncCommand } from './commands';
import { loadPluginSettings, registerPluginSettings } from './settings';
import { createRuntimeState } from './state';
import { createSyncController, SyncInProgressError, type SyncRunResult } from './syncController';
import {
  buildErrorStatusSettingValues,
  buildSuccessStatusSettingValues,
  writeStatusSettingValues,
} from './statusSettings';

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

    const persistSuccess = async (result: SyncRunResult) => {
      await writeStatusSettingValues(
        (key, value) => joplin.settings.setValue(key, value),
        buildSuccessStatusSettingValues(result),
      );
    };

    const persistError = async (input: {
      mode: 'full' | 'incremental';
      trigger: 'manual' | 'auto-sync-complete' | 'auto-startup';
      ranAt: string;
      errorMessage: string;
    }) => {
      await writeStatusSettingValues(
        (key, value) => joplin.settings.setValue(key, value),
        buildErrorStatusSettingValues(input),
      );
    };

    const toastMessageFor = (result: SyncRunResult): string => {
      if (result.trigger === 'auto-startup') {
        return `Automatic startup sync complete — created ${result.summary.created}, updated ${result.summary.updated}, deleted ${result.summary.deleted}, skipped ${result.summary.skipped}.`;
      }

      if (result.trigger === 'auto-sync-complete') {
        return `Automatic incremental sync complete — created ${result.summary.created}, updated ${result.summary.updated}, deleted ${result.summary.deleted}, skipped ${result.summary.skipped}.`;
      }

      return result.message;
    };

    const runMode = async (
      mode: 'full' | 'incremental',
      trigger: 'manual' | 'auto-sync-complete' | 'auto-startup',
    ) => {
      const settings = await loadPluginSettings();
      const repository = new JoplinRepository(joplin.data as never);

      try {
        const result = await runSyncCommand({
          mode,
          trigger,
          settings,
          repository,
          controller,
        });
        await persistSuccess(result);

        await joplin.views.dialogs.showToast({
          message: toastMessageFor(result),
          type: ToastType.Success,
          timestamp: Date.now(),
        });
      } catch (error) {
        if (error instanceof SyncInProgressError && trigger !== 'manual') {
          return;
        }

        const message = (error as Error).message;
        const ranAt = new Date().toISOString();
        await persistError({ mode, trigger, ranAt, errorMessage: message });

        if (trigger === 'manual') {
          await joplin.views.dialogs.showMessageBox(message);
        }
      }
    };

    await joplin.commands.register({
      name: 'joplinMdMirror.full',
      label: 'Joplin Markdown Mirror: Full Sync',
      execute: async () => {
        const answer = await joplin.views.dialogs.showMessageBox(
          'Run Full Sync?\n\nThis will rewrite the mirrored Markdown files in the configured sync directory.',
        );
        if (answer !== 0) return;
        await runMode('full', 'manual');
      },
    });

    await joplin.commands.register({
      name: 'joplinMdMirror.incremental',
      label: 'Joplin Markdown Mirror: Incremental Sync',
      execute: async () => {
        await runMode('incremental', 'manual');
      },
    });

    await joplin.workspace.onSyncComplete(async () => {
      const settings = await loadPluginSettings();
      if (!settings.autoSyncAfterJoplinSyncComplete) return;
      await runMode('incremental', 'auto-sync-complete');
    });

    const settings = await loadPluginSettings();
    if (settings.autoSyncOnStart) {
      await runMode('incremental', 'auto-startup');
    }
  },
});
