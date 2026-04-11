import { renderNoteMarkdown } from '../src/export/frontmatter';
import type { ExportNote } from '../src/types';

describe('renderNoteMarkdown', () => {
  it('renders YAML frontmatter, heading, and note body', () => {
    const note: ExportNote = {
      id: 'note-123',
      title: '教程：构建高效AI',
      body: '这里是正文。',
      notebook: 'OpenClaw',
      tags: ['AI', 'workflow'],
      createdAt: '2026-03-25T14:36:39.000Z',
      updatedAt: '2026-04-03T05:58:09.000Z',
      isTodo: false,
      todoCompleted: false,
    };

    const markdown = renderNoteMarkdown(note);

    expect(markdown).toContain('note_id: "note-123"');
    expect(markdown).toContain('title: "教程：构建高效AI"');
    expect(markdown).toContain('notebook: "OpenClaw"');
    expect(markdown).toContain('- "AI"');
    expect(markdown).toContain('# 教程：构建高效AI');
    expect(markdown).toContain('这里是正文。');
  });
});
