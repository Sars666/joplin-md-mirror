# Joplin Markdown Mirror

Joplin Markdown Mirror exports your Joplin notes into a local Markdown mirror directory so the files can be indexed or consumed by external tooling such as personal RAG pipelines.

## What it does

- Mirrors Joplin notes into a local Markdown directory
- Supports Full Sync and Incremental Sync
- Tracks recent sync status in plugin settings
- Can run incremental sync on startup
- Can run incremental sync after Joplin sync completes

## Settings

The plugin is configured from the `Joplin Markdown Mirror` settings section.

Available settings include:

- `Local sync directory`
- `Run incremental sync on startup`
- `Run incremental sync after Joplin sync completes`
- `Last sync mode`
- `Last sync trigger`
- `Last sync time`
- `Last sync result`

## Commands

The plugin registers two commands:

- `Joplin Markdown Mirror: Full Sync`
- `Joplin Markdown Mirror: Incremental Sync`

Full Sync asks for confirmation before it runs.

## Local development

```bash
cd /path/to/project/joplin-md-mirror-plugin
npm install
npm test
npm run dist
```

The build output is written to:

```text
publish/com.sarsmini.joplin-md-mirror.jpl
```

## Release checklist

Before a public release:

- set `homepage_url`
- set `repository_url`
- verify screenshots and promo tile reflect the current UI
- bump the version if needed
- rebuild the `.jpl`

## License

MIT
