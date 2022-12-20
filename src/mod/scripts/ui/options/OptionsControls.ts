import { DebugLogger } from "@/mod/scripts/debug_tools/DebugLogger";
import { IOptions } from "@/mod/scripts/ui/options/Options";

const log: DebugLogger = new DebugLogger("OptionsControls");

export interface IOptionsControls extends XR_CUIWindow {
  InitControls(x: number, y: number, xml: XR_CScriptXmlInit, handler: IOptions): void;
}

export const OptionsControls: IOptionsControls = declare_xr_class("OptionsControls", CUIWindow, {
  __init(): void {
    xr_class_super();
    log.info("Init");
  },
  __finalize(): void {
    log.info("Finalize");
  },
  InitControls(x: number, y: number, xml: XR_CScriptXmlInit, handler: IOptions): void {
    log.info("Init controls");

    this.SetWndPos(new vector2().set(x, y));
    this.SetWndSize(new vector2().set(738, 416));

    this.SetAutoDelete(true);

    // -- this.bk = xml.InitFrame("frame", this)

    xml.InitStatic("tab_controls:cap_mousesens", this);
    xml.InitFrameLine("tab_controls:cap_keyboardsetup", this);
    xml.InitFrameLine("tab_controls:cap_keyboardsetup", this);
    xml.InitTrackBar("tab_controls:track_mousesens", this);
    xml.InitStatic("tab_controls:cap_check_mouseinvert", this);
    xml.InitCheck("tab_controls:check_mouseinvert", this);
    xml.InitKeyBinding("tab_controls:key_binding", this);

    const btn: XR_CUI3tButton = xml.Init3tButton("tab_controls:btn_default", this);

    handler.Register(btn, "btn_keyb_default");
  }
} as IOptionsControls);
