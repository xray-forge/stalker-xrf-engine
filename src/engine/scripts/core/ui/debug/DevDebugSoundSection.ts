import { CScriptXmlInit, CUIWindow, LuabindClass, XR_CScriptXmlInit, XR_CUIScriptWnd } from "xray16";

import { DebugDialog } from "@/engine/scripts/core/ui/debug/DebugDialog";
import { LuaLogger } from "@/engine/scripts/utils/logging";
import { resolveXmlFormPath } from "@/engine/scripts/utils/ui";

const base: string = "menu\\debug\\DevDebugSoundSection.component";
const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class DevDebugSoundSection extends CUIWindow {
  public owner: DebugDialog;

  public constructor(owner: DebugDialog) {
    super();

    this.owner = owner;

    this.InitControls();
    this.InitCallBacks();
  }

  public InitControls(): void {
    const xml: XR_CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(resolveXmlFormPath(base));
    xml.InitStatic("background", this);
  }

  public InitCallBacks(): void {}
}
