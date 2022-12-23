import { LuaLogger } from "@/mod/scripts/debug_tools/LuaLogger";
import { IOptionsDialog } from "@/mod/scripts/ui/menu/OptionsDialog";

const log: LuaLogger = new LuaLogger("OptionsGameplay");

export interface IOptionsGameplay extends XR_CUIWindow {
  InitControls(x: number, y: number, xml: XR_CScriptXmlInit, handler: IOptionsDialog): void;
}

export const OptionsGameplay: IOptionsGameplay = declare_xr_class("OptionsGameplay", CUIWindow, {
  __init(): void {
    xr_class_super();
    log.info("Init");
  },
  __finalize(): void {
    log.info("Finalize");
  },
  InitControls(x: number, y: number, xml: XR_CScriptXmlInit, handler: IOptionsDialog): void {
    log.info("Init controls");

    this.SetWndPos(new vector2().set(x, y));
    this.SetWndSize(new vector2().set(738, 416));
    this.SetAutoDelete(true);

    // -- this.bk = xml.InitFrame("frame_gameplay", this)

    xml.InitStatic("tab_gameplay:cap_difficulty", this);
    xml.InitStatic("tab_gameplay:cap_check_tips", this);
    xml.InitStatic("tab_gameplay:cap_check_crosshair", this);
    xml.InitStatic("tab_gameplay:cap_check_dyn_crosshair", this);
    xml.InitStatic("tab_gameplay:cap_check_show_weapon", this);
    xml.InitStatic("tab_gameplay:cap_check_dist", this);
    xml.InitStatic("tab_gameplay:cap_check_important_save", this);
    xml.InitStatic("tab_gameplay:cap_check_crouch_toggle", this);
    xml.InitStatic("tab_gameplay:cap_check_hud_draw", this);

    xml.InitCheck("tab_gameplay:check_tips", this);
    xml.InitCheck("tab_gameplay:check_crosshair", this);
    xml.InitCheck("tab_gameplay:check_dyn_crosshair", this);
    xml.InitCheck("tab_gameplay:check_show_weapon", this);
    xml.InitCheck("tab_gameplay:check_dist", this);
    xml.InitCheck("tab_gameplay:check_important_save", this);
    xml.InitCheck("tab_gameplay:check_crouch_toggle", this);
    xml.InitCheck("tab_gameplay:check_hud_draw", this);
    xml.InitComboBox("tab_gameplay:list_difficulty", this);

    const btn: XR_CUI3tButton = xml.Init3tButton("tab_gameplay:btn_check_updates", this);

    handler.Register(btn, "btn_check_updates");
  }
} as IOptionsGameplay);
