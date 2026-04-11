import type { RuntimeState } from './state';

const text = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const modeLabel = (mode: RuntimeState['lastRunMode']): string =>
  mode === 'full' ? 'Full' : mode === 'incremental' ? 'Incremental' : 'Never';

const triggerLabel = (trigger: RuntimeState['lastTrigger']): string =>
  trigger === 'auto-sync-complete' ? 'Auto after Joplin sync' : trigger === 'manual' ? 'Manual' : 'N/A';

const statusLabel = (status: RuntimeState['status']): string => {
  switch (status) {
    case 'running':
      return 'Running';
    case 'success':
      return 'Success';
    case 'error':
      return 'Failed';
    default:
      return 'Idle';
  }
};

const actionScript = () => `
  <script>
    const postMessage = (message) => webviewApi.postMessage(message);
    document.addEventListener('click', (event) => {
      const action = event.target && event.target.dataset ? event.target.dataset.action : null;
      if (!action) return;
      if (action === 'browse') {
        postMessage({ type: 'browse' });
        return;
      }
      if (action === 'full-sync') {
        postMessage({ type: 'full-sync' });
        return;
      }
      if (action === 'incremental-sync') {
        postMessage({ type: 'incremental-sync' });
      }
    });
  </script>
`;

export const renderPanelHtml = (input: {
  syncDirectory: string;
  state: RuntimeState;
}): string => {
  const hasDirectory = Boolean(input.syncDirectory.trim());
  const disabled = !hasDirectory || input.state.isRunning ? 'disabled' : '';
  const directoryText = hasDirectory ? text(input.syncDirectory) : 'Not configured';
  const statusDetails = input.state.summary
    ? `
      <div>Created: ${input.state.summary.created}</div>
      <div>Updated: ${input.state.summary.updated}</div>
      <div>Deleted: ${input.state.summary.deleted}</div>
      <div>Skipped: ${input.state.summary.skipped}</div>
    `
    : '';
  const errorText = input.state.errorMessage ? `<div>Error: ${text(input.state.errorMessage)}</div>` : '';
  const helper = hasDirectory
    ? ''
    : '<div>No sync directory configured. Choose a local folder before running sync.</div>';

  return `
    <html>
      <body>
        <section>
          <h3>Sync directory</h3>
          <div>${directoryText}</div>
          <button data-action="browse">Browse</button>
          ${helper}
        </section>
        <section>
          <button data-action="full-sync" ${disabled}>Full Sync</button>
          <button data-action="incremental-sync" ${disabled}>Incremental Sync</button>
        </section>
        <section>
          <div>Last sync: ${modeLabel(input.state.lastRunMode)}</div>
          <div>Trigger: ${triggerLabel(input.state.lastTrigger)}</div>
          <div>Time: ${input.state.lastRunAt ?? 'N/A'}</div>
          <div>Status: ${statusLabel(input.state.status)}</div>
          ${statusDetails}
          ${errorText}
        </section>
        <section>
          <div>Full Sync rewrites the full mirror directory.</div>
          <div>Incremental Sync applies detected changes only.</div>
          <div>Auto sync after Joplin sync can be enabled in Settings.</div>
        </section>
        ${actionScript()}
      </body>
    </html>
  `;
};
