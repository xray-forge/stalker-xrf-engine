import { CUIWindow, LuabindClass, vector2, XR_CScriptXmlInit } from "xray16";

import { OptionsDialog } from "@/engine/core/ui/menu/options/OptionsDialog";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class OptionsVideo extends CUIWindow {
  public initialize(x: number, y: number, xml: XR_CScriptXmlInit, owner: OptionsDialog): void {
    this.SetWndPos(new vector2().set(x, y));
    this.SetWndSize(new vector2().set(738, 416));
    this.SetAutoDelete(true);

    // --	this.bk = xml.InitFrame			("frame", this)

    xml.InitStatic("tab_video:cap_fullscreen", this);
    xml.InitCheck("tab_video:check_fullscreen", this);

    xml.InitStatic("tab_video:cap_brightness", this);
    xml.InitTrackBar("tab_video:track_brightness", this);

    xml.InitStatic("tab_video:cap_contrast", this);
    xml.InitTrackBar("tab_video:track_contrast", this);

    xml.InitStatic("tab_video:cap_gamma", this);
    xml.InitTrackBar("tab_video:track_gamma", this);

    xml.InitStatic("tab_video:cap_resolution", this);
    xml.InitComboBox("tab_video:list_resolution", this);

    xml.InitStatic("tab_video:cap_preset", this);
    owner.combo_preset = xml.InitComboBox("tab_video:list_presets", this);
    owner.Register(owner.combo_preset, "combo_preset");

    xml.InitStatic("tab_video:cap_renderer", this);
    owner.combo_renderer = xml.InitComboBox("tab_video:list_renderer", this);

    owner.Register(owner.combo_renderer, "combo_renderer");
    owner.Register(xml.Init3tButton("tab_video:btn_advanced", this), "btn_advanced_graphic");
  }
}
