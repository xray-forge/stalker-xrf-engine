import { JSXNode, JSXXML } from "jsx-xml";

export function OptionsVideoAdvanced(): JSXNode {
  return (
    <video_adv>
      <scroll_v
        x="-4"
        y="0"
        width="360"
        height="320"
        right_ident="0"
        left_ident="0"
        top_indent="0"
        bottom_indent="0"
        vert_interval="0"
        always_show_scroll="0"
      />

      <templ_item width="360" height="30" />

      <cap_vis_dist x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_vis_distance
        </text>
      </cap_vis_dist>
      <track_vis_dist x="144" y="6" width="188" height="16" step="0.1">
        <options_item entry="rs_vis_distance" group="mm_opt_video_adv" />
      </track_vis_dist>

      <cap_geometry_lod x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_geometry_lod
        </text>
      </cap_geometry_lod>
      <track_geometry_lod x="144" y="6" width="188" height="16" step="0.1">
        <options_item entry="r__geometry_lod" group="mm_opt_video_adv" />
      </track_geometry_lod>

      <cap_detail_density x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_detail_density
        </text>
      </cap_detail_density>
      <track_detail_density x="144" y="6" width="188" height="16" step="0.02" invert="1">
        <options_item entry="r__detail_density" group="mm_opt_video_adv" />
      </track_detail_density>

      <cap_texture_lod x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_texture_quality
        </text>
      </cap_texture_lod>
      <track_texture_lod x="144" y="6" width="188" height="16" invert="1" step="1" is_integer="1">
        <options_item entry="texture_lod" group="mm_opt_video_adv" depend="restart" />
      </track_texture_lod>

      <cap_aniso x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_anisotropic
        </text>
      </cap_aniso>
      <track_aniso x="144" y="6" width="188" height="16" step="1" is_integer="1">
        <options_item entry="r__tf_aniso" group="mm_opt_video_adv" />
      </track_aniso>

      <cap_ssample x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_supersample
        </text>
      </cap_ssample>
      <track_ssample x="144" y="6" width="188" height="16" step="1" is_integer="1">
        <options_item entry="r__supersample" group="mm_opt_video_adv" depend="vid" />
      </track_ssample>
      <combo_ssample x="144" y="0" width="188" height="20" list_length="4" always_show_scroll="0">
        <options_item entry="r3_msaa" group="mm_opt_video_adv" depend="vid" />
        <list_font r="170" g="170" b="170" font="letterica16" />
        <text_color>
          <e r="170" g="170" b="170" />
          <d r="70" g="70" b="70" />
        </text_color>
      </combo_ssample>

      <cap_r2_sun x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_r2_sun
        </text>
      </cap_r2_sun>
      <check_r2_sun x="133" y="0" width="35" stretch="1" height="29">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="r2_sun" group="mm_opt_video" />
      </check_r2_sun>

      <cap_r1_detail_textures x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_r1_detail_textures
        </text>
      </cap_r1_detail_textures>
      <check_r1_detail_textures x="133" y="0" width="35" stretch="1" height="29">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="r1_detail_textures" group="mm_opt_video" />
      </check_r1_detail_textures>

      <cap_r2_detail_bump x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_r2_detail_bump
        </text>
      </cap_r2_detail_bump>
      <check_r2_detail_bump x="133" y="0" width="35" stretch="1" height="29">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="r2_detail_bump" group="mm_opt_video" />
      </check_r2_detail_bump>

      <cap_r2_steep_parallax x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_r2_steep_parallax
        </text>
      </cap_r2_steep_parallax>
      <check_r2_steep_parallax x="133" y="0" width="35" stretch="1" height="29">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="r2_steep_parallax" group="mm_opt_video" />
      </check_r2_steep_parallax>

      <cap_r2_sun_quality x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_r2_sun_quality
        </text>
      </cap_r2_sun_quality>
      <list_r2_sun_quality x="144" y="0" width="188" height="20" list_length="3">
        <options_item entry="r2_sun_quality" group="mm_opt_video" />
        <list_font r="170" g="170" b="170" font="letterica16" />
        <text_color>
          <e r="170" g="170" b="170" />
          <d r="70" g="70" b="70" />
        </text_color>
      </list_r2_sun_quality>

      <cap_r3_dynamic_wet_surfaces x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_r3_dynamic_wet_surfaces
        </text>
      </cap_r3_dynamic_wet_surfaces>
      <check_r3_dynamic_wet_surfaces x="133" y="0" width="35" stretch="1" height="29">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="r3_dynamic_wet_surfaces" group="mm_opt_video" />
      </check_r3_dynamic_wet_surfaces>

      <cap_r3_volumetric_smoke x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_r3_volumetric_smoke
        </text>
      </cap_r3_volumetric_smoke>
      <check_r3_volumetric_smoke x="133" y="0" width="35" stretch="1" height="29">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="r3_volumetric_smoke" group="mm_opt_video" />
      </check_r3_volumetric_smoke>

      <cap_light_distance x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_light_distance
        </text>
      </cap_light_distance>
      <track_light_distance x="144" y="6" width="188" height="16">
        <options_item entry="r2_slight_fade" group="mm_opt_video_adv" />
      </track_light_distance>

      <cap_npc_torch x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_npc_torch
        </text>
      </cap_npc_torch>
      <check_npc_torch x="133" y="0" width="35" stretch="1" height="29">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="ai_use_torch_dynamic_lights" group="mm_opt_video_adv" />
      </check_npc_torch>

      <cap_particles_distance x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_sun_quality
        </text>
      </cap_particles_distance>
      <track_particles_distance x="144" y="6" width="188" height="16" step="0.1">
        <options_item entry="r2_ls_squality" group="mm_opt_video_adv" />
      </track_particles_distance>

      <cap_vsync x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_vsync
        </text>
      </cap_vsync>
      <check_vsync x="133" y="0" width="35" stretch="1" height="29">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="rs_v_sync" group="mm_opt_video_adv" depend="vid" />
      </check_vsync>

      <cap_60hz x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_60_hz
        </text>
      </cap_60hz>
      <check_60hz x="133" y="0" width="35" stretch="1" height="29">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="rs_refresh_60hz" group="mm_opt_video_adv" depend="vid" />
      </check_60hz>

      <cap_sun_shafts x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_sun_shafts
        </text>
      </cap_sun_shafts>
      <combo_sun_shafts x="144" y="0" width="188" height="20" always_show_scroll="1">
        <options_item entry="r2_sun_shafts" group="mm_opt_video" depend="vid" />
        <list_font r="170" g="170" b="170" font="letterica16" />
        <text_color>
          <e r="170" g="170" b="170" />
          <d r="70" g="70" b="70" />
        </text_color>
      </combo_sun_shafts>

      <cap_ao x="16" y="3" width="108" height="76">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_ssao_text
        </text>
      </cap_ao>
      <radio_tab_ao_options x="144" y="0" width="108" height="101" radio="1">
        <options_item entry="r2_ssao_mode" group="mm_opt_video" depend="restart" />
        <button x="-8" y="0" width="37" height="28" id="disabled" stretch="1">
          <text font="letterica16" vert_align="c" x="29" y="3" align="l">
            st_opt_off
          </text>
          <text_color>
            <e r="170" g="170" b="170" />
            <d r="70" g="70" b="70" />
          </text_color>
        </button>
        <button x="-8" y="25" width="37" height="28" id="default" stretch="1">
          <text font="letterica16" vert_align="c" x="29" y="3" align="l">
            ui_mm_ssao
          </text>
          <text_color>
            <e r="170" g="170" b="170" />
            <d r="70" g="70" b="70" />
          </text_color>
        </button>
        <button x="-8" y="50" width="37" height="28" id="hdao" stretch="1">
          <text font="letterica16" vert_align="c" x="29" y="3" align="l">
            ui_mm_hdao
          </text>
          <text_color>
            <e r="170" g="170" b="170" />
            <d r="70" g="70" b="70" />
          </text_color>
        </button>
        <button x="-8" y="75" width="37" height="28" id="hbao" stretch="1">
          <text font="letterica16" vert_align="c" x="29" y="3" align="l">
            ui_mm_hbao
          </text>
          <text_color>
            <e r="170" g="170" b="170" />
            <d r="70" g="70" b="70" />
          </text_color>
        </button>
      </radio_tab_ao_options>

      <cap_ssao x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_ssao_quality
        </text>
      </cap_ssao>
      <combo_ssao x="144" y="0" width="188" height="20" always_show_scroll="1">
        <options_item entry="r2_ssao" group="mm_opt_video" depend="restart" />
        <list_font r="170" g="170" b="170" font="letterica16" />
        <text_color>
          <e r="170" g="170" b="170" />
          <d r="70" g="70" b="70" />
        </text_color>
      </combo_ssao>

      <cap_soft_water x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_soft_water
        </text>
      </cap_soft_water>
      <check_soft_water x="133" y="0" width="35" stretch="1" height="29">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="r2_soft_water" group="mm_opt_video_adv" depend="vid" />
      </check_soft_water>

      <cap_soft_particles x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_soft_particles
        </text>
      </cap_soft_particles>
      <check_soft_particles x="133" y="0" width="35" stretch="1" height="29">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="r2_soft_particles" group="mm_opt_video_adv" depend="vid" />
      </check_soft_particles>

      <cap_dof x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_dof
        </text>
      </cap_dof>
      <check_dof x="133" y="0" width="35" stretch="1" height="29">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="r2_dof_enable" group="mm_opt_video_adv" depend="vid" />
      </check_dof>

      <cap_volumetric_light x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_volumetric_light
        </text>
      </cap_volumetric_light>
      <check_volumetric_light x="133" y="0" width="35" stretch="1" height="29">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="r2_volumetric_lights" group="mm_opt_video_adv" depend="vid" />
      </check_volumetric_light>

      <cap_r3_msaa_alphatest x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_msaa_alphatest
        </text>
      </cap_r3_msaa_alphatest>
      <combo_r3_msaa_alphatest x="144" y="0" width="188" height="20" always_show_scroll="1">
        <options_item entry="r3_msaa_alphatest" group="mm_opt_video" depend="restart" />
        <list_font r="170" g="170" b="170" font="letterica16" />
        <text_color>
          <e r="170" g="170" b="170" />
          <d r="70" g="70" b="70" />
        </text_color>
      </combo_r3_msaa_alphatest>

      <cap_r3_msaa_opt x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_r3_DX10_1
        </text>
      </cap_r3_msaa_opt>
      <check_r3_msaa_opt x="133" y="0" width="35" stretch="1" height="29">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="r3_msaa_opt" group="mm_opt_video_adv" depend="vid" />
      </check_r3_msaa_opt>

      <cap_r4_tessellation x="25" y="2" width="90" height="21" complex_mode="1">
        <text align="l" font="letterica16" r="95" g="92" b="79">
          ui_mm_r4_enable_tessellation
        </text>
      </cap_r4_tessellation>
      <check_r4_tessellation x="115" y="0" width="30" height="21">
        <options_item entry="r4_enable_tessellation" group="mm_opt_video_adv" depend="vid" />
      </check_r4_tessellation>

      <btn_to_simply x="270" y="322" width="86" height="24" stretch="1">
        <text align="c" font="letterica16">
          ui_mm_simply
        </text>
        <texture>ui_inGame2_button</texture>
        <text_color>
          <e r="210" g="210" b="210" />
        </text_color>
      </btn_to_simply>
    </video_adv>
  );
}
