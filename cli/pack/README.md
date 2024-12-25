# [XRF](../../) / CLI / PACK

### Description

Script to create new game package from built assets. <br/>
Combines compressed archives, static assets and game engine together.

### Arguments

List of arguments:

- `-c, --clean` - perform `game_pack` dir clean before building
- `--nb, --no-build` - prevent run build before creation
- `--se, --skip-engine` - do not include `bin` dir in resulting package
- `-e, --engine <type>` - use provided engine
- `-o, --optimize ` - use build optimizations
- `-v, --verbose ` - use verbose logging
- `-h, --help` - display help for command

### Example

- `npm run cli pack game -- -h`
- `npm run cli pack game -- -o`
- `npm run cli pack mod -- -e mixed`
- `npm run cli pack mod -- --verbose`
