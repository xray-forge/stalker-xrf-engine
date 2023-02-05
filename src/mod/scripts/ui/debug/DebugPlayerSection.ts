import { CScriptXmlInit, CUIWindow, XR_CScriptXmlInit, XR_CUIScriptWnd } from "xray16";

import { LuaLogger } from "@/mod/scripts/utils/logging";
import { resolveXmlFormPath } from "@/mod/scripts/utils/ui";

const base: string = "menu\\debug\\DebugPlayerSection.component";
const logger: LuaLogger = new LuaLogger("DebugPlayerSection");

export interface IDebugPlayerSection extends XR_CUIScriptWnd {
  owner: XR_CUIScriptWnd;

  InitControls(): void;
  InitCallBacks(): void;
}

export const DebugPlayerSection: IDebugPlayerSection = declare_xr_class("DebugPlayerSection", CUIWindow, {
  __init(this: IDebugPlayerSection): void {
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
} as IDebugPlayerSection);
