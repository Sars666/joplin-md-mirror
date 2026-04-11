const register = jest.fn();
const registerCommand = jest.fn();
const showMessageBox = jest.fn();
const showToast = jest.fn();
const onSyncComplete = jest.fn();
const setValue = jest.fn(async () => undefined);
const values = jest.fn(async () => ({
  syncDirectory: '/tmp/joplin-mirror',
  autoSyncOnStart: false,
  autoSyncAfterJoplinSyncComplete: true,
}));

const runSyncCommandMock: jest.Mock = jest.fn(async (input) => ({
  message: `${input.mode === 'full' ? 'Full sync' : 'Incremental sync'} complete — created 1, updated 2, deleted 1, skipped 3.`,
  summary: { created: 1, updated: 2, deleted: 1, skipped: 3, errors: [] },
  mode: input.mode,
  trigger: input.trigger,
  ranAt: '2026-04-11T07:00:00.000Z',
}));
const writeStatusSettingValuesMock: jest.Mock = jest.fn(async (_setValue, _values) => undefined);
const buildSuccessStatusSettingValues = jest.fn(() => ({
  lastSyncMode: 'Incremental',
  lastSyncTrigger: 'Manual',
  lastSyncTime: '2026-04-11 15:00:00',
  lastSyncResult: 'Success — Created 1, Updated 2, Deleted 1, Skipped 3',
}));
const buildErrorStatusSettingValues = jest.fn(() => ({
  lastSyncMode: 'Incremental',
  lastSyncTrigger: 'Manual',
  lastSyncTime: '2026-04-11 15:00:00',
  lastSyncResult: 'Failed — boom',
}));
const loadPluginSettingsMock = jest.fn(async () => ({
  syncDirectory: '/tmp/joplin-mirror',
  autoSyncOnStart: false,
  autoSyncAfterJoplinSyncComplete: true,
}));
const registerPluginSettingsMock = jest.fn(async () => undefined);
const createRuntimeStateMock = jest.fn(() => ({
  isRunning: false,
  lastRunMode: null,
  lastTrigger: null,
  lastRunAt: null,
  status: 'idle',
  summary: null,
  errorMessage: null,
}));
const syncInProgressErrorClass = class SyncInProgressError extends Error {};
const createSyncControllerMock = jest.fn((_deps) => ({ run: jest.fn() }));
const fullSyncMock = jest.fn();
const incrementalSyncMock = jest.fn();
const joplinRepositoryMock = jest.fn().mockImplementation(() => ({ listExportNotes: jest.fn() }));

