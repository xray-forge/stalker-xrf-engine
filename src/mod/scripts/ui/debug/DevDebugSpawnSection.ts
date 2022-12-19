import { DebugLogger } from "@/mod/scripts/debug_tools/DebugLogger";

const base: string = "debug/DevDebugSpawnSection.component.xml";
const log: DebugLogger = new DebugLogger("DevDebugSpawnSection");

export interface IDevDebugSpawnSection extends XR_CUIScriptWnd {
  owner: XR_CUIScriptWnd;

  InitControls(): void;
  InitCallBacks(): void;
}

export const DevDebugSpawnSection: IDevDebugSpawnSection = declare_xr_class("DevDebugSpawnSection", CUIWindow, {
  __init(this: IDevDebugSpawnSection): void {
    log.info("Init");
    CUIWindow.__init(this);

    this.InitControls();
    this.InitCallBacks();
  },
  __finalize(): void {
    log.info("Finalize");
  },
  InitControls(): void {
    log.info("Init controls");

    const xml: XR_CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(base);
    xml.InitStatic("background", this);
  },
  InitCallBacks(): void {
    log.info("Init callbacks");
  }
} as IDevDebugSpawnSection);
