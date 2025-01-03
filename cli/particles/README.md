# [XRF](../../) / CLI / SPAWN

### Description

Commands to work with particles.xr files. <br/>

### Arguments

List of arguments:

- `unpack` - unpack single particles.xr file as separate ltx configs
- `pack` - pack particles configs as single particles.xr file

List of parameters:

- `-f, --force` - flag to force overwrite of existing output if it exists
- `-p, --path <path>` - path to input spawn file or unpacked directory for processing
- `-d, --dest <path>` - path to place output

### Example

- `npm run cli particles pack`
- `npm run cli particles unpack -f`
- `npm run cli particles unpack -p ./src/resources/particles.xr`
