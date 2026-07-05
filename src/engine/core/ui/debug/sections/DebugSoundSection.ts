import { CScriptXmlInit, LuabindClass } from "xray16";
import { TPath } from "xray16/lib";

import { AbstractDebugSection } from "@/engine/core/ui/debug/sections/AbstractDebugSection";
import { resolveXmlFormPath } from "@/engine/core/utils/ui";

const base: TPath = "menu\\debug\\DebugSoundSection.component";

/**
 * Debug game sounds section.
 */
@LuabindClass()
export class DebugSoundSection extends AbstractDebugSection {
  public initializeControls(): void {
    const xml: CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(resolveXmlFormPath(base));
  }
}
