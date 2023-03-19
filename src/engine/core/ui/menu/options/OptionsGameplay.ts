import { CUIWindow, LuabindClass, vector2, XR_CScriptXmlInit } from "xray16";

import { OptionsDialog } from "@/engine/core/ui/menu/options/OptionsDialog";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class OptionsGameplay extends CUIWindow {
  public initialize(x: number, y: number, xml: XR_CScriptXmlInit, owner: OptionsDialog): void {
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

    owner.Register(xml.Init3tButton("tab_gameplay:btn_check_updates", this), "btn_check_updates");
  }
}
