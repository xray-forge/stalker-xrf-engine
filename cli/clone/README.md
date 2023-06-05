# [XRF](../../) / CLI / CLONE

### Description

Scripts to clone additional assets in a fast and reliable way. <br/>
Useful for loading extended pack of game assets or separate locales.

### Arguments

List of arguments:

- `-l, --list` - print list of possible items to clone
- `-f, --force` - force clone even if already cloned, removes existing assets before operation
- `-v, --verbose` - use verbose logging
- `-h, --help` - display help for command

### Example

- `npm run cli clone -l`
- `npm run cli clone locale_ukr`
- `npm run cli clone locale_eng -f`
