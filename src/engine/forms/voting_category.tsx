import { JSXNode, JSXXML } from "jsx-xml";

/**
 * Create forms for voting category in multiplayer.
 */
export function create(): JSXNode {
  return (
    <voting_category>
      <category x={"205"} y={"166"} width={"624"} height={"411"}>
        <background x={"0"} y={"0"} width={"624"} height={"411"}>
          <texture>ui_inGame2_screen_4</texture>
          <auto_static x={"208"} y={"121"} width={"223"} height={"212"}>
            <texture>ui_inGame2_small_plane_1</texture>
          </auto_static>
        </background>
        <header x={"28"} y={"38"} width={"578"} height={"30"}>
          <text font={"graffiti19"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"c"}>
            mp_select_category
          </text>
        </header>
        <btn_cancel x={"252"} y={"381"} width={"135"} height={"26"}>
          <text y={"2"} font={"graffiti19"} align={"c"}>
            mm_mp_cancel
          </text>
          <texture>ui_inGame2_Mp_bigbuttone</texture>
        </btn_cancel>
        <btn_1 x={"214"} y={"127"} width={"210"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_vote_button</texture>
        </btn_1>
        <btn_2 x={"214"} y={"155"} width={"210"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_vote_button</texture>
        </btn_2>
        <btn_3 x={"214"} y={"184"} width={"210"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_vote_button</texture>
        </btn_3>
        <btn_4 x={"214"} y={"212"} width={"210"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_vote_button</texture>
        </btn_4>
        <btn_5 x={"214"} y={"241"} width={"210"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_vote_button</texture>
        </btn_5>
        <btn_6 x={"214"} y={"269"} width={"210"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_vote_button</texture>
        </btn_6>
        <btn_7 x={"214"} y={"298"} width={"210"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_vote_button</texture>
        </btn_7>
        <txt_1 x={"222"} y={"127"} width={"200"} height={"28"}>
          <text font={"letterica16"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"l"}>
            mp_restart
          </text>
        </txt_1>
        <txt_2 x={"222"} y={"155"} width={"200"} height={"28"}>
          <text font={"letterica16"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"l"}>
            mp_restart_fast
          </text>
        </txt_2>
        <txt_3 x={"222"} y={"184"} width={"200"} height={"28"}>
          <text font={"letterica16"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"l"}>
            mp_kick
          </text>
        </txt_3>
        <txt_4 x={"222"} y={"212"} width={"200"} height={"28"}>
          <text font={"letterica16"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"l"}>
            mp_ban
          </text>
        </txt_4>
        <txt_5 x={"222"} y={"241"} width={"200"} height={"28"}>
          <text font={"letterica16"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"l"}>
            mp_change_map
          </text>
        </txt_5>
        <txt_6 x={"222"} y={"269"} width={"200"} height={"28"}>
          <text font={"letterica16"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"l"}>
            mp_change_weather
          </text>
        </txt_6>
        <txt_7 x={"222"} y={"298"} width={"200"} height={"28"}>
          <text font={"letterica16"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"l"}>
            mp_gamemode
          </text>
        </txt_7>
      </category>
      <kick_ban x={"205"} y={"166"} width={"624"} height={"411"}>
        <background x={"0"} y={"0"} width={"624"} height={"411"}>
          <texture>ui_inGame2_screen_4</texture>
        </background>
        <header_kick x={"28"} y={"38"} width={"578"} height={"30"}>
          <text font={"graffiti19"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"c"}>
            mp_select_kick
          </text>
        </header_kick>
        <header_ban x={"28"} y={"38"} width={"578"} height={"30"}>
          <text font={"graffiti19"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"c"}>
            mp_select_ban
          </text>
        </header_ban>
        <list x={"32"} y={"84"} width={"567"} height={"285"} can_select={"1"}>
          <font r={"170"} g={"170"} b={"170"} font={"letterica16"} />
        </list>
        <btn_ok x={"180"} y={"381"} width={"135"} height={"26"}>
          <text y={"2"} font={"graffiti19"} align={"c"}>
            Btn_OK
          </text>
          <texture>ui_inGame2_Mp_bigbuttone</texture>
        </btn_ok>
        <btn_cancel x={"320"} y={"381"} width={"135"} height={"26"}>
          <text y={"2"} font={"graffiti19"} align={"c"}>
            mm_mp_cancel
          </text>
          <texture>ui_inGame2_Mp_bigbuttone</texture>
        </btn_cancel>
        <spin_ban_time x={"45"} y={"384"} width={"100"} height={"26"} />
        <ban_time_lbl x={"145"} y={"382"} width={"35"} height={"26"}>
          <text r={"120"} g={"120"} b={"120"} font={"letterica16"} vert_align={"c"}>
            Sec.
          </text>
        </ban_time_lbl>
      </kick_ban>
      <change_map x={"205"} y={"166"} width={"624"} height={"411"}>
        <background x={"0"} y={"0"} width={"624"} height={"411"}>
          <texture>ui_inGame2_screen_2</texture>
        </background>
        <header x={"28"} y={"38"} width={"578"} height={"30"}>
          <text font={"graffiti19"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"c"}>
            mp_select_map
          </text>
        </header>
        <list x={"32"} y={"84"} width={"240"} height={"285"} can_select={"1"}>
          <font r={"170"} g={"170"} b={"170"} font={"letterica16"} />
        </list>
        <map_pic x={"296"} y={"89"} width={"300"} height={"208"} stretch={"1"}>
          <texture width={"256"} height={"175"}>
            ui\ui_noise
          </texture>
        </map_pic>
        <map_frame x={"284"} y={"76"} width={"324"} height={"234"}>
          <texture>ui_inGame2_Mp_screen_map_window</texture>
        </map_frame>
        <map_ver_txt x={"284"} y={"310"} width={"100"} height={"25"}>
          <text font={"graffiti19"} r={"170"} g={"170"} b={"170"} vert_align={"c"}></text>
        </map_ver_txt>
        <btn_ok x={"180"} y={"381"} width={"135"} height={"26"}>
          <text y={"2"} font={"graffiti19"} align={"c"}>
            Btn_OK
          </text>
          <texture>ui_inGame2_Mp_bigbuttone</texture>
        </btn_ok>
        <btn_cancel x={"320"} y={"381"} width={"135"} height={"26"}>
          <text y={"2"} font={"graffiti19"} align={"c"}>
            mm_mp_cancel
          </text>
          <texture>ui_inGame2_Mp_bigbuttone</texture>
        </btn_cancel>
      </change_map>
      <change_weather x={"205"} y={"166"} width={"624"} height={"411"}>
        <background x={"0"} y={"0"} width={"624"} height={"411"}>
          <texture>ui_inGame2_screen_4</texture>
          <auto_static x={"208"} y={"121"} width={"223"} height={"212"}>
            <texture>ui_inGame2_small_plane_1</texture>
          </auto_static>
        </background>
        <header x={"28"} y={"38"} width={"578"} height={"30"}>
          <text font={"graffiti19"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"c"}>
            mp_change_weather_header
          </text>
        </header>
        <btn_cancel x={"252"} y={"381"} width={"135"} height={"26"}>
          <text y={"2"} font={"graffiti19"} align={"c"}>
            mm_mp_cancel
          </text>
          <texture>ui_inGame2_Mp_bigbuttone</texture>
        </btn_cancel>
        <btn_1 x={"214"} y={"127"} width={"210"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_vote_button</texture>
        </btn_1>
        <btn_2 x={"214"} y={"155"} width={"210"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_vote_button</texture>
        </btn_2>
        <btn_3 x={"214"} y={"184"} width={"210"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_vote_button</texture>
        </btn_3>
        <btn_4 x={"214"} y={"212"} width={"210"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_vote_button</texture>
        </btn_4>
        <txt_1 x={"222"} y={"127"} width={"200"} height={"28"}>
          <text font={"letterica16"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"l"}>
            mp_weather_clear
          </text>
        </txt_1>
        <txt_2 x={"222"} y={"155"} width={"200"} height={"28"}>
          <text font={"letterica16"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"l"}>
            mp_weather_rain
          </text>
        </txt_2>
        <txt_3 x={"222"} y={"184"} width={"200"} height={"28"}>
          <text font={"letterica16"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"l"}>
            mp_weather_night
          </text>
        </txt_3>
        <txt_4 x={"222"} y={"212"} width={"200"} height={"28"}>
          <text font={"letterica16"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"l"}>
            mp_weather_cloudy
          </text>
        </txt_4>
      </change_weather>
      <change_gametype x={"205"} y={"166"} width={"624"} height={"411"}>
        <background x={"0"} y={"0"} width={"624"} height={"411"}>
          <texture>ui_inGame2_screen_4</texture>
          <auto_static x={"208"} y={"121"} width={"223"} height={"212"}>
            <texture>ui_inGame2_small_plane_1</texture>
          </auto_static>
        </background>
        <header x={"28"} y={"38"} width={"578"} height={"30"}>
          <text font={"graffiti19"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"c"}>
            mm_mp_gamemode
          </text>
        </header>
        <btn_cancel x={"252"} y={"381"} width={"135"} height={"26"}>
          <text y={"2"} font={"graffiti19"} align={"c"}>
            mm_mp_cancel
          </text>
          <texture>ui_inGame2_Mp_bigbuttone</texture>
        </btn_cancel>
        <btn_1 x={"214"} y={"127"} width={"210"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_vote_button</texture>
        </btn_1>
        <btn_2 x={"214"} y={"155"} width={"210"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_vote_button</texture>
        </btn_2>
        <btn_3 x={"214"} y={"184"} width={"210"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_vote_button</texture>
        </btn_3>
        <btn_4 x={"214"} y={"212"} width={"210"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_vote_button</texture>
        </btn_4>
        <txt_1 x={"222"} y={"127"} width={"200"} height={"28"} id={"dm"}>
          <text font={"letterica16"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"l"}>
            ui_mp_dm
          </text>
        </txt_1>
        <txt_2 x={"222"} y={"155"} width={"200"} height={"28"} id={"ah"}>
          <text font={"letterica16"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"l"}>
            ui_mp_ah
          </text>
        </txt_2>
        <txt_3 x={"222"} y={"184"} width={"200"} height={"28"} id={"tdm"}>
          <text font={"letterica16"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"l"}>
            ui_mp_tdm
          </text>
        </txt_3>
        <txt_4 x={"222"} y={"212"} width={"200"} height={"28"} id={"cta"}>
          <text font={"letterica16"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"l"}>
            ui_mp_cta
          </text>
        </txt_4>
      </change_gametype>
      <vote x={"205"} y={"166"} width={"624"} height={"411"}>
        <background x={"0"} y={"0"} width={"624"} height={"411"}>
          <texture>ui_inGame2_screen_4</texture>
        </background>
        <msg x={"28"} y={"38"} width={"578"} height={"30"}>
          <text font={"graffiti19"} r={"170"} g={"170"} b={"170"} vert_align={"c"} align={"c"}>
            test \n msg
          </text>
        </msg>
        <list_cap_1 x={"32"} y={"84"} width={"185"} height={"20"}>
          <text font={"letterica18"} vert_align={"c"} align={"c"}>
            mp_voted_yes
          </text>
        </list_cap_1>
        <list_cap_2 x={"222"} y={"84"} width={"185"} height={"20"}>
          <text font={"letterica18"} vert_align={"c"} align={"c"}>
            mp_voted_no
          </text>
        </list_cap_2>
        <list_cap_3 x={"412"} y={"84"} width={"185"} height={"20"}>
          <text font={"letterica18"} vert_align={"c"} align={"c"}>
            mp_no_voted
          </text>
        </list_cap_3>
        <list_1 x={"32"} y={"104"} width={"185"} height={"265"} can_select={"0"}>
          <font r={"170"} g={"170"} b={"170"} font={"letterica16"} />
        </list_1>
        <list_2 x={"222"} y={"104"} width={"185"} height={"265"} can_select={"0"}>
          <font r={"170"} g={"170"} b={"170"} font={"letterica16"} />
        </list_2>
        <list_3 x={"412"} y={"104"} width={"185"} height={"265"} can_select={"0"}>
          <font r={"170"} g={"170"} b={"170"} font={"letterica16"} />
        </list_3>
        <btn_yes x={"112"} y={"381"} width={"135"} height={"26"}>
          <text y={"2"} font={"graffiti19"} align={"c"}>
            mp_vote_yes
          </text>
          <texture>ui_inGame2_Mp_bigbuttone</texture>
        </btn_yes>
        <btn_no x={"252"} y={"381"} width={"135"} height={"26"}>
          <text y={"2"} font={"graffiti19"} align={"c"}>
            mp_vote_no
          </text>
          <texture>ui_inGame2_Mp_bigbuttone</texture>
        </btn_no>
        <btn_cancel x={"392"} y={"381"} width={"135"} height={"26"}>
          <text y={"2"} font={"graffiti19"} align={"c"}>
            mp_cancel
          </text>
          <texture>ui_inGame2_Mp_bigbuttone</texture>
        </btn_cancel>
      </vote>
    </voting_category>
  );
}
