import { CScriptXmlInit, CUIWindow, XR_CScriptXmlInit, XR_CUIScriptWnd } from "xray16";

import { LuaLogger } from "@/mod/scripts/utils/logging";
import { resolveXmlFormPath } from "@/mod/scripts/utils/ui";

const base: string = "menu\\debug\\DevDebugSoundSection.component";
const logger: LuaLogger = new LuaLogger("DevDebugSoundSection");

export interface IDevDebugSoundSection extends XR_CUIScriptWnd {
  owner: XR_CUIScriptWnd;

  InitControls(): void;
  InitCallBacks(): void;
}

export const DevDebugSoundSection: IDevDebugSoundSection = declare_xr_class("DevDebugSoundSection", CUIWindow, {
  __init(this: IDevDebugSoundSection): void {
    CUIWindow.__init(this);

    this.InitControls();
    this.InitCallBacks();
  },
  InitControls(): void {
    logger.info("Init controls");

    const xml: XR_CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(resolveXmlFormPath(base));
    xml.InitStatic("background", this);
  },
  InitCallBacks(): void {},
} as IDevDebugSoundSection);
