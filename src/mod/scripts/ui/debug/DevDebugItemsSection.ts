import { DebugLogger } from "@/mod/scripts/debug_tools/DebugLogger";

const base: string = "debug/DevDebugItemsSection.component.xml";
const log: DebugLogger = new DebugLogger("DevDebugItemsSection");

export interface IDevDebugItemsSection extends XR_CUIScriptWnd {
  owner: XR_CUIScriptWnd;

  InitControls(): void;
  InitCallBacks(): void;
}

export const DevDebugItemsSection: IDevDebugItemsSection = declare_xr_class("DevDebugItemsSection", CUIWindow, {
  __init(this: IDevDebugItemsSection, owner: XR_CUIScriptWnd): void {
    log.info("Init");

    CUIWindow.__init(this);

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

    xml.ParseFile(base);
    xml.InitStatic("background", this);
  },
  InitCallBacks(): void {
    log.info("Init callbacks");
  }
} as IDevDebugItemsSection);
