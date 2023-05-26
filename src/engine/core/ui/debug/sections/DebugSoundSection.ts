import { CScriptXmlInit, LuabindClass } from "xray16";

import { AbstractDebugSection } from "@/engine/core/ui/debug/sections/AbstractDebugSection";
import { LuaLogger } from "@/engine/core/utils/logging";
import { resolveXmlFormPath } from "@/engine/core/utils/ui";
import { TPath } from "@/engine/lib/types";

const base: TPath = "menu\\debug\\DebugSoundSection.component";
const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class DebugSoundSection extends AbstractDebugSection {
  public initializeControls(): void {
    const xml: CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(resolveXmlFormPath(base));
  }

  public initializeCallBacks(): void {}

  public initializeState(): void {}
}
