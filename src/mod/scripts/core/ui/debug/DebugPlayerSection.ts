import { CScriptXmlInit, CUIWindow, LuabindClass, XR_CScriptXmlInit } from "xray16";

import { DebugDialog } from "@/mod/scripts/core/ui/debug/DebugDialog";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { resolveXmlFormPath } from "@/mod/scripts/utils/ui";

const base: string = "menu\\debug\\DebugPlayerSection.component";
const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class DebugPlayerSection extends CUIWindow {
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
