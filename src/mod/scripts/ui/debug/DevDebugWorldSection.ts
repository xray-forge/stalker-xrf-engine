import { CScriptXmlInit, CUIWindow, XR_CScriptXmlInit, XR_CUIScriptWnd } from "xray16";

import { LuaLogger } from "@/mod/scripts/utils/logging";
import { resolveXmlFormPath } from "@/mod/scripts/utils/ui";

const base: string = "menu\\debug\\DevDebugWorldSection.component";
const logger: LuaLogger = new LuaLogger("DevDebugWorldSection");

export interface IDevDebugWorldSection extends XR_CUIScriptWnd {
  owner: XR_CUIScriptWnd;

  InitControls(): void;
  InitCallBacks(): void;
}

export const DevDebugWorldSection: IDevDebugWorldSection = declare_xr_class("DevDebugWorldSection", CUIWindow, {
  __init(this: IDevDebugWorldSection): void {
    CUIWindow.__init(this);

    this.InitControls();
    this.InitCallBacks();
  },
  InitControls(): void {
    const xml: XR_CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(resolveXmlFormPath(base));
    xml.InitStatic("background", this);
  },
  InitCallBacks(): void {}
} as IDevDebugWorldSection);
