import { CScriptXmlInit, CUIWindow, XR_CScriptXmlInit, XR_CUIScriptWnd } from "xray16";

import { LuaLogger } from "@/mod/scripts/utils/logging";
import { resolveXmlFormPath } from "@/mod/scripts/utils/ui";

const base: string = "menu\\debug\\DevDebugPositionSection.component";
const logger: LuaLogger = new LuaLogger("DevDebugPositionSection");

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
      CUIWindow.__init(this);

      this.InitControls();
      this.InitCallBacks();
    },
    InitControls(): void {
      const xml: XR_CScriptXmlInit = new CScriptXmlInit();

      xml.ParseFile(resolveXmlFormPath(base));
      xml.InitStatic("background", this);
    },
    InitCallBacks(): void {
      logger.info("Init callbacks");
    }
  } as IDevDebugPositionSection
);
