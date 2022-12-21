import { DebugLogger } from "@/mod/scripts/debug_tools/DebugLogger";
import { IOptionsDialog } from "@/mod/scripts/ui/menu/OptionsDialog";

const log: DebugLogger = new DebugLogger("OptionsVideoAdvanced");

export interface IOptionsVideoAdvanced extends XR_CUIWindow {
  scroll_v: XR_CUIScrollView;
  texture_lod_track: XR_CUITrackBar;

  InitControls(x: number, y: number, xml: XR_CScriptXmlInit, handler: IOptionsDialog): void;
}

export const OptionsVideoAdvanced: IOptionsVideoAdvanced = declare_xr_class("OptionsVideoAdvanced", CUIWindow, {
  __init(): void {
    xr_class_super();
    log.info("Init");
  },
  __finalize(): void {
    log.info("Finalize");
  },
  InitControls(x: number, y: number, xml: XR_CScriptXmlInit, handler: IOptionsDialog): void {
    log.info("Init controls");

    let ctl: any;

    this.SetWndPos(new vector2().set(x, y));
    this.SetWndSize(new vector2().set(738, 416));

    this.SetAutoDelete(true);

    // --	this.bk			= xml.InitFrame				("frame_videoadv", this)
    this.scroll_v = xml.InitScrollView("video_adv:scroll_v", this);

    let _st = xml.InitStatic("video_adv:templ_item", this.scroll_v);

    xml.InitStatic("video_adv:cap_vis_dist", _st);
    xml.InitTrackBar("video_adv:track_vis_dist", _st);

    _st = xml.InitStatic("video_adv:templ_item", this.scroll_v);
    xml.InitStatic("video_adv:cap_geometry_lod", _st);
    xml.InitTrackBar("video_adv:track_geometry_lod", _st);

    _st = xml.InitStatic("video_adv:templ_item", this.scroll_v);
    xml.InitStatic("video_adv:cap_texture_lod", _st);
    ctl = xml.InitTrackBar("video_adv:track_texture_lod", _st);
    handler.texture_lod_track = ctl;

    _st = xml.InitStatic("video_adv:templ_item", this.scroll_v);
    xml.InitStatic("video_adv:cap_aniso", _st);
    xml.InitTrackBar("video_adv:track_aniso", _st);

    // --
    _st = xml.InitStatic("video_adv:templ_item", this.scroll_v);
    xml.InitStatic("video_adv:cap_ssample", _st);
    ctl = xml.InitTrackBar("video_adv:track_ssample", _st);
    handler.ss_trb = ctl;
    handler.Register(ctl, "trb_ssample");
    handler.m_preconditions[ctl] = only_3_and_more_mode_invisible;

    ctl = xml.InitComboBox("video_adv:combo_ssample", _st);
    handler.ss_cb = ctl;
    handler.Register(ctl, "cb_ssample");
    handler.m_preconditions[ctl] = only_3_and_more_mode_visible;
    // --
    _st = xml.InitStatic("video_adv:templ_item", this.scroll_v);
    xml.InitStatic("video_adv:cap_detail_density", _st);
    xml.InitTrackBar("video_adv:track_detail_density", _st);

    _st = xml.InitStatic("video_adv:templ_item", this.scroll_v);
    xml.InitStatic("video_adv:cap_r2_sun", _st);
    ctl = xml.InitCheck("video_adv:check_r2_sun", _st);
    handler.m_preconditions[ctl] = only_2_and_more_mode;

    _st = xml.InitStatic("video_adv:templ_item", this.scroll_v);
    xml.InitStatic("video_adv:cap_light_distance", _st);
    ctl = xml.InitTrackBar("video_adv:track_light_distance", _st);
    handler.m_preconditions[ctl] = only_2a_and_more_mode;

    _st = xml.InitStatic("video_adv:templ_item", this.scroll_v);
    xml.InitStatic("video_adv:cap_particles_distance", _st);
    ctl = xml.InitTrackBar("video_adv:track_particles_distance", _st);
    handler.m_preconditions[ctl] = only_2a_and_more_mode;

    _st = xml.InitStatic("video_adv:templ_item", this.scroll_v);
    xml.InitStatic("video_adv:cap_npc_torch", _st);
    xml.InitCheck("video_adv:check_npc_torch", _st);

    // -- r1_detail_textures	r1 only
    _st = xml.InitStatic("video_adv:templ_item", this.scroll_v);
    xml.InitStatic("video_adv:cap_r1_detail_textures", _st);
    ctl = xml.InitCheck("video_adv:check_r1_detail_textures", _st);
    handler.m_preconditions[ctl] = only_1_mode;

    // -- r2_detail_bump			=>r2
    _st = xml.InitStatic("video_adv:templ_item", this.scroll_v);
    xml.InitStatic("video_adv:cap_r2_detail_bump", _st);
    ctl = xml.InitCheck("video_adv:check_r2_detail_bump", _st);
    handler.m_preconditions[ctl] = only_2_and_more_mode;

    // -- r2_steep_parallax		>r2
    _st = xml.InitStatic("video_adv:templ_item", this.scroll_v);
    xml.InitStatic("video_adv:cap_r2_steep_parallax", _st);
    ctl = xml.InitCheck("video_adv:check_r2_steep_parallax", _st);
    handler.m_preconditions[ctl] = only_25_and_more_mode;

    _st = xml.InitStatic("video_adv:templ_item", this.scroll_v);
    xml.InitStatic("video_adv:cap_r2_sun_quality", _st);
    ctl = xml.InitComboBox("video_adv:list_r2_sun_quality", _st);
    handler.m_preconditions[ctl] = only_25_and_more_mode;

    _st = xml.InitStatic("video_adv:templ_item", this.scroll_v);
    xml.InitStatic("video_adv:cap_sun_shafts", _st);
    ctl = xml.InitComboBox("video_adv:combo_sun_shafts", _st);
    handler.m_preconditions[ctl] = only_25_and_more_mode;

    _st = xml.InitStatic("video_adv:templ_item", this.scroll_v);
    _st.SetWndSize(new vector2().set(_st.GetWidth(), 106));
    xml.InitStatic("video_adv:cap_ao", _st);
    ctl = xml.InitTab("video_adv:radio_tab_ao_options", _st);
    handler.m_preconditions[ctl] = only_25_and_more_mode;

    _st = xml.InitStatic("video_adv:templ_item", this.scroll_v);
    xml.InitStatic("video_adv:cap_ssao", _st);
    ctl = xml.InitComboBox("video_adv:combo_ssao", _st);
    handler.m_preconditions[ctl] = only_25_and_more_mode;

    _st = xml.InitStatic("video_adv:templ_item", this.scroll_v);
    xml.InitStatic("video_adv:cap_soft_water", _st);
    ctl = xml.InitCheck("video_adv:check_soft_water", _st);
    handler.m_preconditions[ctl] = only_25_and_more_mode;

    _st = xml.InitStatic("video_adv:templ_item", this.scroll_v);
    xml.InitStatic("video_adv:cap_soft_particles", _st);
    ctl = xml.InitCheck("video_adv:check_soft_particles", _st);
    handler.m_preconditions[ctl] = only_25_and_more_mode;

    _st = xml.InitStatic("video_adv:templ_item", this.scroll_v);
    xml.InitStatic("video_adv:cap_dof", _st);
    ctl = xml.InitCheck("video_adv:check_dof", _st);
    handler.m_preconditions[ctl] = only_25_and_more_mode;

    _st = xml.InitStatic("video_adv:templ_item", this.scroll_v);
    xml.InitStatic("video_adv:cap_volumetric_light", _st);
    ctl = xml.InitCheck("video_adv:check_volumetric_light", _st);
    handler.m_preconditions[ctl] = only_25_and_more_mode;

    // -- r3_dynamic_wet_surfaces	>r25
    _st = xml.InitStatic("video_adv:templ_item", this.scroll_v);
    xml.InitStatic("video_adv:cap_r3_dynamic_wet_surfaces", _st);
    ctl = xml.InitCheck("video_adv:check_r3_dynamic_wet_surfaces", _st);
    handler.m_preconditions[ctl] = only_3_and_more_mode;

    // -- r3_volumetric_smoke		>r25
    _st = xml.InitStatic("video_adv:templ_item", this.scroll_v);
    xml.InitStatic("video_adv:cap_r3_volumetric_smoke", _st);
    ctl = xml.InitCheck("video_adv:check_r3_volumetric_smoke", _st);
    handler.m_preconditions[ctl] = only_3_and_more_mode;

    /**
     * Some section that was never implemented in original game

     --[[
      _st				= xml.InitStatic			("video_adv:templ_item",				this.scroll_v)
    xml.InitStatic								("video_adv:cap_r3_msaa_alphatest",	_st)
    ctl			= xml.InitCheck					("video_adv:check_r3_msaa_alphatest",_st)
    handler.m_preconditions[ctl]		= only_r3_and_r3msaa_more_than_zero

    function only_r3_and_r3msaa_more_than_zero(ctrl: IOptions, _id: number): void {
      const bEnabled = _id >= 4 && _ssample_cb_val > 0;

      ctrl.Enable(bEnabled);
    }

    _st				= xml.InitStatic			("video_adv:templ_item",				this.scroll_v)
    xml.InitStatic								("video_adv:cap_r3_msaa_opt",	_st)
    ctl			= xml.InitCheck					("video_adv:check_r3_msaa_opt",_st)
    handler.m_preconditions[ctl]		= dx_level_le_655361

    function dx_level_le_655361(ctrl: IOptions, _id: number): void {
      const bEnabled: boolean = render_get_dx_level() <= 655361;

      ctrl.Enable(bEnabled);
    }

  ]]*/

    _st = xml.InitStatic("video_adv:templ_item", this.scroll_v);
    xml.InitStatic("video_adv:cap_vsync", _st);
    xml.InitCheck("video_adv:check_vsync", _st);

    _st = xml.InitStatic("video_adv:templ_item", this.scroll_v);
    xml.InitStatic("video_adv:cap_60hz", _st);
    xml.InitCheck("video_adv:check_60hz", _st);

    const btn = xml.Init3tButton("video_adv:btn_to_simply", this);

    handler.Register(btn, "btn_simply_graphic");
  }
} as IOptionsVideoAdvanced);

