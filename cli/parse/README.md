# [XRF](../../) / CLI / PARSE

### Description

Script to parse folder files recursively. <br/>
Useful for parsing of textures/animations for usage in globals files.

### Arguments

List of arguments:

- `-n, --no-extension` - do not include extension for JSON values
- `-h, --help` - display help for command

### Example

- `npm run cli parse_dir_as_json ../gamedata_original/anims`
- `npm run cli parse_dir_as_json ../gamedata_original/textures -- --no-extension`
