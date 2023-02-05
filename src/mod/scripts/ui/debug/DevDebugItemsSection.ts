import { CScriptXmlInit, CUIWindow, XR_CScriptXmlInit, XR_CUIScriptWnd } from "xray16";

import { LuaLogger } from "@/mod/scripts/utils/logging";
import { resolveXmlFormPath } from "@/mod/scripts/utils/ui";

const base: string = "menu\\debug\\DevDebugItemsSection.component";
const logger: LuaLogger = new LuaLogger("DevDebugItemsSection");

export interface IDevDebugItemsSection extends XR_CUIScriptWnd {
  owner: XR_CUIScriptWnd;

  InitControls(): void;
  InitCallBacks(): void;
}

export const DevDebugItemsSection: IDevDebugItemsSection = declare_xr_class("DevDebugItemsSection", CUIWindow, {
  __init(this: IDevDebugItemsSection, owner: XR_CUIScriptWnd): void {
    CUIWindow.__init(this);

    this.owner = owner;

    this.InitControls();
    this.InitCallBacks();
  },
  InitControls(): void {
    const xml: XR_CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(resolveXmlFormPath(base));
    xml.InitStatic("background", this);
  },
  InitCallBacks(): void {},
} as IDevDebugItemsSection);
