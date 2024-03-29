import { JSXNode, JSXXML } from "jsx-xml";

/**
 * Generation of multiplayer team selection UI forms for 16/9.
 */
export function create(): JSXNode {
  return (
    <window>
      <team_selector x={"218"} y={"115"} width={"579"} height={"526"}>
        <background x={"0"} y={"0"} width={"579"} height={"526"} stretch={"1"}>
          <texture>ui_inGame2_Mp_screen_main_window</texture>
        </background>
        <caption x={"160"} y={"4"} width={"264"} height={"32"}>
          <text font={"letterica18"} r={"200"} g={"200"} b={"200"} align={"c"} vert_align={"c"}>
            mp_team_selection
          </text>
        </caption>

        <image_frames_tl x={"26"} y={"42"} width={"259"} height={"234"} stretch={"1"}>
          <texture>ui_inGame2_Mp_screen_map_window</texture>
        </image_frames_tl>
        <image_frames_tr x={"292"} y={"42"} width={"259"} height={"234"} stretch={"1"}>
          <texture>ui_inGame2_Mp_screen_map_window</texture>
        </image_frames_tr>
        <image_0 x={"26"} y={"42"} width={"259"} height={"234"} stretch={"1"}>
          <texture>freedom_big</texture>
        </image_0>
        <image_1 x={"292"} y={"42"} width={"259"} height={"234"} stretch={"1"}>
          <texture>merc_big</texture>
        </image_1>

        <text_desc x={"35"} y={"303"} width={"526"} height={"144"} complex_mode={"1"}>
          <text font={"letterica18"} r={"192"} g={"168"} b={"144"}>
            team_1_name
          </text>
          <text font={"letterica18"}>\n </text>
          <text font={"letterica18"} r={"106"} g={"95"} b={"91"}>
            team_1_desc
          </text>
          <text font={"letterica18"}>\n </text>
          <text font={"letterica18"} r={"192"} g={"168"} b={"144"}>
            team_2_name
          </text>
          <text font={"letterica18"} r={"106"} g={"95"} b={"91"}>
            team_2_desc
          </text>
        </text_desc>

        <btn_back x={"124"} y={"482"} width={"110"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_Mp_bigbuttone</texture>
          <text font={"graffiti19"} align={"c"} a={"170"}>
            mp_back
          </text>
          <text_color>
            <e r={"227"} g={"199"} b={"178"} />
            <t r={"180"} g={"153"} b={"155"} />
            <d r={"106"} g={"95"} b={"91"} />
            <h r={"0"} g={"0"} b={"0"} />
          </text_color>
        </btn_back>
        <btn_autoselect x={"235"} y={"482"} width={"110"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_Mp_bigbuttone</texture>
          <text font={"graffiti19"} align={"c"} a={"170"}>
            mp_auto_select
          </text>
          <text_color>
            <e r={"227"} g={"199"} b={"178"} />
            <t r={"180"} g={"153"} b={"155"} />
            <d r={"106"} g={"95"} b={"91"} />
            <h r={"0"} g={"0"} b={"0"} />
          </text_color>
        </btn_autoselect>
        <btn_spectator x={"346"} y={"482"} width={"110"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_Mp_bigbuttone</texture>
          <text font={"graffiti19"} align={"c"} a={"170"}>
            mp_spectator
          </text>
          <text_color>
            <e r={"227"} g={"199"} b={"178"} />
            <t r={"180"} g={"153"} b={"155"} />
            <d r={"106"} g={"95"} b={"91"} />
            <h r={"0"} g={"0"} b={"0"} />
          </text_color>
        </btn_spectator>
      </team_selector>
    </window>
  );
}
