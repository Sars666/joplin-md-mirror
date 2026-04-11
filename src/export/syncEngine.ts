import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';
import { renderNoteMarkdown } from './frontmatter';
import { noteFilePath } from './filePaths';
import { appendDeletions, loadManifest, saveManifest } from './stateStore';
import type { DeleteEntry, ExportNote, ManifestEntry, SyncSummary } from '../types';

export type NoteRepository = {
  listExportNotes(): Promise<ExportNote[]>;
};

const sha = (input: string): string => createHash('sha256').update(input).digest('hex');

const metadataPayload = (note: ExportNote): string =>
  JSON.stringify({
    title: note.title,
    notebook: note.notebook,
    tags: note.tags,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    isTodo: note.isTodo,
    todoCompleted: note.todoCompleted,
  });

const manifestEntryFor = (baseDir: string, note: ExportNote): ManifestEntry => ({
  noteId: note.id,
  filePath: noteFilePath(baseDir, note.id),
  updatedAt: note.updatedAt,
  contentHash: sha(note.body),
  metadataHash: sha(metadataPayload(note)),
  syncedAt: new Date().toISOString(),
  title: note.title,
});

const changed = (previous: ManifestEntry | undefined, next: ManifestEntry): boolean => {
  if (!previous) return true;
  return previous.contentHash !== next.contentHash || previous.metadataHash !== next.metadataHash;
};

const writeNote = async (baseDir: string, note: ExportNote): Promise<ManifestEntry> => {
  const filePath = noteFilePath(baseDir, note.id);
  const markdown = renderNoteMarkdown(note);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, markdown, 'utf8');
  return manifestEntryFor(baseDir, note);
};

export const fullSync = async (repository: NoteRepository, baseDir: string): Promise<SyncSummary> => {
  const previousManifest = await loadManifest(baseDir);
  const nextManifest: Record<string, ManifestEntry> = {};
  const summary: SyncSummary = { created: 0, updated: 0, deleted: 0, skipped: 0, errors: [] };
  const notes = await repository.listExportNotes();

  for (const note of notes) {
    const entry = await writeNote(baseDir, note);
    nextManifest[note.id] = entry;

    if (!previousManifest[note.id]) {
      summary.created += 1;
    } else if (changed(previousManifest[note.id], entry)) {
      summary.updated += 1;
    } else {
      summary.skipped += 1;
    }
  }

  await saveManifest(baseDir, nextManifest);
  return summary;
};

export const incrementalSync = async (
  repository: NoteRepository,
  baseDir: string,
): Promise<SyncSummary> => {
  const previousManifest = await loadManifest(baseDir);
  const nextManifest: Record<string, ManifestEntry> = {};
  const summary: SyncSummary = { created: 0, updated: 0, deleted: 0, skipped: 0, errors: [] };
  const notes = await repository.listExportNotes();
  const seenIds = new Set<string>();

  for (const note of notes) {
    seenIds.add(note.id);
    const entry = manifestEntryFor(baseDir, note);

    if (!changed(previousManifest[note.id], entry)) {
      nextManifest[note.id] = previousManifest[note.id];
      summary.skipped += 1;
      continue;
    }

    const persisted = await writeNote(baseDir, note);
    nextManifest[note.id] = persisted;

    if (!previousManifest[note.id]) {
      summary.created += 1;
    } else {
      summary.updated += 1;
    }
  }

  const deletions: DeleteEntry[] = [];

  for (const [noteId, previous] of Object.entries(previousManifest)) {
    if (seenIds.has(noteId)) continue;

    await fs.rm(previous.filePath, { force: true });
    deletions.push({
      noteId,
      deletedAt: new Date().toISOString(),
      lastKnownTitle: previous.title,
    });
    summary.deleted += 1;
  }

  if (deletions.length > 0) {
    await appendDeletions(baseDir, deletions);
  }

  await saveManifest(baseDir, nextManifest);
  return summary;
};
