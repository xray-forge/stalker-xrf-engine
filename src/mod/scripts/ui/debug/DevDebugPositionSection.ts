import { DebugLogger } from "@/mod/scripts/debug_tools/DebugLogger";

const base: string = "debug/DevDebugPositionSection.component.xml";
const log: DebugLogger = new DebugLogger("DevDebugPositionSection");

export interface IDevDebugPositionSection extends XR_CUIScriptWnd {
  owner: XR_CUIScriptWnd;

  InitControls(): void;
  InitCallBacks(): void;
}

export const DevDebugPositionSection: IDevDebugPositionSection = declare_xr_class(
  "DevDebugPositionSection",
  CUIWindow,
  {
    __init(this: IDevDebugPositionSection): void {
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
  } as IDevDebugPositionSection
);
