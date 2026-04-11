import joplin from 'api';
import { JoplinRepository } from './export/joplinRepository';
import { fullSync, incrementalSync } from './export/syncEngine';
import { runSyncCommand } from './commands';
import { loadPluginSettings, registerPluginSettings } from './settings';

joplin.plugins.register({
  onStart: async function () {
    await registerPluginSettings();

    const registerCommand = async (name: 'full' | 'incremental', label: string) => {
      await joplin.commands.register({
        name: `joplinMdMirror.${name}`,
        label,
        execute: async () => {
          const settings = await loadPluginSettings();
          const repository = new JoplinRepository(joplin.data as any);
          const message = await runSyncCommand({
            mode: name,
            settings,
            repository,
            fullSync,
            incrementalSync,
          });
          console.info(message);
        },
      });
    };

    await registerCommand('full', 'Joplin Markdown Mirror: Full Sync');
    await registerCommand('incremental', 'Joplin Markdown Mirror: Incremental Sync');

    const settings = await loadPluginSettings();
    if (settings.autoSyncOnStart) {
      const repository = new JoplinRepository(joplin.data as any);
      const message = await runSyncCommand({
        mode: 'incremental',
        settings,
        repository,
        fullSync,
        incrementalSync,
      });
      console.info(message);
    }
  },
});
