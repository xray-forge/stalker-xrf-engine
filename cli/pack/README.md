# [XRF](../../) / CLI / PACK

### Description

Script to create new game package from built assets. <br/>
Combines compressed archives, static assets and game engine together.

### Arguments

List of arguments:

- `-c, --clean` - perform destination clean
- `-b, --build` - run build before creation
- `-e, --engine <type>` - use provided engine
- `-o, --optimize ` - use build optimizations
- `-v, --verbose ` - use verbose logging
- `-h, --help` - display help for command

### Example

- `npm run cli pack -- -h`
- `npm run cli pack -- -b -o`
- `npm run cli pack -- -b -e mixed`
- `npm run cli pack -- --verbose`
