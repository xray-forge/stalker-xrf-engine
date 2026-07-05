import { CScriptXmlInit, LuabindClass } from "xray16";
import { TPath } from "xray16/lib";

import { AbstractDebugSection } from "@/engine/core/ui/debug/sections/AbstractDebugSection";
import { resolveXmlFormPath } from "@/engine/core/utils/ui";

const base: TPath = "menu\\debug\\DebugPlayerSection.component";

/**
 * Debug section to display / handle actor state.
 */
@LuabindClass()
export class DebugPlayerSection extends AbstractDebugSection {
  public initializeControls(): void {
    const xml: CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(resolveXmlFormPath(base));
  }
}
