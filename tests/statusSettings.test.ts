jest.mock(
  'api',
  () => ({
    __esModule: true,
    default: {
      settings: {},
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

import {
  buildErrorStatusSettingValues,
  buildSuccessStatusSettingValues,
  writeStatusSettingValues,
} from '../src/statusSettings';

describe('statusSettings', () => {
  it('formats a successful sync result for settings display', () => {
    const values = buildSuccessStatusSettingValues({
      mode: 'incremental',
      trigger: 'auto-sync-complete',
      ranAt: '2026-04-11T12:32:15.000Z',
      summary: { created: 1, updated: 2, deleted: 1, skipped: 223, errors: [] },
    }, () => '2026-04-11 20:32:15');

    expect(values).toEqual({
      lastSyncMode: 'Incremental',
      lastSyncTrigger: 'Auto after Joplin sync',
      lastSyncTime: '2026-04-11 20:32:15',
      lastSyncResult: 'Success — Created 1, Updated 2, Deleted 1, Skipped 223',
    });
  });

  it('formats a failed startup sync result for settings display', () => {
    const values = buildErrorStatusSettingValues({
      mode: 'incremental',
      trigger: 'auto-startup',
      ranAt: '2026-04-11T12:40:00.000Z',
      errorMessage: 'Directory picker failed',
    }, () => '2026-04-11 20:40:00');

    expect(values).toEqual({
      lastSyncMode: 'Incremental',
      lastSyncTrigger: 'Auto on startup',
      lastSyncTime: '2026-04-11 20:40:00',
      lastSyncResult: 'Failed — Directory picker failed',
    });
  });

  it('writes all four status settings through the provided setter', async () => {
    const setValue = jest.fn(async () => undefined);

    await writeStatusSettingValues(setValue, {
      lastSyncMode: 'Full',
      lastSyncTrigger: 'Manual',
      lastSyncTime: '2026-04-11 20:32:15',
      lastSyncResult: 'Success — Created 1, Updated 2, Deleted 1, Skipped 223',
    });

    expect(setValue.mock.calls).toEqual([
      ['lastSyncMode', 'Full'],
      ['lastSyncTrigger', 'Manual'],
      ['lastSyncTime', '2026-04-11 20:32:15'],
      ['lastSyncResult', 'Success — Created 1, Updated 2, Deleted 1, Skipped 223'],
    ]);
  });
});
