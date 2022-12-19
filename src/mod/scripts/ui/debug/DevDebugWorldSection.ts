import { DebugLogger } from "@/mod/scripts/debug_tools/DebugLogger";

const base: string = "debug/DevDebugWorldSection.component.xml";
const log: DebugLogger = new DebugLogger("DevDebugWorldSection");

export interface IDevDebugWorldSection extends XR_CUIScriptWnd {
  owner: XR_CUIScriptWnd;

  __init(): void;

  InitControls(): void;
  InitCallBacks(): void;
}

export const DevDebugWorldSection: IDevDebugWorldSection = declare_xr_class(
  "DevDebugWorldSection",
  CUIWindow,
  {
    __init(this: IDevDebugWorldSection): void {
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
  } as IDevDebugWorldSection
);
