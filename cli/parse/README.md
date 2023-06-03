# [XRF](../../) / CLI / PARSE

### Description

Script to parse game related information. <br/>
Use `dir_as_json` to parse folder files recursively. <br/>
Use `externals` to parse externals for scripting/configuration. <br/>

Useful for parsing of textures/animations for usage in globals files or docs generation.

### Arguments

List of arguments:

- `-n, --no-extension` - do not include extension for JSON values
- `-h, --help` - display help for command

### Example

- `npm run cli externals`
- `npm run cli parse dir_as_json ../gamedata_original/anims`
- `npm run cli parse dir_as_json ../gamedata_original/textures -- --no-extension`
