import fs from 'fs';
import path from 'path';

describe('release manifest version', () => {
  it('matches package.json version', () => {
    const rootDir = path.resolve(__dirname, '..');
    const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
    const manifestJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'src', 'manifest.json'), 'utf8'));

    expect(manifestJson.version).toBe(packageJson.version);
  });
});
