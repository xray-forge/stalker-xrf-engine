import { JSXNode, JSXXML } from "jsx-xml";

/**
 * Create forms for voting category in multiplayer (16/9).
 */
export function create(): JSXNode {
  return (
    <voting_category>
      <category x={"266"} y={"166"} width={"499"} height={"411"}>
        <background x={"0"} y={"0"} width={"499"} height={"411"} stretch={"1"}>
          <texture>ui_inGame2_screen_4</texture>
          <auto_static x={"166"} y={"121"} width={"178"} height={"212"} stretch={"1"}>
            <texture>ui_inGame2_small_plane_1</texture>
          </auto_static>
        </background>
        <header x={"22"} y={"38"} width={"462"} height={"30"}>
          <text font={"graffiti19"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"c"}>
            mp_select_category
          </text>
        </header>
        <btn_cancel x={"201"} y={"381"} width={"108"} height={"26"} stretch={"1"}>
          <text y={"2"} font={"graffiti19"} align={"c"}>
            mm_mp_cancel
          </text>
          <texture>ui_inGame2_Mp_bigbuttone</texture>
        </btn_cancel>
        <btn_1 x={"171"} y={"127"} width={"168"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_vote_button</texture>
        </btn_1>
        <btn_2 x={"171"} y={"155"} width={"168"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_vote_button</texture>
        </btn_2>
        <btn_3 x={"171"} y={"184"} width={"168"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_vote_button</texture>
        </btn_3>
        <btn_4 x={"171"} y={"212"} width={"168"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_vote_button</texture>
        </btn_4>
        <btn_5 x={"171"} y={"241"} width={"168"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_vote_button</texture>
        </btn_5>
        <btn_6 x={"171"} y={"269"} width={"168"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_vote_button</texture>
        </btn_6>
        <btn_7 x={"171"} y={"298"} width={"168"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_vote_button</texture>
        </btn_7>
        <txt_1 x={"177"} y={"127"} width={"160"} height={"28"}>
          <text font={"letterica16"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"l"}>
            mp_restart
          </text>
        </txt_1>
        <txt_2 x={"177"} y={"155"} width={"160"} height={"28"}>
          <text font={"letterica16"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"l"}>
            mp_restart_fast
          </text>
        </txt_2>
        <txt_3 x={"177"} y={"184"} width={"160"} height={"28"}>
          <text font={"letterica16"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"l"}>
            mp_kick
          </text>
        </txt_3>
        <txt_4 x={"177"} y={"212"} width={"160"} height={"28"}>
          <text font={"letterica16"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"l"}>
            mp_ban
          </text>
        </txt_4>
        <txt_5 x={"177"} y={"241"} width={"160"} height={"28"}>
          <text font={"letterica16"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"l"}>
            mp_change_map
          </text>
        </txt_5>
        <txt_6 x={"177"} y={"269"} width={"160"} height={"28"}>
          <text font={"letterica16"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"l"}>
            mp_change_weather
          </text>
        </txt_6>
        <txt_7 x={"177"} y={"298"} width={"160"} height={"28"}>
          <text font={"letterica16"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"l"}>
            mp_gamemode
          </text>
        </txt_7>
      </category>
      <kick_ban x={"266"} y={"166"} width={"499"} height={"411"}>
        <background x={"0"} y={"0"} width={"499"} height={"411"} stretch={"1"}>
          <texture>ui_inGame2_screen_4</texture>
        </background>
        <header_kick x={"22"} y={"38"} width={"462"} height={"30"}>
          <text font={"graffiti19"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"c"}>
            mp_select_kick
          </text>
        </header_kick>
        <header_ban x={"22"} y={"38"} width={"462"} height={"30"}>
          <text font={"graffiti19"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"c"}>
            mp_select_ban
          </text>
        </header_ban>
        <list x={"25"} y={"84"} width={"453"} height={"285"} can_select={"1"}>
          <font r={"170"} g={"170"} b={"170"} font={"letterica16"} />
        </list>
        <btn_ok x={"144"} y={"381"} width={"108"} height={"26"} stretch={"1"}>
          <text y={"2"} font={"graffiti19"} align={"c"}>
            Btn_OK
          </text>
          <texture>ui_inGame2_Mp_bigbuttone</texture>
        </btn_ok>
        <btn_cancel x={"256"} y={"381"} width={"108"} height={"26"} stretch={"1"}>
          <text y={"2"} font={"graffiti19"} align={"c"}>
            mm_mp_cancel
          </text>
          <texture>ui_inGame2_Mp_bigbuttone</texture>
        </btn_cancel>
        <spin_ban_time x={"36"} y={"384"} width={"80"} height={"26"} stretch={"1"} />
        <ban_time_lbl x={"116"} y={"382"} width={"28"} height={"26"}>
          <text r={"120"} g={"120"} b={"120"} font={"letterica16"} vert_align={"c"}>
            Sec.
          </text>
        </ban_time_lbl>
      </kick_ban>
      <change_map x={"266"} y={"166"} width={"499"} height={"411"}>
        <background x={"0"} y={"0"} width={"499"} height={"411"} stretch={"1"}>
          <texture>ui_inGame2_screen_2</texture>
        </background>
        <header x={"22"} y={"38"} width={"462"} height={"30"}>
          <text font={"graffiti19"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"c"}>
            mp_select_map
          </text>
        </header>
        <list x={"25"} y={"84"} width={"192"} height={"285"} can_select={"1"}>
          <font r={"170"} g={"170"} b={"170"} font={"letterica16"} />
        </list>
        <map_pic x={"236"} y={"89"} width={"240"} height={"208"} stretch={"1"}>
          <texture width={"256"} height={"175"}>
            ui\ui_noise
          </texture>
        </map_pic>
        <map_frame x={"227"} y={"76"} width={"259"} height={"234"} stretch={"1"}>
          <texture>ui_inGame2_Mp_screen_map_window</texture>
        </map_frame>
        <map_ver_txt x={"227"} y={"310"} width={"80"} height={"25"}>
          <text font={"graffiti19"} r={"170"} g={"170"} b={"170"} vert_align={"c"}></text>
        </map_ver_txt>
        <btn_ok x={"144"} y={"381"} width={"108"} height={"26"} stretch={"1"}>
          <text y={"2"} font={"graffiti19"} align={"c"}>
            Btn_OK
          </text>
          <texture>ui_inGame2_Mp_bigbuttone</texture>
        </btn_ok>
        <btn_cancel x={"256"} y={"381"} width={"108"} height={"26"} stretch={"1"}>
          <text y={"2"} font={"graffiti19"} align={"c"}>
            mm_mp_cancel
          </text>
          <texture>ui_inGame2_Mp_bigbuttone</texture>
        </btn_cancel>
      </change_map>
      <change_weather x={"266"} y={"166"} width={"499"} height={"411"}>
        <background x={"0"} y={"0"} width={"499"} height={"411"} stretch={"1"}>
          <texture>ui_inGame2_screen_4</texture>
          <auto_static x={"166"} y={"121"} width={"178"} height={"212"} stretch={"1"}>
            <texture>ui_inGame2_small_plane_1</texture>
          </auto_static>
        </background>
        <header x={"22"} y={"38"} width={"462"} height={"30"}>
          <text font={"graffiti19"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"c"}>
            mp_change_weather_header
          </text>
        </header>
        <btn_cancel x={"201"} y={"381"} width={"108"} height={"26"} stretch={"1"}>
          <text y={"2"} font={"graffiti19"} align={"c"}>
            mm_mp_cancel
          </text>
          <texture>ui_inGame2_Mp_bigbuttone</texture>
        </btn_cancel>
        <btn_1 x={"171"} y={"127"} width={"168"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_vote_button</texture>
        </btn_1>
        <btn_2 x={"171"} y={"155"} width={"168"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_vote_button</texture>
        </btn_2>
        <btn_3 x={"171"} y={"184"} width={"168"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_vote_button</texture>
        </btn_3>
        <btn_4 x={"171"} y={"212"} width={"168"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_vote_button</texture>
        </btn_4>
        <txt_1 x={"177"} y={"127"} width={"160"} height={"28"}>
          <text font={"letterica16"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"l"}>
            mp_weather_clear
          </text>
        </txt_1>
        <txt_2 x={"177"} y={"155"} width={"160"} height={"28"}>
          <text font={"letterica16"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"l"}>
            mp_weather_rain
          </text>
        </txt_2>
        <txt_3 x={"177"} y={"184"} width={"160"} height={"28"}>
          <text font={"letterica16"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"l"}>
            mp_weather_night
          </text>
        </txt_3>
        <txt_4 x={"177"} y={"212"} width={"160"} height={"28"}>
          <text font={"letterica16"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"l"}>
            mp_weather_cloudy
          </text>
        </txt_4>
      </change_weather>
      <change_gametype x={"266"} y={"166"} width={"499"} height={"411"}>
        <background x={"0"} y={"0"} width={"499"} height={"411"} stretch={"1"}>
          <texture>ui_inGame2_screen_4</texture>
          <auto_static x={"166"} y={"121"} width={"178"} height={"212"} stretch={"1"}>
            <texture>ui_inGame2_small_plane_1</texture>
          </auto_static>
        </background>
        <header x={"22"} y={"38"} width={"462"} height={"30"}>
          <text font={"graffiti19"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"c"}>
            mm_mp_gamemode
          </text>
        </header>
        <btn_cancel x={"201"} y={"381"} width={"108"} height={"26"} stretch={"1"}>
          <text y={"2"} font={"graffiti19"} align={"c"}>
            mm_mp_cancel
          </text>
          <texture>ui_inGame2_Mp_bigbuttone</texture>
        </btn_cancel>
        <btn_1 x={"171"} y={"127"} width={"168"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_vote_button</texture>
        </btn_1>
        <btn_2 x={"171"} y={"155"} width={"168"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_vote_button</texture>
        </btn_2>
        <btn_3 x={"171"} y={"184"} width={"168"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_vote_button</texture>
        </btn_3>
        <btn_4 x={"171"} y={"212"} width={"168"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_vote_button</texture>
        </btn_4>
        <txt_1 x={"177"} y={"127"} width={"160"} height={"28"} id={"dm"}>
          <text font={"letterica16"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"l"}>
            ui_mp_dm
          </text>
        </txt_1>
        <txt_2 x={"177"} y={"155"} width={"160"} height={"28"} id={"ah"}>
          <text font={"letterica16"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"l"}>
            ui_mp_ah
          </text>
        </txt_2>
        <txt_3 x={"177"} y={"184"} width={"160"} height={"28"} id={"tdm"}>
          <text font={"letterica16"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"l"}>
            ui_mp_tdm
          </text>
        </txt_3>
        <txt_4 x={"177"} y={"212"} width={"160"} height={"28"} id={"cta"}>
          <text font={"letterica16"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"l"}>
            ui_mp_cta
          </text>
        </txt_4>
      </change_gametype>
      <vote x={"266"} y={"166"} width={"499"} height={"411"}>
        <background x={"0"} y={"0"} width={"499"} height={"411"} stretch={"1"}>
          <texture>ui_inGame2_screen_4</texture>
        </background>
        <msg x={"22"} y={"38"} width={"462"} height={"30"}>
          <text font={"graffiti19"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"c"}>
            test \n msg
          </text>
        </msg>
        <list_cap_1 x={"25"} y={"84"} width={"148"} height={"20"}>
          <text font={"letterica18"} vert_align={"c"} align={"c"}>
            mp_voted_yes
          </text>
        </list_cap_1>
        <list_cap_2 x={"177"} y={"84"} width={"148"} height={"20"}>
          <text font={"letterica18"} vert_align={"c"} align={"c"}>
            mp_voted_no
          </text>
        </list_cap_2>
        <list_cap_3 x={"329"} y={"84"} width={"148"} height={"20"}>
          <text font={"letterica18"} vert_align={"c"} align={"c"}>
            mp_no_voted
          </text>
        </list_cap_3>
        <list_1 x={"25"} y={"104"} width={"148"} height={"265"} can_select={"0"}>
          <font r={"170"} g={"170"} b={"170"} font={"letterica16"} />
        </list_1>
        <list_2 x={"177"} y={"104"} width={"148"} height={"265"} can_select={"0"}>
          <font r={"170"} g={"170"} b={"170"} font={"letterica16"} />
        </list_2>
        <list_3 x={"329"} y={"104"} width={"148"} height={"265"} can_select={"0"}>
          <font r={"170"} g={"170"} b={"170"} font={"letterica16"} />
        </list_3>
        <btn_yes x={"89"} y={"381"} width={"108"} height={"26"} stretch={"1"}>
          <text y={"2"} font={"graffiti19"} align={"c"}>
            mp_vote_yes
          </text>
          <texture>ui_inGame2_Mp_bigbuttone</texture>
        </btn_yes>
        <btn_no x={"201"} y={"381"} width={"108"} height={"26"} stretch={"1"}>
          <text y={"2"} font={"graffiti19"} align={"c"}>
            mp_vote_no
          </text>
          <texture>ui_inGame2_Mp_bigbuttone</texture>
        </btn_no>
        <btn_cancel x={"313"} y={"381"} width={"108"} height={"26"} stretch={"1"}>
          <text y={"2"} font={"graffiti19"} align={"c"}>
            mp_cancel
          </text>
          <texture>ui_inGame2_Mp_bigbuttone</texture>
        </btn_cancel>
      </vote>
    </voting_category>
  );
}
