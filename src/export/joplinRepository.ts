import type { ExportNote } from '../types';

type DataApi = {
  get(path: string[], query?: Record<string, unknown>): Promise<any>;
};

type NoteRow = {
  id: string;
  title: string;
  body: string;
  parent_id: string;
  user_created_time: number;
  user_updated_time: number;
  is_todo: number;
  todo_completed: number;
};

export class JoplinRepository {
  constructor(private readonly data: DataApi) {}

  async listExportNotes(): Promise<ExportNote[]> {
    const foldersResponse = await this.data.get(['folders'], { fields: ['id', 'title'] });
    const folders = new Map<string, string>(
      (foldersResponse.items ?? []).map((folder: { id: string; title: string }) => [folder.id, folder.title]),
    );

    const rows: NoteRow[] = [];
    let page = 1;

    while (true) {
      const response = await this.data.get(['notes'], {
        page,
        limit: 100,
        fields: [
          'id',
          'title',
          'body',
          'parent_id',
          'user_created_time',
          'user_updated_time',
          'is_todo',
          'todo_completed',
        ],
      });

      rows.push(...(response.items ?? []));
      if (!response.has_more) break;
      page += 1;
    }

    const notes: ExportNote[] = [];

    for (const row of rows) {
      const tagResponse = await this.data.get(['notes', row.id, 'tags'], { fields: ['title'] });
      notes.push({
        id: row.id,
        title: row.title,
        body: row.body,
        notebook: folders.get(row.parent_id) ?? 'Unknown',
        tags: (tagResponse.items ?? []).map((tag: { title: string }) => tag.title),
        createdAt: new Date(row.user_created_time).toISOString(),
        updatedAt: new Date(row.user_updated_time).toISOString(),
        isTodo: row.is_todo === 1,
        todoCompleted: row.todo_completed !== 0,
      });
    }

    return notes;
  }
}
