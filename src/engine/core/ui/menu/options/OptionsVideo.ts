import { CScriptXmlInit, CUIWindow, LuabindClass } from "xray16";

import { Options } from "@/engine/core/ui/menu/options/Options";
import { create2dVector } from "@/engine/core/utils/vector";

/**
 * UI component of video settings tab in options.
 */
@LuabindClass()
export class OptionsVideo extends CUIWindow {
  public constructor() {
    super();
    this.SetWindowName(this.__name);
  }

  public initialize(x: number, y: number, xml: CScriptXmlInit, owner: Options): void {
    this.SetWndPos(create2dVector(x, y));
    this.SetWndSize(create2dVector(738, 416));
    this.SetAutoDelete(true);

    // --	this.bk = xml.InitFrame			("frame", this)

    xml.InitStatic("tab_video:cap_brightness", this);
    xml.InitTrackBar("tab_video:track_brightness", this);

    xml.InitStatic("tab_video:cap_contrast", this);
    xml.InitTrackBar("tab_video:track_contrast", this);

    xml.InitStatic("tab_video:cap_gamma", this);
    xml.InitTrackBar("tab_video:track_gamma", this);

    xml.InitStatic("tab_video:cap_window_mode", this);
    xml.InitComboBox("tab_video:list_window_mode", this);

    xml.InitStatic("tab_video:cap_resolution", this);
    xml.InitComboBox("tab_video:list_resolution", this);

    xml.InitStatic("tab_video:cap_preset", this);
    owner.uiCurrentPresetSelect = xml.InitComboBox("tab_video:list_presets", this);
    owner.Register(owner.uiCurrentPresetSelect, "combo_preset");

    xml.InitStatic("tab_video:cap_renderer", this);
    owner.uiCurrentRendererSelect = xml.InitComboBox("tab_video:list_renderer", this);

    xml.InitStatic("tab_video:cap_color_grading_preset", this);
    owner.uiShaderGradingSelect = xml.InitComboBox("tab_video:list_color_grading_presets", this);
    owner.Register(owner.uiShaderGradingSelect, "combo_color_grading_preset");

    xml.InitStatic("tab_video:cap_shader_preset", this);
    owner.uiShaderPresetSelect = xml.InitComboBox("tab_video:list_shader_presets", this);
    owner.Register(owner.uiShaderPresetSelect, "combo_shader_preset");

    owner.Register(owner.uiCurrentRendererSelect, "combo_renderer");
    owner.Register(xml.Init3tButton("tab_video:btn_advanced", this), "btn_advanced_graphic");

    // Do not enable grading when shader is not selected.
    owner.uiShaderGradingSelect.Enable(owner.uiShaderPresetSelect.CurrentID() !== 0);
  }
}
