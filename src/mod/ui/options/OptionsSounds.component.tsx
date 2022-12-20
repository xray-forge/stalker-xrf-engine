import { JSXNode, JSXXML } from "jsx-xml";

export function OptionsSounds(): JSXNode {
  return (
    <tab_sound>
      <cap_mastervolume x="12" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_master_volume
        </text>
      </cap_mastervolume>
      <track_mastervolume x="140" y="6" width="188" height="16">
        <options_item entry="snd_volume_eff" group="mm_opt_sound" />
      </track_mastervolume>

      <cap_musicvolume x="12" y="33" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_music_volume
        </text>
      </cap_musicvolume>
      <track_musicvolume x="140" y="36" width="188" height="16">
        <options_item entry="snd_volume_music" group="mm_opt_sound" />
      </track_musicvolume>

      <cap_snd_device x="12" y="63" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_snd_device
        </text>
      </cap_snd_device>
      <list_snd_device x="140" y="65" width="188" height="20" always_show_scroll="1">
        <options_item entry="snd_device" group="mm_opt_sound" depend="restart" />
        <list_font r="170" g="170" b="170" font="letterica16" />
        <text_color>
          <e r="170" g="170" b="170" />
          <d r="70" g="70" b="70" />
        </text_color>
      </list_snd_device>

      <cap_check_eax x="12" y="93" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_eax
        </text>
      </cap_check_eax>
      <check_eax x="129" y="90" width="35" stretch="1" height="29">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="snd_efx" group="mm_opt_sound" depend="snd" />
      </check_eax>

      <cap_check_dynamic_music x="12" y="123" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_dynamic_music
        </text>
      </cap_check_dynamic_music>
      <check_dynamic_music x="129" y="120" width="35" stretch="1" height="29">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="g_dynamic_music" group="mm_opt_sound" depend="snd" />
      </check_dynamic_music>
    </tab_sound>
  );
}
