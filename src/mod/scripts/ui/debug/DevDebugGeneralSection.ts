import { DebugLogger } from "@/mod/scripts/debug_tools/DebugLogger";

const base: string = "debug/DevDebugGeneralSection.component.xml";
const log: DebugLogger = new DebugLogger("DevDebugGeneralSection");

export interface IDevDebugGeneralSection extends XR_CUIScriptWnd {
  owner: XR_CUIScriptWnd;

  InitControls(): void;
  InitCallBacks(): void;
}

export const DevDebugGeneralSection: IDevDebugGeneralSection = declare_xr_class(
  "DevDebugGeneralSection",
  CUIWindow,
  {
    __init(this: IDevDebugGeneralSection, owner: XR_CUIScriptWnd): void {
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
  } as IDevDebugGeneralSection
);
