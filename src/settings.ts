import joplin from 'api';
import { SettingItemType } from 'api/types';

export const settingsSection = 'joplinMdMirror';
export const syncDirectoryKey = 'syncDirectory';
export const autoSyncOnStartKey = 'autoSyncOnStart';

export type PluginSettings = {
  syncDirectory: string;
  autoSyncOnStart: boolean;
};

export const registerPluginSettings = async (): Promise<void> => {
  await joplin.settings.registerSection(settingsSection, {
    label: 'Joplin Markdown Mirror',
    iconName: 'fas fa-file-export',
  });

  await joplin.settings.registerSettings({
    [syncDirectoryKey]: {
      value: '',
      type: SettingItemType.String,
      section: settingsSection,
      public: true,
      label: 'Local sync directory',
      description: 'Example: /Users/sarsmini/Projects/MyRAG/workspace/raw/joplin',
    },
    [autoSyncOnStartKey]: {
      value: false,
      type: SettingItemType.Bool,
      section: settingsSection,
      public: true,
      label: 'Run incremental sync on startup',
    },
  });
};

export const loadPluginSettings = async (): Promise<PluginSettings> => {
  const values = await joplin.settings.values([syncDirectoryKey, autoSyncOnStartKey]);
  return {
    syncDirectory: String(values[syncDirectoryKey] ?? ''),
    autoSyncOnStart: Boolean(values[autoSyncOnStartKey]),
  };
};
