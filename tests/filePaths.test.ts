import path from 'path';
import {
  deletionsPath,
  ensureMirrorSubdirs,
  manifestPath,
  noteFileName,
  noteFilePath,
  notesDirectory,
} from '../src/export/filePaths';

describe('file path helpers', () => {
  it('uses note ids for stable markdown filenames', () => {
    expect(noteFileName('abc123')).toBe('abc123.md');
  });

  it('builds the expected mirror directory layout', () => {
    const baseDir = '/tmp/joplin-mirror';

    expect(notesDirectory(baseDir)).toBe(path.join(baseDir, 'notes'));
    expect(noteFilePath(baseDir, 'abc123')).toBe(path.join(baseDir, 'notes', 'abc123.md'));
    expect(manifestPath(baseDir)).toBe(path.join(baseDir, 'manifest.json'));
    expect(deletionsPath(baseDir)).toBe(path.join(baseDir, 'deletions.json'));
  });

  it('returns the directories that must exist before sync', () => {
    expect(ensureMirrorSubdirs('/tmp/joplin-mirror')).toEqual([
      '/tmp/joplin-mirror',
      path.join('/tmp/joplin-mirror', 'notes'),
    ]);
  });
});
