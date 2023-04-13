import { Command } from "commander";

import { setupBuildCommand } from "#/build/run";
import { setupEngineCommand } from "#/engine/run";
import { setupInfoCommand } from "#/info/run";
import { setupLinkCommand } from "#/link/run";
import { setupLogsCommand } from "#/logs/run";
import { setupOpenCommands } from "#/open/run";
import { setupParseCommands } from "#/parse/run";
import { setupPreviewCommands } from "#/preview/run";
import { setupStartCommands } from "#/start/run";
import { setupVerifyCommands } from "#/verify/run";

const program: Command = new Command("cli");

setupBuildCommand(program);
setupInfoCommand(program);
setupEngineCommand(program);
setupLinkCommand(program);
setupLogsCommand(program);
setupOpenCommands(program);
setupParseCommands(program);
setupPreviewCommands(program);
setupStartCommands(program);
setupVerifyCommands(program);

program.parseAsync();
