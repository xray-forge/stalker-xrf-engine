import { default as chalk } from "chalk";

import { NodeLogger } from "#/utils";

const log: NodeLogger = new NodeLogger("BUILD_CONFIGS_DYNAMIC");

// todo: TS to ltx files transformer build
export async function buildDynamicConfigs(): Promise<void> {
  log.info(chalk.blueBright("Build dynamic configs"));
  log.info("todo;");
}
