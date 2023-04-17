# [XRF](../../) / CLI / ENGINE

### Description

Script to manage currently used version of X-Ray engine.
Simply backups original version of game engine an links one of variants from project 'cli/bin/engines' folder.

Possible variants are:

- gold
- release
- mixed

More details variant details [here](https://github.com/OpenXRay/xray-16/wiki/%5BEN%5D-How-to-install-and-play).

### Arguments

List of arguments:

- `list` - print list of available x-ray engines
- `use` - use one of available x-ray versions
- `rollback` - rollback to backup version of the engine
- `info` - print details about currenty used engine

### Example

- `npm run cli engine list`
- `npm run cli engine use gold`
- `npm run cli engine info`
- `npm run cli engine rollback`
