import { Logger } from "#/utils";

const log: Logger = new Logger("BUILD_CONFIGS_DYNAMIC");

// todo: TS to ltx files transformer build
export async function buildDynamicConfigs(): Promise<void> {
  log.info("Build dynamic configs");
}
