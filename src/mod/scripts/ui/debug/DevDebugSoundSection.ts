import { DebugLogger } from "@/mod/scripts/debug_tools/DebugLogger";

const base: string = "debug/DevDebugSoundSection.component.xml";
const log: DebugLogger = new DebugLogger("DevDebugSoundSection");

export interface IDevDebugSoundSection extends XR_CUIScriptWnd {
  owner: XR_CUIScriptWnd;

  __init(): void;

  InitControls(): void;
  InitCallBacks(): void;
}

export const DevDebugSoundSection: IDevDebugSoundSection = declare_xr_class("DevDebugSoundSection", CUIWindow, {
  __init(this: IDevDebugSoundSection): void {
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
} as IDevDebugSoundSection);
