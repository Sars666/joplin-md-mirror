# Release Notes

## 0.2.0

Refreshes the plugin package for a cleaner public release and keeps the toast toggle behavior available on the current release line.

### Included

- Repacked the plugin as version 0.2.0 from the current public codebase
- Corrected package metadata so version sources stay aligned during release builds
- Reduced the oversized icon asset to a true 128×128 release icon to keep the package leaner
- Retained the sync success toast toggle introduced on the 0.1.x line

## 0.1.3

Refreshes the public-facing plugin documentation so the README reads like a user-oriented plugin page instead of internal project notes.

### Included

- Rewritten README with a clearer product overview
- User-facing explanation of sync workflow, settings, and commands
- Public installation and repository information

## 0.1.2

Refreshes the plugin's published visuals with the final icon, screenshot, and promo tile assets.

### Included

- Updated plugin icon asset
- Updated settings screenshot asset
- Updated promo tile asset

### Notes

- The plugin ID remains `com.sarsmini.joplin-md-mirror` for compatibility with existing installs.
- The public repository for this release is `https://github.com/Sars666/joplin-md-mirror`.

## 0.1.1

Adds a user-facing toggle to enable or disable sync success toast notifications while keeping toast behavior enabled by default.

### Included

- New `Enable sync success toast` setting
- Toast gating for manual sync success notifications
- Toast gating for startup auto-sync success notifications
- Toast gating for post-Joplin-sync automatic success notifications

### Notes

- The plugin ID remains `com.sarsmini.joplin-md-mirror` for compatibility with existing installs.
- The public repository for this release is `https://github.com/Sars666/joplin-md-mirror`.

## 0.1.0

Initial release of Joplin Markdown Mirror.

### Included

- Settings-centric sync workflow
- Full Sync confirmation
- Incremental Sync command
- Automatic incremental sync on startup
- Automatic incremental sync after Joplin sync completes
- Sync status fields inside plugin settings
- Toast feedback for manual and automatic sync completion

### Notes

- The plugin ID remains `com.sarsmini.joplin-md-mirror` for compatibility with existing installs.
- The public repository for this release is `https://github.com/Sars666/joplin-md-mirror`.
