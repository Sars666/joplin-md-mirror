import joplin from 'api';
import { SettingItemSubType, SettingItemType } from 'api/types';

export const settingsSection = 'joplinMdMirror';
export const syncDirectoryKey = 'syncDirectory';
export const autoSyncOnStartKey = 'autoSyncOnStart';
export const autoSyncAfterJoplinSyncCompleteKey = 'autoSyncAfterJoplinSyncComplete';
export const enableSyncSuccessToastKey = 'enableSyncSuccessToast';
export const lastSyncModeKey = 'lastSyncMode';
export const lastSyncTriggerKey = 'lastSyncTrigger';
export const lastSyncTimeKey = 'lastSyncTime';
export const lastSyncResultKey = 'lastSyncResult';

export type PluginSettings = {
  syncDirectory: string;
  autoSyncOnStart: boolean;
  autoSyncAfterJoplinSyncComplete: boolean;
  enableSyncSuccessToast: boolean;
};

export type StatusSettingValues = {
  lastSyncMode: string;
  lastSyncTrigger: string;
  lastSyncTime: string;
  lastSyncResult: string;
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
      subType: SettingItemSubType.DirectoryPath,
      section: settingsSection,
      public: true,
      label: 'Local sync directory',
      description: 'Example: /path/to/joplin-mirror',
    },
    [autoSyncOnStartKey]: {
      value: false,
      type: SettingItemType.Bool,
      section: settingsSection,
      public: true,
      label: 'Run incremental sync on startup',
    },
    [autoSyncAfterJoplinSyncCompleteKey]: {
      value: false,
      type: SettingItemType.Bool,
      section: settingsSection,
      public: true,
      label: 'Run incremental sync after Joplin sync completes',
    },
    [enableSyncSuccessToastKey]: {
      value: true,
      type: SettingItemType.Bool,
      section: settingsSection,
      public: true,
      label: 'Enable sync success toast',
    },
    [lastSyncModeKey]: {
      value: '',
      type: SettingItemType.String,
      section: settingsSection,
      public: true,
      label: 'Last sync mode',
    },
    [lastSyncTriggerKey]: {
      value: '',
      type: SettingItemType.String,
      section: settingsSection,
      public: true,
      label: 'Last sync trigger',
    },
    [lastSyncTimeKey]: {
      value: '',
      type: SettingItemType.String,
      section: settingsSection,
      public: true,
      label: 'Last sync time',
    },
    [lastSyncResultKey]: {
      value: '',
      type: SettingItemType.String,
      section: settingsSection,
      public: true,
      label: 'Last sync result',
    },
  });
};

export const loadPluginSettings = async (): Promise<PluginSettings> => {
  const values = await joplin.settings.values([
    syncDirectoryKey,
    autoSyncOnStartKey,
    autoSyncAfterJoplinSyncCompleteKey,
    enableSyncSuccessToastKey,
  ]);
  return {
    syncDirectory: String(values[syncDirectoryKey] ?? ''),
    autoSyncOnStart: Boolean(values[autoSyncOnStartKey]),
    autoSyncAfterJoplinSyncComplete: Boolean(values[autoSyncAfterJoplinSyncCompleteKey]),
    enableSyncSuccessToast: values[enableSyncSuccessToastKey] === undefined ? true : Boolean(values[enableSyncSuccessToastKey]),
  };
};
