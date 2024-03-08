# [XRF](../../) / CLI / SPAWN

### Description

Commands to work with *.spawn files. <br/>

### Arguments

List of arguments:

- `unpack` - unpack single spawn file as few ltx configuration files

List of parameters:

- `-f, --force` - flag to force overwrite of existing output if it exists
- `-p, --path <path>` - path to input spawn file or unpacked directory for processing
- `-d, --dest <path>` - path to place output

### Example

- `npm run cli spawn unpack -f`
- `npm run cli spawn unpack -p ..\..\stalker-xrf-resources-extended\spawns\all.spawn`
