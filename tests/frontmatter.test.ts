import { parse } from 'yaml';
import { renderNoteMarkdown } from '../src/export/frontmatter';
import type { ExportNote } from '../src/types';

describe('renderNoteMarkdown', () => {
  it.each([
    { name: 'empty tags', tags: [] },
    { name: 'non-empty tags', tags: ['AI', 'workflow'] },
    { name: 'tags with YAML-sensitive characters', tags: ['key: value', '#topic', 'a "quote"', 'path\\tag', 'true', '[]', '多行\n标签'] },
  ])('renders parseable YAML frontmatter, heading, and note body with $name', ({ tags }) => {
    const note: ExportNote = {
      id: 'note-123',
      title: '教程：构建高效AI',
      body: '这里是正文。',
      notebook: 'OpenClaw',
      tags,
      createdAt: '2026-03-25T14:36:39.000Z',
      updatedAt: '2026-04-03T05:58:09.000Z',
      isTodo: false,
      todoCompleted: false,
    };

    const markdown = renderNoteMarkdown(note);

    expect(markdown).toContain('note_id: "note-123"');
    expect(markdown).toContain('title: "教程：构建高效AI"');
    expect(markdown).toContain('notebook: "OpenClaw"');
    if (tags.length === 0) {
      expect(markdown).toContain('\ntags: []\n');
    } else {
      expect(markdown).toContain(`\ntags:\n${tags.map((tag) => `  - ${JSON.stringify(tag)}`).join('\n')}\n`);
    }

    const frontmatter = markdown.match(/^---\n([\s\S]*?)\n---\n/);
    expect(frontmatter).not.toBeNull();
    expect(parse(frontmatter![1])).toEqual({
      note_id: note.id,
      title: note.title,
      notebook: note.notebook,
      source: 'joplin',
      created_at: note.createdAt,
      updated_at: note.updatedAt,
      tags,
      is_todo: note.isTodo,
      todo_completed: note.todoCompleted,
      source_url: '',
    });
    expect(markdown).toContain('# 教程：构建高效AI');
    expect(markdown).toContain('这里是正文。');
  });
});
