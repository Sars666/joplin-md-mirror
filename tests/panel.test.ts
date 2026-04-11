import { renderPanelHtml } from '../src/panel';
import { createRuntimeState } from '../src/state';

describe('renderPanelHtml', () => {
  it('shows a not-configured message and disables buttons when no directory is set', () => {
    const html = renderPanelHtml({
      syncDirectory: '',
      state: createRuntimeState(),
    });

    expect(html).toContain('Not configured');
    expect(html).toContain('No sync directory configured. Choose a local folder before running sync.');
    expect(html).toContain('data-action="browse"');
    expect(html).toContain('data-action="full-sync" disabled');
    expect(html).toContain('data-action="incremental-sync" disabled');
  });

  it('shows recent sync details for a success state', () => {
    const html = renderPanelHtml({
      syncDirectory: '/tmp/joplin-mirror',
      state: {
        isRunning: false,
        lastRunMode: 'incremental',
        lastTrigger: 'auto-sync-complete',
        lastRunAt: '2026-04-11T08:00:00.000Z',
        status: 'success',
        summary: { created: 1, updated: 2, deleted: 1, skipped: 3, errors: [] },
        errorMessage: null,
      },
    });

    expect(html).toContain('/tmp/joplin-mirror');
    expect(html).toContain('Last sync: Incremental');
    expect(html).toContain('Trigger: Auto after Joplin sync');
    expect(html).toContain('Created: 1');
    expect(html).toContain('Status: Success');
  });
});