function only_1_mode(ctrl: IOptionsDialog, _id: number): void {
  const bEnabled: boolean = _id === 0;

  ctrl.Enable(bEnabled);
}

// -- >=R2a
function only_2a_and_more_mode(ctrl: IOptionsDialog, _id: number): void {
  const bEnabled: boolean = _id >= 1;

  ctrl.Enable(bEnabled);
}

// -- >=R2
function only_2_and_more_mode(ctrl: IOptionsDialog, _id: number): void {
  const bEnabled: boolean = _id >= 2;

  ctrl.Enable(bEnabled);
}

// -- >=R2.5
function only_25_and_more_mode(ctrl: IOptionsDialog, _id: number): void {
  const bEnabled: boolean = _id >= 3;

  ctrl.Enable(bEnabled);
}

// -- >=R3
function only_3_and_more_mode(ctrl: IOptionsDialog, _id: number): void {
  const bEnabled: boolean = _id >= 4;

  ctrl.Enable(bEnabled);
}

function only_3_and_more_mode_visible(ctrl: IOptionsDialog, _id: number): void {
  const bEnabled: boolean = _id >= 4;

  ctrl.Enable(bEnabled);
  ctrl.Show(bEnabled);
}

function only_3_and_more_mode_invisible(ctrl: IOptionsDialog, _id: number): void {
  const bEnabled: boolean = _id < 4;

  ctrl.Enable(bEnabled);
  ctrl.Show(bEnabled);
}
