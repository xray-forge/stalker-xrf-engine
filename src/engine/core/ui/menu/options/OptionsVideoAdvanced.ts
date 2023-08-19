import { CScriptXmlInit, CUIScrollView, CUIStatic, CUIWindow, LuabindClass, vector2 } from "xray16";

import { OptionsDialog } from "@/engine/core/ui/menu/options/OptionsDialog";
import { EGameRenderer } from "@/engine/core/ui/menu/options/types";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class OptionsVideoAdvanced extends CUIWindow {
  public scrollView!: CUIScrollView;

  public initialize(x: number, y: number, xml: CScriptXmlInit, owner: OptionsDialog): void {
    this.SetWndPos(new vector2().set(x, y));
    this.SetWndSize(new vector2().set(738, 416));

    this.SetAutoDelete(true);

    this.scrollView = xml.InitScrollView("video_adv:scroll_v", this);

    const visibilityDistance = xml.InitStatic("video_adv:templ_item", this.scrollView);

    xml.InitStatic("video_adv:cap_vis_dist", visibilityDistance);
    xml.InitTrackBar("video_adv:track_vis_dist", visibilityDistance);

    const geometryLod = xml.InitStatic("video_adv:templ_item", this.scrollView);

    xml.InitStatic("video_adv:cap_geometry_lod", geometryLod);
    xml.InitTrackBar("video_adv:track_geometry_lod", geometryLod);

    const textureLod = xml.InitStatic("video_adv:templ_item", this.scrollView);

    xml.InitStatic("video_adv:cap_texture_lod", textureLod);
    owner.uiTextureLodTrackBar = xml.InitTrackBar("video_adv:track_texture_lod", textureLod);

    const anisotropicFiltering = xml.InitStatic("video_adv:templ_item", this.scrollView);

    xml.InitStatic("video_adv:cap_aniso", anisotropicFiltering);
    xml.InitTrackBar("video_adv:track_aniso", anisotropicFiltering);

    const sSampling = xml.InitStatic("video_adv:templ_item", this.scrollView);

    xml.InitStatic("video_adv:cap_ssample", sSampling);

    const sSamplingTrack = xml.InitTrackBar("video_adv:track_ssample", sSampling);

    owner.uiSSamplingTrackBar = sSamplingTrack;
    owner.Register(sSamplingTrack, "trb_ssample");
    owner.preconditions.set(sSamplingTrack, only3andMoreModeInvisible);

    const sSamplingComboBox = xml.InitComboBox("video_adv:combo_ssample", sSampling);

    owner.uiSSamplingComboBox = sSamplingComboBox;
    owner.Register(sSamplingComboBox, "cb_ssample");
    owner.preconditions.set(sSamplingComboBox, only3andMoreModeVisible);

    const detailDensity = xml.InitStatic("video_adv:templ_item", this.scrollView);

    xml.InitStatic("video_adv:cap_detail_density", detailDensity);
    xml.InitTrackBar("video_adv:track_detail_density", detailDensity);

    const r2Sun = xml.InitStatic("video_adv:templ_item", this.scrollView);

    xml.InitStatic("video_adv:cap_r2_sun", r2Sun);

    const r2SunCheck = xml.InitCheck("video_adv:check_r2_sun", r2Sun);

    owner.preconditions.set(r2SunCheck, only2andMoreMode);

    const lightDistance = xml.InitStatic("video_adv:templ_item", this.scrollView);

    xml.InitStatic("video_adv:cap_light_distance", lightDistance);

    const lightDistanceTrack = xml.InitTrackBar("video_adv:track_light_distance", lightDistance);

    owner.preconditions.set(lightDistanceTrack, only2aAndMoreMode);

    const particlesDistance = xml.InitStatic("video_adv:templ_item", this.scrollView);

    xml.InitStatic("video_adv:cap_particles_distance", particlesDistance);

    const particlesDistanceTrackBar = xml.InitTrackBar("video_adv:track_particles_distance", particlesDistance);

    owner.preconditions.set(particlesDistanceTrackBar, only2aAndMoreMode);

    /*
     *  _st = xml:InitStatic("video_adv:templ_item", nil)
     *  xml:InitStatic("video_adv:cap_r2_smap_size", _st)
     *  ctl = xml:InitComboBox("video_adv:list_r2_smap_size", _st)
     *  table.insert(handler.m_preconditions, {func=all_modes, control=_st})
     */

    const npcTorch = xml.InitStatic("video_adv:templ_item", this.scrollView);

    xml.InitStatic("video_adv:cap_npc_torch", npcTorch);
    xml.InitCheck("video_adv:check_npc_torch", npcTorch);

    // -- r1_detail_textures	r1 only
    const detailedTextures = xml.InitStatic("video_adv:templ_item", this.scrollView);

    xml.InitStatic("video_adv:cap_r1_detail_textures", detailedTextures);

    const detailedTexturesCheck = xml.InitCheck("video_adv:check_r1_detail_textures", detailedTextures);

    owner.preconditions.set(detailedTexturesCheck, only1mode);

    // -- r2_detail_bump			=>r2
    const detailedBump = xml.InitStatic("video_adv:templ_item", this.scrollView);

    xml.InitStatic("video_adv:cap_r2_detail_bump", detailedBump);

    const detailedBumpCheck = xml.InitCheck("video_adv:check_r2_detail_bump", detailedBump);

    owner.preconditions.set(detailedBumpCheck, only2andMoreMode);

    // -- r2_steep_parallax		>r2
    const steepParallax = xml.InitStatic("video_adv:templ_item", this.scrollView);

    xml.InitStatic("video_adv:cap_r2_steep_parallax", steepParallax);

    const steepParallaxCheck = xml.InitCheck("video_adv:check_r2_steep_parallax", steepParallax);

    owner.preconditions.set(steepParallaxCheck, only25andMoreMode);

    const sunQuality = xml.InitStatic("video_adv:templ_item", this.scrollView);

    xml.InitStatic("video_adv:cap_r2_sun_quality", sunQuality);

    const sunQualitySelect = xml.InitComboBox("video_adv:list_r2_sun_quality", sunQuality);

    owner.preconditions.set(sunQualitySelect, only25andMoreMode);

    const sunShafts = xml.InitStatic("video_adv:templ_item", this.scrollView);

    xml.InitStatic("video_adv:cap_sun_shafts", sunShafts);

    const sunShaftsSelect = xml.InitComboBox("video_adv:combo_sun_shafts", sunShafts);

    owner.preconditions.set(sunShaftsSelect, only25andMoreMode);

    const ao = xml.InitStatic("video_adv:templ_item", this.scrollView);

    ao.SetWndSize(new vector2().set(ao.GetWidth(), 106));
    xml.InitStatic("video_adv:cap_ao", ao);

    const aoTab = xml.InitTab("video_adv:radio_tab_ao_options", ao);

    owner.preconditions.set(aoTab, only25andMoreMode);

    const ssao = xml.InitStatic("video_adv:templ_item", this.scrollView);

    xml.InitStatic("video_adv:cap_ssao", ssao);

    const ssaoSelect = xml.InitComboBox("video_adv:combo_ssao", ssao);

    owner.preconditions.set(ssaoSelect, only25andMoreMode);

    const softWater = xml.InitStatic("video_adv:templ_item", this.scrollView);

    xml.InitStatic("video_adv:cap_soft_water", softWater);

    const softWaterCheck = xml.InitCheck("video_adv:check_soft_water", softWater);

    owner.preconditions.set(softWaterCheck, only25andMoreMode);

    const softParticles = xml.InitStatic("video_adv:templ_item", this.scrollView);

    xml.InitStatic("video_adv:cap_soft_particles", softParticles);

    const softParticlesCheck = xml.InitCheck("video_adv:check_soft_particles", softParticles);

    owner.preconditions.set(softParticlesCheck, only25andMoreMode);

    const dof = xml.InitStatic("video_adv:templ_item", this.scrollView);

    xml.InitStatic("video_adv:cap_dof", dof);

    const dofCheck = xml.InitCheck("video_adv:check_dof", dof);

    owner.preconditions.set(dofCheck, only25andMoreMode);

    const volumetricLight = xml.InitStatic("video_adv:templ_item", this.scrollView);

    xml.InitStatic("video_adv:cap_volumetric_light", volumetricLight);

    const volumetricLightCheck = xml.InitCheck("video_adv:check_volumetric_light", volumetricLight);

    owner.preconditions.set(volumetricLightCheck, only25andMoreMode);

    // -- r3_dynamic_wet_surfaces	>r25
    const wetSurfaces = xml.InitStatic("video_adv:templ_item", this.scrollView);

    xml.InitStatic("video_adv:cap_r3_dynamic_wet_surfaces", wetSurfaces);

    const wetSurfacesCheck = xml.InitCheck("video_adv:check_r3_dynamic_wet_surfaces", wetSurfaces);

    owner.preconditions.set(wetSurfacesCheck, only3andMoreMode);

    /*
     *
     *  _st = xml:InitStatic("video_adv:templ_item", nil)
     *  xml:InitStatic("video_adv:cap_r3_dynamic_wet_surfaces_opt", _st)
     *  ctl = xml:InitCheck ("video_adv:check_r3_dynamic_wet_surfaces_opt", _st)
     *  table.insert(handler.m_preconditions, {func=mode_ge_3, control=_st})
     *
     *  _st = xml:InitStatic("video_adv:templ_item", nil)
     *  xml:InitStatic("video_adv:cap_r3_dynamic_wet_surfaces_near", _st)
     *  ctl = xml:InitTrackBar("video_adv:track_r3_dynamic_wet_surfaces_near", _st)
     *  handler.track_r3_dyn_wet_surf_near = ctl
     *  handler:Register(ctl, "track_r3_dyn_wet_surf_near")
     *  table.insert(handler.m_preconditions, {func=mode_ge_3, control=_st})
     */

    // -- r3_volumetric_smoke		>r25
    const volumetricSmoke = xml.InitStatic("video_adv:templ_item", this.scrollView);

    xml.InitStatic("video_adv:cap_r3_volumetric_smoke", volumetricSmoke);

    const volumetricSmokeCheck = xml.InitCheck("video_adv:check_r3_volumetric_smoke", volumetricSmoke);

    owner.preconditions.set(volumetricSmokeCheck, only3andMoreMode);

    /*
     *  _st = xml:InitStatic("video_adv:templ_item", nil)
     *  xml:InitStatic("video_adv:cap_r3_msaa_opt", _st)
     *  ctl = xml:InitCheck("video_adv:check_r3_msaa_opt", _st)
     *  table.insert(handler.m_preconditions, {func=mode_ge_3, control=_st})
     */

    /*
     * -- r4_enable_tessellation    only r4
     *  _st = xml:InitStatic("video_adv:templ_item", nil)
     *  xml:InitStatic("video_adv:cap_r4_tessellation", _st)
     *  ctl = xml:InitCheck("video_adv:check_r4_tessellation", _st)
     *  table.insert(handler.m_preconditions, {func=mode_4, control=_st})
     * ---------
     */

    const vSyncSetting: CUIStatic = xml.InitStatic("video_adv:templ_item", this.scrollView);

    xml.InitStatic("video_adv:cap_vsync", vSyncSetting);
    xml.InitCheck("video_adv:check_vsync", vSyncSetting);

    const fpsLimitInGame: CUIStatic = xml.InitStatic("video_adv:templ_item", this.scrollView);

    xml.InitStatic("video_adv:cap_fps_limit", fpsLimitInGame);
    xml.InitTrackBar("video_adv:track_fps_limit", fpsLimitInGame);

    const fpsLimitInMenu: CUIStatic = xml.InitStatic("video_adv:templ_item", this.scrollView);

    xml.InitStatic("video_adv:cap_fps_limit_in_menu", fpsLimitInMenu);
    xml.InitTrackBar("video_adv:track_fps_limit_in_menu", fpsLimitInMenu);

    /*
     *  _st = xml:InitStatic("video_adv:templ_item", nil)
     *  xml:InitStatic("video_adv:cap_always_active", _st)
     *  xml:InitCheck("video_adv:check_always_active", _st)
     *  table.insert(handler.m_preconditions, {func=all_modes, control=_st})
     */

    owner.Register(xml.Init3tButton("video_adv:btn_to_simply", this), "btn_simply_graphic");
  }
}

