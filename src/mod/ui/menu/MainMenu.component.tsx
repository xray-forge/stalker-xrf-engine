import { JSXXML, JSXNode } from "jsx-xml";

import { captions } from "@/mod/globals/captions";
import { fonts } from "@/mod/globals/fonts";
import { textures } from "@/mod/globals/textures";

export const IS_XML: boolean = true;

export function create(): JSXNode {
  return (
    <w>
      <MainMenuBackground />

      <shniaga_wnd x={134} y={320} width={216} height={380}>
        <buttons_region x={8} y={0} width={220} height={380} always_show_scroll={false} vert_interval={12} />
        <shniaga x={7} y={-20} width={219} height={61} stretch={1}>
          <texture>{textures.ui_inGame2_slider}</texture>
          <magnifire x={27} y={18} width={162} height={24} stretch={1}>
            <texture>{textures.ui_magnifier2}</texture>
            <y_offset>1</y_offset>
          </magnifire>
        </shniaga>
      </shniaga_wnd>

      <button h={25} />

      <menu_main btn_height={34} font={fonts.graffiti22}>
        <btn name={"btn_new_game"} caption={captions.ui_mm_newgame} />
        <btn name={"btn_load"} caption={captions.ui_mm_load_game} />
        <btn name={"btn_net_game"} caption={captions.ui_mm_network_game} />
        <btn name={"btn_options"} caption={captions.ui_mm_options_n} />
        <btn name={"btn_credits"} caption={captions.ui_mm_credits} />
        <btn name={"btn_quit"} caption={captions.ui_mm_quit2windows} />
      </menu_main>

      <menu_network_game btn_height={34} font={fonts.graffiti22}>
        <btn name={"btn_internet"} caption={captions.ui_mp_internet} />
        <btn name={"btn_localnet"} caption={captions.ui_mp_localnet} />
        <btn name={"btn_new_back"} caption={captions.ui_mm_back} />
      </menu_network_game>

      <menu_main_logout btn_height={34} font={fonts.graffiti22}>
        <btn name={"btn_new_game"} caption={captions.ui_mm_newgame} />
        <btn name={"btn_load"} caption={captions.ui_mm_load_game} />
        <btn name={"btn_multiplayer"} caption={captions.ui_mm_network_game} />
        <btn name={"btn_logout"} caption={captions.ui_mm_logout} />
        <btn name={"btn_options"} caption={captions.ui_mm_options_n} />
        <btn name={"btn_credits"} caption={captions.ui_mm_credits} />
        <btn name={"btn_quit"} caption={captions.ui_mm_quit2windows} />
      </menu_main_logout>

      <menu_main_last_save btn_height={34} font={fonts.graffiti22}>
        <btn name={"btn_new_game"} caption={captions.ui_mm_newgame} />
        <btn name={"btn_load"} caption={captions.ui_mm_load_game} />
        <btn name={"btn_lastsave"} caption={captions.ui_mm_last_save} />
        <btn name={"btn_net_game"} caption={captions.ui_mm_network_game} />
        <btn name={"btn_options"} caption={captions.ui_mm_options_n} />
        <btn name={"btn_credits"} caption={captions.ui_mm_credits} />
        <btn name={"btn_quit"} caption={captions.ui_mm_quit2windows} />
      </menu_main_last_save>

      <menu_new_game btn_height={34} font={fonts.graffiti22}>
        <btn name={"btn_novice"} caption={captions.ui_mm_novice} />
        <btn name={"btn_stalker"} caption={captions.ui_mm_stalker} />
        <btn name={"btn_veteran"} caption={captions.ui_mm_veteran} />
        <btn name={"btn_master"} caption={captions.ui_mm_master} />
        <btn name={"btn_new_back"} caption={captions.ui_mm_back} />
      </menu_new_game>

      <menu_main_single btn_height={34} font={fonts.graffiti22}>
        <btn name={"btn_ret"} caption={captions.ui_mm_return_game} />
        <btn name={"btn_lastsave"} caption={captions.ui_mm_last_save} />
        <btn name={"btn_load"} caption={captions.ui_mm_load_game} />
        <btn name={"btn_save"} caption={captions.ui_mm_save_game} />
        <btn name={"btn_options"} caption={captions.ui_mm_options_n} />
        <btn name={"btn_credits"} caption={captions.ui_mm_credits} />
        <btn name={"btn_quit_to_mm"} caption={captions.ui_mm_quit_game} />
        <btn name={"btn_quit"} caption={captions.ui_mm_quit2windows} />
      </menu_main_single>

      <menu_main_single_dead btn_height={34} font={fonts.graffiti22}>
        <btn name={"btn_lastsave"} caption={captions.ui_mm_last_save} />
        <btn name={"btn_load"} caption={captions.ui_mm_load_game} />
        <btn name={"btn_options"} caption={captions.ui_mm_options_n} />
        <btn name={"btn_credits"} caption={captions.ui_mm_credits} />
        <btn name={"btn_quit_to_mm"} caption={captions.ui_mm_quit_game} />
        <btn name={"btn_quit"} caption={captions.ui_mm_quit2windows} />
      </menu_main_single_dead>

      <menu_main_mm btn_height={34} font={fonts.graffiti22}>
        <btn name={"btn_ret"} caption={captions.ui_mm_return_game} />
        <btn name={"btn_options"} caption={captions.ui_mm_options_n} />
        <btn name={"btn_credits"} caption={captions.ui_mm_credits} />
        <btn name={"btn_quit_to_mm"} caption={captions.ui_mm_disconnect} />
        <btn name={"btn_quit"} caption={captions.ui_mm_quit2windows} />
      </menu_main_mm>

      <menu_sound random={0}>
        <menu_music>music\menu</menu_music>
      </menu_sound>

      <static_version x={14} y={740} width={80} height={30}>
        <text align={"l"} font={fonts.graffiti19} r={135} g={123} b={116} complex_mode={0} />
      </static_version>
    </w>
  );
}

function MainMenuBackground(): JSXNode {
  return (
    <background x={0} y={0} width={1024} height={768}>
      <auto_static x={500} y={130} width={345} height={160} stretch={1}>
        <texture width={432} height={160}>
          {textures.ui_video_voroni_crop}
        </texture>
      </auto_static>
      <auto_static x={432} y={353} width={460} height={416} stretch={1}>
        <texture x={0} y={0} width={576} height={416}>
          {textures.ui_video_water_crop}
        </texture>
      </auto_static>
      <auto_static x={102} y={0} width={819} height={768} stretch={1}>
        <texture>{textures.ui_inGame2_background}</texture>
      </auto_static>
      <auto_static x={0} y={0} width={104} height={768} stretch={1}>
        <texture>{textures.ui_inGame2_left_widepanel}</texture>
      </auto_static>
      <auto_static x={920} y={0} width={104} height={768} stretch={1}>
        <texture>{textures.ui_inGame2_right_widepanel}</texture>
      </auto_static>
    </background>
  );
}
