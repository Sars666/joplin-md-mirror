import {
  lastSyncModeKey,
  lastSyncResultKey,
  lastSyncTimeKey,
  lastSyncTriggerKey,
  type StatusSettingValues,
} from './settings';
import type { SyncRunResult } from './syncController';
import type { SyncTrigger } from './state';

const modeLabel = (mode: SyncRunResult['mode']): string =>
  mode === 'full' ? 'Full' : 'Incremental';

const triggerLabel = (trigger: SyncTrigger): string => {
  switch (trigger) {
    case 'manual':
      return 'Manual';
    case 'auto-sync-complete':
      return 'Auto after Joplin sync';
    case 'auto-startup':
      return 'Auto on startup';
  }
};

const defaultFormatTime = (iso: string): string => {
  const value = new Date(iso);
  const pad = (part: number) => String(part).padStart(2, '0');

  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`;
};

export const buildSuccessStatusSettingValues = (
  result: Pick<SyncRunResult, 'mode' | 'trigger' | 'ranAt' | 'summary'>,
  formatTime: (iso: string) => string = defaultFormatTime,
): StatusSettingValues => ({
  lastSyncMode: modeLabel(result.mode),
  lastSyncTrigger: triggerLabel(result.trigger),
  lastSyncTime: formatTime(result.ranAt),
  lastSyncResult: `Success — Created ${result.summary.created}, Updated ${result.summary.updated}, Deleted ${result.summary.deleted}, Skipped ${result.summary.skipped}`,
});

export const buildErrorStatusSettingValues = (
  input: {
    mode: SyncRunResult['mode'];
    trigger: SyncTrigger;
    ranAt: string;
    errorMessage: string;
  },
  formatTime: (iso: string) => string = defaultFormatTime,
): StatusSettingValues => ({
  lastSyncMode: modeLabel(input.mode),
  lastSyncTrigger: triggerLabel(input.trigger),
  lastSyncTime: formatTime(input.ranAt),
  lastSyncResult: `Failed — ${input.errorMessage}`,
});

export const writeStatusSettingValues = async (
  setValue: (key: string, value: string) => Promise<void>,
  values: StatusSettingValues,
): Promise<void> => {
  await setValue(lastSyncModeKey, values.lastSyncMode);
  await setValue(lastSyncTriggerKey, values.lastSyncTrigger);
  await setValue(lastSyncTimeKey, values.lastSyncTime);
  await setValue(lastSyncResultKey, values.lastSyncResult);
};
