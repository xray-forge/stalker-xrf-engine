import { JSXNode, JSXXML } from "jsx-xml";

export function OptionsVideo(): JSXNode {
  return (
    <tab_video>
      <cap_renderer x="12" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_renderer
        </text>
      </cap_renderer>
      <list_renderer x="140" y="5" width="188" height="20" list_length="5" always_show_scroll="0">
        <options_item entry="renderer" group="mm_opt_video" depend="restart" />
        <list_font r="170" g="170" b="170" font="letterica16" />
        <text_color>
          <e r="170" g="170" b="170" />
          <d r="70" g="70" b="70" />
        </text_color>
      </list_renderer>

      <cap_preset x="12" y="33" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_quality_presets
        </text>
      </cap_preset>
      <list_presets x="140" y="35" width="188" height="20" list_length="5" always_show_scroll="0">
        <options_item entry="_preset" group="mm_opt_video_preset" depend="restart" />
        <list_font r="170" g="170" b="170" font="letterica16" />
        <text_color>
          <e r="170" g="170" b="170" />
          <d r="70" g="70" b="70" />
        </text_color>
      </list_presets>

      <cap_resolution x="12" y="63" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_resolution
        </text>
      </cap_resolution>
      <list_resolution x="140" y="65" width="188" height="20" list_length="7" always_show_scroll="1">
        <options_item entry="vid_mode" group="mm_opt_video" depend="vid" />
        <list_font r="170" g="170" b="170" font="letterica16" />
        <text_color>
          <e r="170" g="170" b="170" />
          <d r="70" g="70" b="70" />
        </text_color>
      </list_resolution>

      <cap_gamma x="12" y="93" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_gamma
        </text>
      </cap_gamma>
      <track_gamma x="140" y="97" width="188" height="16">
        <options_item entry="rs_c_gamma" group="mm_opt_video" depend="runtime" />
      </track_gamma>

      <cap_contrast x="12" y="123" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_contrast
        </text>
      </cap_contrast>
      <track_contrast x="140" y="127" width="188" height="16">
        <options_item entry="rs_c_contrast" group="mm_opt_video" depend="runtime" />
      </track_contrast>

      <cap_brightness x="12" y="153" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_brightness
        </text>
      </cap_brightness>
      <track_brightness x="140" y="157" width="188" height="16">
        <options_item entry="rs_c_brightness" group="mm_opt_video" depend="runtime" />
      </track_brightness>

      <cap_fullscreen x="12" y="183" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_fullscreen
        </text>
      </cap_fullscreen>
      <check_fullscreen x="129" y="180" width="35" stretch="1" height="29">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="rs_fullscreen" group="mm_opt_video" depend="vid" />
      </check_fullscreen>

      <btn_advanced x="270" y="322" width="86" height="24" stretch="1">
        <text r="170" g="170" b="170" align="c" font="letterica16">
          ui_mm_advanced
        </text>
        <texture>ui_inGame2_button</texture>
        <text_color>
          <e r="210" g="210" b="210" />
        </text_color>
      </btn_advanced>
    </tab_video>
  );
}
