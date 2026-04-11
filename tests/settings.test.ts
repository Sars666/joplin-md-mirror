jest.mock(
  'api',
  () => ({
    __esModule: true,
    default: {
      settings: {
        registerSection: jest.fn(),
        registerSettings: jest.fn(),
        values: jest.fn(),
      },
    },
  }),
  { virtual: true },
);

jest.mock(
  'api/types',
  () => ({
    __esModule: true,
    SettingItemType: {
      Int: 1,
      String: 2,
      Bool: 3,
      Array: 4,
      Object: 5,
      Button: 6,
    },
    SettingItemSubType: {
      FilePathAndArgs: 'file_path_and_args',
      FilePath: 'file_path',
      DirectoryPath: 'directory_path',
    },
  }),
  { virtual: true },
);

import joplin from 'api';
import { SettingItemSubType, SettingItemType } from 'api/types';
import {
  autoSyncAfterJoplinSyncCompleteKey,
  autoSyncOnStartKey,
  lastSyncModeKey,
  lastSyncResultKey,
  lastSyncTimeKey,
  lastSyncTriggerKey,
  loadPluginSettings,
  registerPluginSettings,
  settingsSection,
  syncDirectoryKey,
} from '../src/settings';

describe('plugin settings', () => {
  const settingsApi = joplin.settings as unknown as {
    registerSection: jest.Mock;
    registerSettings: jest.Mock;
    values: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    settingsApi.registerSection.mockResolvedValue(undefined);
    settingsApi.registerSettings.mockResolvedValue(undefined);
    settingsApi.values.mockResolvedValue({});
  });

  it('registers user-editable settings and public status fields', async () => {
    await registerPluginSettings();

    expect(settingsApi.registerSection).toHaveBeenCalledWith(
      settingsSection,
      expect.objectContaining({ label: 'Joplin Markdown Mirror' }),
    );

    expect(settingsApi.registerSettings).toHaveBeenCalledWith({
      [syncDirectoryKey]: expect.objectContaining({
        value: '',
        type: SettingItemType.String,
        subType: SettingItemSubType.DirectoryPath,
        public: true,
      }),
      [autoSyncOnStartKey]: expect.objectContaining({
        value: false,
        type: SettingItemType.Bool,
        public: true,
      }),
      [autoSyncAfterJoplinSyncCompleteKey]: expect.objectContaining({
        value: false,
        type: SettingItemType.Bool,
        public: true,
      }),
      [lastSyncModeKey]: expect.objectContaining({
        value: '',
        type: SettingItemType.String,
        public: true,
      }),
      [lastSyncTriggerKey]: expect.objectContaining({
        value: '',
        type: SettingItemType.String,
        public: true,
      }),
      [lastSyncTimeKey]: expect.objectContaining({
        value: '',
        type: SettingItemType.String,
        public: true,
      }),
      [lastSyncResultKey]: expect.objectContaining({
        value: '',
        type: SettingItemType.String,
        public: true,
      }),
    });
  });

  it('loads only the user-editable settings', async () => {
    settingsApi.values.mockResolvedValue({
      [syncDirectoryKey]: '/tmp/joplin-mirror',
      [autoSyncOnStartKey]: true,
      [autoSyncAfterJoplinSyncCompleteKey]: false,
      [lastSyncModeKey]: 'incremental',
    });

    await expect(loadPluginSettings()).resolves.toEqual({
      syncDirectory: '/tmp/joplin-mirror',
      autoSyncOnStart: true,
      autoSyncAfterJoplinSyncComplete: false,
    });

    expect(settingsApi.values).toHaveBeenCalledWith([
      syncDirectoryKey,
      autoSyncOnStartKey,
      autoSyncAfterJoplinSyncCompleteKey,
    ]);
  });

  it('defaults missing user-editable settings to safe values even when status fields exist', async () => {
    settingsApi.values.mockResolvedValue({
      [lastSyncModeKey]: 'incremental',
      [lastSyncTriggerKey]: 'manual',
      [lastSyncTimeKey]: '2026-04-11T00:00:00.000Z',
      [lastSyncResultKey]: 'ok',
    });

    await expect(loadPluginSettings()).resolves.toEqual({
      syncDirectory: '',
      autoSyncOnStart: false,
      autoSyncAfterJoplinSyncComplete: false,
    });

    expect(settingsApi.values).toHaveBeenCalledWith([
      syncDirectoryKey,
      autoSyncOnStartKey,
      autoSyncAfterJoplinSyncCompleteKey,
    ]);
  });
});
