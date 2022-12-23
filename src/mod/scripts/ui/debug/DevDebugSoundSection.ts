import { DebugLogger } from "@/mod/scripts/debug_tools/DebugLogger";
import { resolveXmlFormPath } from "@/mod/scripts/utils/rendering";

const base: string = "debug\\DevDebugSoundSection.component";
const log: DebugLogger = new DebugLogger("DevDebugSoundSection");

export interface IDevDebugSoundSection extends XR_CUIScriptWnd {
  owner: XR_CUIScriptWnd;

  InitControls(): void;
  InitCallBacks(): void;
}

export const DevDebugSoundSection: IDevDebugSoundSection = declare_xr_class("DevDebugSoundSection", CUIWindow, {
  __init(this: IDevDebugSoundSection): void {
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
} as IDevDebugSoundSection);