jest.mock(
  'api',
  () => ({
    __esModule: true,
    default: {
      plugins: { register },
      commands: { register: registerCommand },
      settings: { registerSection: jest.fn(), registerSettings: jest.fn(), values, setValue },
      views: { dialogs: { showMessageBox, showToast } },
      workspace: { onSyncComplete },
      data: {},
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
    ToastType: {
      Success: 'success',
      Error: 'error',
      Info: 'info',
    },
  }),
  { virtual: true },
);

jest.mock('../src/export/joplinRepository', () => ({
  JoplinRepository: function (this: unknown, ...args: unknown[]) {
    return joplinRepositoryMock(...args);
  },
}));

jest.mock('../src/export/syncEngine', () => ({
  fullSync: (...args: unknown[]) => fullSyncMock(...args),
  incrementalSync: (...args: unknown[]) => incrementalSyncMock(...args),
}));

jest.mock('../src/commands', () => ({
  runSyncCommand: (input: unknown) => runSyncCommandMock(input),
}));

jest.mock('../src/statusSettings', () => ({
  buildSuccessStatusSettingValues,
  buildErrorStatusSettingValues,
  writeStatusSettingValues: (setValueFn: unknown, statusValues: unknown) => writeStatusSettingValuesMock(setValueFn, statusValues),
}));

jest.mock('../src/settings', () => ({
  loadPluginSettings: () => loadPluginSettingsMock(),
  registerPluginSettings: () => registerPluginSettingsMock(),
}));

jest.mock('../src/state', () => ({
  createRuntimeState: () => createRuntimeStateMock(),
}));

jest.mock('../src/syncController', () => ({
  SyncInProgressError: syncInProgressErrorClass,
  createSyncController: (deps: unknown) => createSyncControllerMock(deps),
}));

describe('plugin orchestration', () => {
  beforeEach(() => {
    jest.resetModules();
    register.mockReset();
    registerCommand.mockReset();
    showMessageBox.mockReset();
    showToast.mockReset();
    onSyncComplete.mockReset();
    setValue.mockReset();
    setValue.mockResolvedValue(undefined);
    values.mockReset();
    values.mockResolvedValue({
      syncDirectory: '/tmp/joplin-mirror',
      autoSyncOnStart: false,
      autoSyncAfterJoplinSyncComplete: true,
    });
    runSyncCommandMock.mockReset();
    runSyncCommandMock.mockImplementation(async (input) => ({
      message: `${input.mode === 'full' ? 'Full sync' : 'Incremental sync'} complete — created 1, updated 2, deleted 1, skipped 3.`,
      summary: { created: 1, updated: 2, deleted: 1, skipped: 3, errors: [] },
      mode: input.mode,
      trigger: input.trigger,
      ranAt: '2026-04-11T07:00:00.000Z',
    }));
    writeStatusSettingValuesMock.mockReset();
    writeStatusSettingValuesMock.mockResolvedValue(undefined);
    buildSuccessStatusSettingValues.mockClear();
    buildErrorStatusSettingValues.mockClear();
    loadPluginSettingsMock.mockReset();
    loadPluginSettingsMock.mockResolvedValue({
      syncDirectory: '/tmp/joplin-mirror',
      autoSyncOnStart: false,
      autoSyncAfterJoplinSyncComplete: true,
    });
    registerPluginSettingsMock.mockReset();
    registerPluginSettingsMock.mockResolvedValue(undefined);
    createRuntimeStateMock.mockClear();
    createSyncControllerMock.mockReset();
    createSyncControllerMock.mockReturnValue({ run: jest.fn() });
    fullSyncMock.mockReset();
    incrementalSyncMock.mockReset();
    joplinRepositoryMock.mockReset();
    joplinRepositoryMock.mockImplementation(() => ({ listExportNotes: jest.fn() }));
  });

  it('registers Full Sync and Incremental Sync commands', async () => {
    await import('../src/index');

    expect(register).toHaveBeenCalledTimes(1);
    const plugin = register.mock.calls[0][0];
    await plugin.onStart();

    expect(registerCommand).toHaveBeenCalledWith(expect.objectContaining({
      name: 'joplinMdMirror.full',
      label: 'Joplin Markdown Mirror: Full Sync',
    }));
    expect(registerCommand).toHaveBeenCalledWith(expect.objectContaining({
      name: 'joplinMdMirror.incremental',
      label: 'Joplin Markdown Mirror: Incremental Sync',
    }));
  });

  it('confirms before Full Sync, writes status fields, and shows a toast on success', async () => {
    showMessageBox.mockResolvedValueOnce(0);
    runSyncCommandMock.mockResolvedValueOnce({
      message: 'Full sync complete — created 1, updated 2, deleted 1, skipped 3.',
      summary: { created: 1, updated: 2, deleted: 1, skipped: 3, errors: [] },
      mode: 'full',
      trigger: 'manual',
      ranAt: '2026-04-11T07:00:00.000Z',
    });

    await import('../src/index');
    const plugin = register.mock.calls[0][0];
    await plugin.onStart();

    const fullSyncCommand = registerCommand.mock.calls.find(
      ([command]) => command.name === 'joplinMdMirror.full',
    )?.[0];

    await fullSyncCommand.execute();

    expect(showMessageBox).toHaveBeenCalledWith(
      'Run Full Sync?\n\nThis will rewrite the mirrored Markdown files in the configured sync directory.',
    );
    expect(runSyncCommandMock).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'full',
      trigger: 'manual',
    }));
    expect(writeStatusSettingValuesMock).toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('sync complete'),
      type: 'success',
      timestamp: expect.any(Number),
    }));
  });

  it('shows a toast after incremental sync completes when auto-sync-after-sync is enabled', async () => {
    await import('../src/index');
    const plugin = register.mock.calls[0][0];
    await plugin.onStart();

    const syncCompleteHandler = onSyncComplete.mock.calls[0][0];
    await syncCompleteHandler();

    expect(runSyncCommandMock).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'incremental',
      trigger: 'auto-sync-complete',
    }));
    expect(showToast).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('Automatic incremental sync complete'),
      type: 'success',
      timestamp: expect.any(Number),
    }));
  });

  it('shows a toast after startup auto-sync completes', async () => {
    loadPluginSettingsMock.mockResolvedValue({
      syncDirectory: '/tmp/joplin-mirror',
      autoSyncOnStart: true,
      autoSyncAfterJoplinSyncComplete: false,
    });

    await import('../src/index');
    const plugin = register.mock.calls[0][0];
    await plugin.onStart();

    expect(runSyncCommandMock).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'incremental',
      trigger: 'auto-startup',
    }));
    expect(showToast).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('Automatic startup sync complete'),
      type: 'success',
      timestamp: expect.any(Number),
    }));
  });

  it('silently ignores auto-triggered re-entry without rewriting status', async () => {
    runSyncCommandMock.mockRejectedValueOnce(new syncInProgressErrorClass());

    await import('../src/index');
    const plugin = register.mock.calls[0][0];
    await plugin.onStart();

    const syncCompleteHandler = onSyncComplete.mock.calls[0][0];
    await syncCompleteHandler();

    expect(runSyncCommandMock).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'incremental',
      trigger: 'auto-sync-complete',
    }));
    expect(writeStatusSettingValuesMock).not.toHaveBeenCalled();
    expect(buildErrorStatusSettingValues).not.toHaveBeenCalled();
    expect(showMessageBox).not.toHaveBeenCalled();
    expect(showToast).not.toHaveBeenCalled();
  });
});
