import { showFreeplayDialog } from "@/mod/scripts/ui/game/FreeplayDialog";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("_tests");

log.info("Testing");

showFreeplayDialog("message_box_yes_no", "sample");
