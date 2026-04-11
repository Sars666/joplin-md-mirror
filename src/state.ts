import type { SyncSummary } from './types';

export type SyncTrigger = 'manual' | 'auto-sync-complete' | 'auto-startup';
export type RuntimeStatus = 'idle' | 'running' | 'success' | 'error';

export type RuntimeState = {
  isRunning: boolean;
  lastRunMode: 'full' | 'incremental' | null;
  lastTrigger: SyncTrigger | null;
  lastRunAt: string | null;
  status: RuntimeStatus;
  summary: SyncSummary | null;
  errorMessage: string | null;
};

export const createRuntimeState = (): RuntimeState => ({
  isRunning: false,
  lastRunMode: null,
  lastTrigger: null,
  lastRunAt: null,
  status: 'idle',
  summary: null,
  errorMessage: null,
});

export const setRunningState = (
  current: RuntimeState,
  mode: 'full' | 'incremental',
  trigger: SyncTrigger,
): RuntimeState => ({
  ...current,
  isRunning: true,
  lastRunMode: mode,
  lastTrigger: trigger,
  status: 'running',
  summary: null,
  errorMessage: null,
});

export const setSuccessState = (
  current: RuntimeState,
  summary: SyncSummary,
  lastRunAt: string,
): RuntimeState => ({
  ...current,
  isRunning: false,
  status: 'success',
  summary,
  errorMessage: null,
  lastRunAt,
});

export const setErrorState = (current: RuntimeState, errorMessage: string): RuntimeState => ({
  ...current,
  isRunning: false,
  status: 'error',
  errorMessage,
});
