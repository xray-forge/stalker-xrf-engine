import { JSXNode, JSXXML } from "jsx-xml";

/**
 * Create UI forms related to deathmatch multiplayer configuration components.
 */
export function create(): JSXNode {
  return (
    <w>
      <vote_wnd x={"10"} y={"640"} width={"350"} height={"120"} stretch={"1"}>
        <texture>ui_frame_01</texture>
        <static_str_message x={"10"} y={"10"} width={"320"} height={"20"} complex_mode={"1"}>
          <text font={"letterica16"} r={"255"} g={"255"} b={"255"} a={"230"}>
            test1
          </text>
        </static_str_message>
        <static_time_message x={"10"} y={"45"} width={"320"} height={"20"} complex_mode={"1"}>
          <text font={"letterica16"} r={"255"} g={"255"} b={"255"} a={"230"}>
            test3
          </text>
        </static_time_message>
        <static_hint x={"10"} y={"65"} width={"320"} height={"60"} complex_mode={"1"}>
          <text font={"letterica16"} r={"255"} g={"255"} b={"255"} a={"130"}>
            mp_vote_hint
          </text>
        </static_hint>
      </vote_wnd>

      <money_wnd x={"878"} y={"0"} width={"146"} height={"160"}>
        <money_indicator x={"0"} y={"0"} width={"146"} height={"42"}>
          <texture>ui_inGame2_Mp_HUD_money_panel</texture>
          <total_money x={"36"} y={"0"} width={"103"} height={"37"}>
            <text align={"c"} vert_align={"c"} font={"graffiti32"} r={"200"} g={"200"} b={"200"}>
              0
            </text>
          </total_money>
        </money_indicator>
        <money_change x={"36"} y={"42"} width={"100"} height={"30"}>
          <text font={"letterica18"} align={"c"} vert_align={"c"} r={"238"} g={"155"} b={"23"}></text>
        </money_change>
        <money_bonus_list x={"36"} y={"72"} width={"100"} height={"30"} always_show_scroll={"0"}>
          <font font={"letterica18"} align={"c"} vert_align={"c"} r={"0"} g={"255"} b={"0"} />
        </money_bonus_list>
      </money_wnd>

      <rank_wnd x={"878"} y={"0"} width={"146"} height={"42"}>
        <background x={"0"} y={"0"} width={"60"} height={"65"} />
        <rank_0 x={"5"} y={"3"} width={"30"} height={"31"} stretch={"1"}>
          <texture>ui_hud_status_green_01</texture>
        </rank_0>
        <rank_1 x={"5"} y={"3"} width={"30"} height={"31"} stretch={"1"}>
          <texture>ui_hud_status_green_02</texture>
        </rank_1>
        <rank_2 x={"5"} y={"3"} width={"30"} height={"31"} stretch={"1"}>
          <texture>ui_hud_status_green_03</texture>
        </rank_2>
        <rank_3 x={"5"} y={"3"} width={"30"} height={"31"} stretch={"1"}>
          <texture>ui_hud_status_green_04</texture>
        </rank_3>
        <rank_4 x={"5"} y={"3"} width={"30"} height={"31"} stretch={"1"}>
          <texture>ui_hud_status_green_05</texture>
        </rank_4>
        <rank_5 x={"5"} y={"3"} width={"30"} height={"31"} stretch={"1"}>
          <texture>ui_hud_status_blue_01</texture>
        </rank_5>
        <rank_6 x={"5"} y={"3"} width={"30"} height={"31"} stretch={"1"}>
          <texture>ui_hud_status_blue_02</texture>
        </rank_6>
        <rank_7 x={"5"} y={"3"} width={"30"} height={"31"} stretch={"1"}>
          <texture>ui_hud_status_blue_03</texture>
        </rank_7>
        <rank_8 x={"5"} y={"3"} width={"30"} height={"31"} stretch={"1"}>
          <texture>ui_hud_status_blue_04</texture>
        </rank_8>
        <rank_9 x={"5"} y={"3"} width={"30"} height={"31"} stretch={"1"}>
          <texture>ui_hud_status_blue_05</texture>
        </rank_9>
      </rank_wnd>

      <fraglimit x={"455"} y={"0"} width={"114"} height={"41"}>
        <text align={"c"} vert_align={"c"} font={"graffiti32"} r={"200"} g={"200"} b={"200"} />
      </fraglimit>

      <global width={"1024"} height={"768"}>
        <auto_static x={"455"} y={"0"} width={"114"} height={"41"}>
          <texture>ui_inGame2_Mp_HUD_DM</texture>
        </auto_static>
      </global>
    </w>
  );
}
