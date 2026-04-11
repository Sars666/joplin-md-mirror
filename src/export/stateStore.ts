import fs from 'fs/promises';
import { deletionsPath, ensureMirrorSubdirs, manifestPath } from './filePaths';
import type { DeleteEntry, ManifestEntry } from '../types';

const ensureDirectories = async (baseDir: string): Promise<void> => {
  for (const dir of ensureMirrorSubdirs(baseDir)) {
    await fs.mkdir(dir, { recursive: true });
  }
};

export const loadManifest = async (baseDir: string): Promise<Record<string, ManifestEntry>> => {
  try {
    const raw = await fs.readFile(manifestPath(baseDir), 'utf8');
    return JSON.parse(raw) as Record<string, ManifestEntry>;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw error;
  }
};

export const saveManifest = async (
  baseDir: string,
  entries: Record<string, ManifestEntry>,
): Promise<void> => {
  await ensureDirectories(baseDir);
  await fs.writeFile(manifestPath(baseDir), `${JSON.stringify(entries, null, 2)}\n`, 'utf8');
};

export const loadDeletions = async (baseDir: string): Promise<DeleteEntry[]> => {
  try {
    const raw = await fs.readFile(deletionsPath(baseDir), 'utf8');
    return JSON.parse(raw) as DeleteEntry[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
};

export const appendDeletions = async (baseDir: string, deletions: DeleteEntry[]): Promise<void> => {
  await ensureDirectories(baseDir);
  const existing = await loadDeletions(baseDir);
  await fs.writeFile(
    deletionsPath(baseDir),
    `${JSON.stringify([...existing, ...deletions], null, 2)}\n`,
    'utf8',
  );
};
