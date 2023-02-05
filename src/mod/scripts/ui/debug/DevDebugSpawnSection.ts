import { CScriptXmlInit, CUIWindow, XR_CScriptXmlInit, XR_CUIScriptWnd } from "xray16";

import { LuaLogger } from "@/mod/scripts/utils/logging";
import { resolveXmlFormPath } from "@/mod/scripts/utils/ui";

const base: string = "menu\\debug\\DevDebugSpawnSection.component";
const logger: LuaLogger = new LuaLogger("DevDebugSpawnSection");

export interface IDevDebugSpawnSection extends XR_CUIScriptWnd {
  owner: XR_CUIScriptWnd;

  InitControls(): void;
  InitCallBacks(): void;
}

export const DevDebugSpawnSection: IDevDebugSpawnSection = declare_xr_class("DevDebugSpawnSection", CUIWindow, {
  __init(this: IDevDebugSpawnSection): void {
    CUIWindow.__init(this);

    this.InitControls();
    this.InitCallBacks();
  },
  InitControls(): void {
    const xml: XR_CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(resolveXmlFormPath(base));
    xml.InitStatic("background", this);
  },
  InitCallBacks(): void {},
} as IDevDebugSpawnSection);
