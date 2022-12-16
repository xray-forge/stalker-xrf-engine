import { DebugLogger } from "@/mod/scripts/debug_tools/DebugLogger";

const log: DebugLogger = new DebugLogger("EX_ROOT");

const c: number = stalker_ids.sound_panic_human;

log.info("from root");

export function test(): void {
  log.info("from func");
}
