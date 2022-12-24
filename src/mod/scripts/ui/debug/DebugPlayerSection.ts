import { LuaLogger } from "@/mod/scripts/utils/logging";
import { resolveXmlFormPath } from "@/mod/scripts/utils/rendering";

const base: string = "debug\\DebugPlayerSection.component";
const log: LuaLogger = new LuaLogger("DebugPlayerSection");

export interface IDebugPlayerSection extends XR_CUIScriptWnd {
  owner: XR_CUIScriptWnd;

  InitControls(): void;
  InitCallBacks(): void;
}

export const DebugPlayerSection: IDebugPlayerSection = declare_xr_class("DebugPlayerSection", CUIWindow, {
  __init(this: IDebugPlayerSection): void {
    xr_class_super();

    log.info("Init");

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
} as IDebugPlayerSection);
