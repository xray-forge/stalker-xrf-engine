import { DebugLogger } from "@/mod/scripts/debug_tools/DebugLogger";
import { IOptionsDialog } from "@/mod/scripts/ui/menu/OptionsDialog";

const log: DebugLogger = new DebugLogger("OptionsVideo");

export interface IOptionsVideo extends XR_CUIWindow {
  InitControls(x: number, y: number, xml: XR_CScriptXmlInit, handler: IOptionsDialog): void;
}

export const OptionsVideo: IOptionsVideo = declare_xr_class("OptionsVideo", CUIWindow, {
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
    handler.combo_preset = xml.InitComboBox("tab_video:list_presets", this);
    handler.Register(handler.combo_preset, "combo_preset");

    xml.InitStatic("tab_video:cap_renderer", this);
    handler.combo_renderer = xml.InitComboBox("tab_video:list_renderer", this);

    handler.Register(handler.combo_renderer, "combo_renderer");
    handler.Register(xml.Init3tButton("tab_video:btn_advanced", this), "btn_advanced_graphic");
  }
} as IOptionsVideo);
