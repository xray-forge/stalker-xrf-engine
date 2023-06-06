# [XRF](../../) / CLI / LINK

### Description

Contains commands related to linking and unlinking of game folders.

- Allows linking of game folder and easier navigation
- Allows linking of gamedata folder and easier rebuilding of the engine mod
- Allows linking of game logs for easier observation from IDE

Unlinking removes folders if they are pointing to the project.
If links pointing to other folders, manual involvement will be needed.

### Arguments

List of arguments:

- `--force` - remove links and re-initialize if already existing entries detected

### Example

- `npm run cli link`
- `npm run cli link --force`
- `npm run cli unlink`
- `npm run cli relink`
