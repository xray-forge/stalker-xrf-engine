# [XRF](../../) / CLI / PREVIEW

### Description

Compile XML form files to HTML to preview them in browser. <br/>
You can find them in `target/preview` folder for observation.

### Arguments

List of arguments:

- `-v, --verbose` - use more verbose logging
- `-c, --clean` - clean destination
- `...filters` - list of space-separated regex patterns for preview generation
- `-h, --help` - display help for command

### Example

- `npm run cli preview`
- `npm run cli preview debug -- --verbose`
- `npm run cli preview debug menu options`
