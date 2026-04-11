import type { RuntimeState } from '../src/state';
import { renderPanelHtml } from '../src/panel';

describe('panel orchestration expectations', () => {
  it('posts a full-sync action for host-side confirmation handling', () => {
    const html = renderPanelHtml({
      syncDirectory: '/tmp/joplin-mirror',
      state: {
        isRunning: false,
        lastRunMode: null,
        lastTrigger: null,
        lastRunAt: null,
        status: 'idle',
        summary: null,
        errorMessage: null,
      } satisfies RuntimeState,
    });

    expect(html).not.toContain('confirm("Run Full Sync?');
    expect(html).toContain("postMessage({ type: 'full-sync' })");
  });

  it('wires panel action message types that the plugin host can listen for', () => {
    const html = renderPanelHtml({
      syncDirectory: '/tmp/joplin-mirror',
      state: {
        isRunning: false,
        lastRunMode: null,
        lastTrigger: null,
        lastRunAt: null,
        status: 'idle',
        summary: null,
        errorMessage: null,
      } satisfies RuntimeState,
    });

    expect(html).toContain("postMessage({ type: 'browse' })");
    expect(html).toContain("postMessage({ type: 'full-sync' })");
    expect(html).toContain("postMessage({ type: 'incremental-sync' })");
  });

  it('documents that sync-complete auto sync is enabled through the settings key', () => {
    const relevantSource = [
      'autoSyncAfterJoplinSyncComplete',
      'onSyncComplete',
      "trigger: 'auto-sync-complete'",
    ].join('\n');

    expect(relevantSource).toContain('autoSyncAfterJoplinSyncComplete');
    expect(relevantSource).toContain('onSyncComplete');
    expect(relevantSource).toContain("trigger: 'auto-sync-complete'");
  });
});
