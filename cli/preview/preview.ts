import * as cp from "child_process";

import { default as chalk } from "chalk";

import { default as config } from "#/config.json";
import { Logger } from "#/utils";

const log: Logger = new Logger("PREVIEW");

(async function preview(): Promise<void> {
  log.info("Compiling preview files");

  const cmd: string = "todo";
})();
