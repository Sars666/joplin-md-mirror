import { JoplinRepository } from '../src/export/joplinRepository';

describe('JoplinRepository', () => {
  it('maps note rows, folder titles, and tags into ExportNote records', async () => {
    const data = {
      get: jest.fn(async (path: string[], query?: Record<string, unknown>) => {
        if (path[0] === 'folders') return { items: [{ id: 'folder-1', title: 'OpenClaw' }], has_more: false };
        if (path[0] === 'notes' && path.length === 1) {
          return {
            items: [
              {
                id: 'note-123',
                title: '教程：构建高效AI',
                body: '这里是正文。',
                parent_id: 'folder-1',
                user_created_time: Date.parse('2026-03-25T14:36:39.000Z'),
                user_updated_time: Date.parse('2026-04-03T05:58:09.000Z'),
                is_todo: 0,
                todo_completed: 0,
              },
            ],
            has_more: false,
          };
        }
        if (path[0] === 'notes' && path[2] === 'tags') return { items: [{ title: 'AI' }, { title: 'workflow' }], has_more: false };
        throw new Error(`Unexpected path: ${JSON.stringify(path)} query=${JSON.stringify(query)}`);
      }),
    };

    const repository = new JoplinRepository(data);
    const notes = await repository.listExportNotes();

    expect(notes).toEqual([
      {
        id: 'note-123',
        title: '教程：构建高效AI',
        body: '这里是正文。',
        notebook: 'OpenClaw',
        tags: ['AI', 'workflow'],
        createdAt: '2026-03-25T14:36:39.000Z',
        updatedAt: '2026-04-03T05:58:09.000Z',
        isTodo: false,
        todoCompleted: false,
      },
    ]);
  });

  it('paginates through notes until has_more is false', async () => {
    const data = {
      get: jest.fn(async (path: string[], query?: Record<string, unknown>) => {
        if (path[0] === 'folders') return { items: [{ id: 'folder-1', title: 'OpenClaw' }], has_more: false };
        if (path[0] === 'notes' && path.length === 1 && query?.page === 1) {
          return {
            items: [{ id: 'note-1', title: 'A', body: 'A', parent_id: 'folder-1', user_created_time: 1, user_updated_time: 1, is_todo: 0, todo_completed: 0 }],
            has_more: true,
          };
        }
        if (path[0] === 'notes' && path.length === 1 && query?.page === 2) {
          return {
            items: [{ id: 'note-2', title: 'B', body: 'B', parent_id: 'folder-1', user_created_time: 2, user_updated_time: 2, is_todo: 0, todo_completed: 0 }],
            has_more: false,
          };
        }
        if (path[0] === 'notes' && path[2] === 'tags') return { items: [], has_more: false };
        throw new Error(`Unexpected path: ${JSON.stringify(path)} query=${JSON.stringify(query)}`);
      }),
    };

    const repository = new JoplinRepository(data);
    const notes = await repository.listExportNotes();

    expect(notes.map((note) => note.id)).toEqual(['note-1', 'note-2']);
  });
});
