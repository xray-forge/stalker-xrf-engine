# [XRF](../../) / CLI / VERIFY

### Description

Script performing project state checks.  <br/>

#### Project

Verifies whether custom engine is active, config is correct and symlinks are activated.

#### LTX

Verifies LTX configs files: include statements, inheritance of sections, $scheme validity

### Arguments

List of arguments:

- `ltx` - verify project ltx files

- `-s, --strict` - perform `strict` check where all sections should have defined schemes
- `-v, --verbose` - perform check in verbose logging mode
- `-s, --silent` - perform check in silent logging mode

### Example

- `npm run cli verify project`
- `npm run cli verify ltx`
- `npm run cli verify ltx -- -s -v`
