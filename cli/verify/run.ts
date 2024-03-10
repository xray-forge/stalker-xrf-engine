import { Command, Option } from "commander";

import { verifyLtx } from "#/verify/verify_ltx";
import { verifyProject } from "#/verify/verify_project";

/**
 * Setup verify commands.
 */
export function setupVerifyCommands(command: Command): void {
  const verifyCommand: Command = command.command("verify").description("custom verification commands");

  verifyCommand.command("project").description("verify state of ltx project").action(verifyProject);

  verifyCommand
    .command("ltx")
    .description("verify ltx projects integrity and types")
    .addOption(new Option("-s, --strict", "Run ltx checker in strict mode").default(false))
    .addOption(new Option("-v, --verbose", "Whether verbose logging mode is enabled").default(false))
    .action(verifyLtx);
}
