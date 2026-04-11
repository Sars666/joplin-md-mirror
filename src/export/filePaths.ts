import path from 'path';

export const notesDirectory = (baseDir: string): string => path.join(baseDir, 'notes');

export const noteFileName = (noteId: string): string => `${noteId}.md`;

export const noteFilePath = (baseDir: string, noteId: string): string =>
  path.join(notesDirectory(baseDir), noteFileName(noteId));

export const manifestPath = (baseDir: string): string => path.join(baseDir, 'manifest.json');

export const deletionsPath = (baseDir: string): string => path.join(baseDir, 'deletions.json');

export const ensureMirrorSubdirs = (baseDir: string): string[] => [baseDir, notesDirectory(baseDir)];
