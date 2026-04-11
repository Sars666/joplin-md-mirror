import type { ExportNote } from '../types';

const yamlValue = (value: string): string => JSON.stringify(value);

const yamlList = (values: string[]): string => {
  if (values.length === 0) return '[]';
  return `\n${values.map((value) => `  - ${yamlValue(value)}`).join('\n')}`;
};

export const renderNoteMarkdown = (note: ExportNote): string => {
  return [
    '---',
    `note_id: ${yamlValue(note.id)}`,
    `title: ${yamlValue(note.title)}`,
    `notebook: ${yamlValue(note.notebook)}`,
    'source: "joplin"',
    `created_at: ${yamlValue(note.createdAt)}`,
    `updated_at: ${yamlValue(note.updatedAt)}`,
    `tags:${yamlList(note.tags)}`,
    `is_todo: ${note.isTodo}`,
    `todo_completed: ${note.todoCompleted}`,
    'source_url: ""',
    '---',
    '',
    `# ${note.title}`,
    '',
    note.body,
    '',
  ].join('\n');
};