/**
 * todo;
 */
function only1mode(control: CUIWindow, id: EGameRenderer): void {
  control.Enable(id === EGameRenderer.R1);
}

// -- >=R2a
/**
 * todo;
 */
function only2aAndMoreMode(control: CUIWindow, id: EGameRenderer): void {
  control.Enable(id >= EGameRenderer.R2A);
}

// -- >=R2
/**
 * todo;
 */
function only2andMoreMode(control: CUIWindow, id: EGameRenderer): void {
  control.Enable(id >= EGameRenderer.R2);
}

// -- >=R2.5
/**
 * todo;
 */
function only25andMoreMode(control: CUIWindow, id: EGameRenderer): void {
  control.Enable(id >= EGameRenderer.R25);
}

// -- >=R3
/**
 * todo;
 */
function only3andMoreMode(control: CUIWindow, id: EGameRenderer): void {
  control.Enable(id >= EGameRenderer.R3);
}

/**
 * todo;
 */
function only3andMoreModeVisible(control: CUIWindow, id: EGameRenderer): void {
  const isEnabled: boolean = id >= EGameRenderer.R3;

  control.Enable(isEnabled);
  control.Show(isEnabled);
}

/**
 * todo;
 */
function only3andMoreModeInvisible(control: CUIWindow, id: EGameRenderer): void {
  const isEnabled: boolean = id < EGameRenderer.R3;

  control.Enable(isEnabled);
  control.Show(isEnabled);
}

/**
 * todo;
 */
function only4(control: CUIWindow, id: EGameRenderer) {
  return id === EGameRenderer.R4;
}

/**
 * todo;
 */
function only4andMore(control: CUIWindow, id: EGameRenderer) {
  return id >= EGameRenderer.R4;
}
