import { CUIWindow, LuabindClass, vector2, XR_CScriptXmlInit, XR_CUIScrollView, XR_CUIWindow } from "xray16";

import { OptionsDialog } from "@/engine/core/ui/menu/options/OptionsDialog";
import { EGameRenderer } from "@/engine/core/ui/menu/options/types";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class OptionsVideoAdvanced extends CUIWindow {
  public scrollView!: XR_CUIScrollView;

  public initialize(x: number, y: number, xml: XR_CScriptXmlInit, owner: OptionsDialog): void {
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
    owner.textureLodTrackBar = xml.InitTrackBar("video_adv:track_texture_lod", textureLod);

    const anisotropicFiltering = xml.InitStatic("video_adv:templ_item", this.scrollView);

    xml.InitStatic("video_adv:cap_aniso", anisotropicFiltering);
    xml.InitTrackBar("video_adv:track_aniso", anisotropicFiltering);

    const sSampling = xml.InitStatic("video_adv:templ_item", this.scrollView);

    xml.InitStatic("video_adv:cap_ssample", sSampling);

    const sSamplingTrack = xml.InitTrackBar("video_adv:track_ssample", sSampling);

    owner.sSamplingTrackBar = sSamplingTrack;
    owner.Register(sSamplingTrack, "trb_ssample");
    owner.preconditions.set(sSamplingTrack, only3andMoreModeInvisible);

    const sSamplingComboBox = xml.InitComboBox("video_adv:combo_ssample", sSampling);

    owner.sSamplingComboBox = sSamplingComboBox;
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

    // -- r3_volumetric_smoke		>r25
    const volumetricSmoke = xml.InitStatic("video_adv:templ_item", this.scrollView);

    xml.InitStatic("video_adv:cap_r3_volumetric_smoke", volumetricSmoke);

    const volumetricSmokeCheck = xml.InitCheck("video_adv:check_r3_volumetric_smoke", volumetricSmoke);

    owner.preconditions.set(volumetricSmokeCheck, only3andMoreMode);

    /**
     * Some section that was never implemented in original game

     --[[
     _st				= xml.InitStatic			("video_adv:templ_item",				this.scroll_v)
     xml.InitStatic								("video_adv:cap_r3_msaa_alphatest",	_st)
     ctl			= xml.InitCheck					("video_adv:check_r3_msaa_alphatest",_st)
     handler.m_preconditions[ctl]		= only_r3_and_r3msaa_more_than_zero

     function only_r3_and_r3msaa_more_than_zero(ctrl: IOptions, _id: EGameRenderer): void {
      const bEnabled = _id >= 4 && _ssample_cb_val > 0;

      ctrl.Enable(bEnabled);
    }

     _st				= xml.InitStatic			("video_adv:templ_item",				this.scroll_v)
     xml.InitStatic								("video_adv:cap_r3_msaa_opt",	_st)
     ctl			= xml.InitCheck					("video_adv:check_r3_msaa_opt",_st)
     handler.m_preconditions[ctl]		= dx_level_le_655361

     function dx_level_le_655361(ctrl: IOptions, _id: EGameRenderer): void {
      const bEnabled: boolean = render_get_dx_level() <= 655361;

      ctrl.Enable(bEnabled);
    }

     ]]*/

    const vSyncSetting = xml.InitStatic("video_adv:templ_item", this.scrollView);

    xml.InitStatic("video_adv:cap_vsync", vSyncSetting);
    xml.InitCheck("video_adv:check_vsync", vSyncSetting);

    const only60HZSetting = xml.InitStatic("video_adv:templ_item", this.scrollView);

    xml.InitStatic("video_adv:cap_60hz", only60HZSetting);
    xml.InitCheck("video_adv:check_60hz", only60HZSetting);

    owner.Register(xml.Init3tButton("video_adv:btn_to_simply", this), "btn_simply_graphic");
  }
}

function only1mode(control: XR_CUIWindow, id: EGameRenderer): void {
  control.Enable(id === EGameRenderer.R1);
}

// -- >=R2a
function only2aAndMoreMode(control: XR_CUIWindow, id: EGameRenderer): void {
  control.Enable(id >= EGameRenderer.R2A);
}

// -- >=R2
function only2andMoreMode(control: XR_CUIWindow, id: EGameRenderer): void {
  control.Enable(id >= EGameRenderer.R2);
}

// -- >=R2.5
function only25andMoreMode(control: XR_CUIWindow, id: EGameRenderer): void {
  control.Enable(id >= EGameRenderer.R25);
}

// -- >=R3
function only3andMoreMode(control: XR_CUIWindow, id: EGameRenderer): void {
  control.Enable(id >= EGameRenderer.R3);
}

function only3andMoreModeVisible(control: XR_CUIWindow, id: EGameRenderer): void {
  const isEnabled: boolean = id >= EGameRenderer.R3;

  control.Enable(isEnabled);
  control.Show(isEnabled);
}

function only3andMoreModeInvisible(control: XR_CUIWindow, id: EGameRenderer): void {
  const isEnabled: boolean = id < EGameRenderer.R3;

  control.Enable(isEnabled);
  control.Show(isEnabled);
}
