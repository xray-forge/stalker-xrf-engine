import { LuaLogger } from "@/mod/scripts/debug_tools/LuaLogger";
import { resolveXmlFormPath } from "@/mod/scripts/utils/rendering";

const base: string = "debug\\DevDebugSpawnSection.component";
const log: LuaLogger = new LuaLogger("DevDebugSpawnSection");

export interface IDevDebugSpawnSection extends XR_CUIScriptWnd {
  owner: XR_CUIScriptWnd;

  InitControls(): void;
  InitCallBacks(): void;
}

export const DevDebugSpawnSection: IDevDebugSpawnSection = declare_xr_class("DevDebugSpawnSection", CUIWindow, {
  __init(this: IDevDebugSpawnSection): void {
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
} as IDevDebugSpawnSection);
