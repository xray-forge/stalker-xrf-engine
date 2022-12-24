import { LuaLogger } from "@/mod/scripts/utils/logging";
import { resolveXmlFormPath } from "@/mod/scripts/utils/ui";

const base: string = "debug\\DevDebugItemsSection.component";
const log: LuaLogger = new LuaLogger("DevDebugItemsSection");

export interface IDevDebugItemsSection extends XR_CUIScriptWnd {
  owner: XR_CUIScriptWnd;

  InitControls(): void;
  InitCallBacks(): void;
}

export const DevDebugItemsSection: IDevDebugItemsSection = declare_xr_class("DevDebugItemsSection", CUIWindow, {
  __init(this: IDevDebugItemsSection, owner: XR_CUIScriptWnd): void {
    xr_class_super();

    log.info("Init");

    this.owner = owner;

    this.InitControls();
    this.InitCallBacks();
  },
  __finalize(): void {
    log.info("Finalize");
  },
  InitControls(): void {
    log.info("Init controls");

    const xml: XR_CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(resolveXmlFormPath(base));
    xml.InitStatic("background", this);
  },
  InitCallBacks(): void {
    log.info("Init callbacks");
  }
} as IDevDebugItemsSection);
