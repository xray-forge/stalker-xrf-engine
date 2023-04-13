import { Command } from "commander";

import { printEngineInfo } from "#/engine/engine_info";
import { printEnginesList } from "#/engine/list_engines";
import { rollbackEngine } from "#/engine/rollback_engine";
import { useEngine } from "#/engine/use_engine";

/**
 * Setup engine command.
 */
export function setupEngineCommand(command: Command): void {
  const engineCommand: Command = command.command("engine").description("custom game engine management");

  engineCommand.command("info").description("manage active game engine").action(printEngineInfo);
  engineCommand.command("rollback").description("rollback active engine to the default one").action(rollbackEngine);
  engineCommand.command("list").description("print list of available engines").action(printEnginesList);
  engineCommand.command("use <engine>").description("switch to provided game engine").action(useEngine);
}
