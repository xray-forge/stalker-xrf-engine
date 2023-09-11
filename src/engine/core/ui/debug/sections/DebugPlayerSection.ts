import { CScriptXmlInit, LuabindClass } from "xray16";

import { AbstractDebugSection } from "@/engine/core/ui/debug/sections/AbstractDebugSection";
import { LuaLogger } from "@/engine/core/utils/logging";
import { resolveXmlFormPath } from "@/engine/core/utils/ui";

const logger: LuaLogger = new LuaLogger($filename);
const base: string = "menu\\debug\\DebugPlayerSection.component";

/**
 * todo;
 */
@LuabindClass()
export class DebugPlayerSection extends AbstractDebugSection {
  public initializeControls(): void {
    const xml: CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(resolveXmlFormPath(base));
  }

  public override initializeCallBacks(): void {}

  public initializeState(): void {}
}
