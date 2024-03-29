import { JSXNode, JSXXML } from "jsx-xml";

import { gameConfig } from "@/engine/lib/configs/GameConfig";

/**
 * Generation of PDA rankings section UI forms for 16/9.
 */
export function create(): JSXNode {
  return (
    <w>
      <main_wnd x={"0"} y={"0"} width={"1024"} height={"768"} />

      <background x={"28"} y={"41"} width={"764"} height={"198"} stretch={"1"}>
        <texture>ui_inGame2_pda_buttons_background</texture>
        <auto_frameline x={"188"} y={"95"} width={"551"} height={"1"} vertical={"0"}>
          <texture>ui_inGame2_pda_line_horizontal</texture>
        </auto_frameline>
        <auto_frameline x={"188"} y={"142"} width={"551"} height={"1"} vertical={"0"}>
          <texture>ui_inGame2_pda_line_horizontal</texture>
        </auto_frameline>
        <auto_frameline x={"410"} y={"95"} width={"1"} height={"95"} vertical={"1"}>
          <texture>ui_inGame2_pda_line_vertical</texture>
        </auto_frameline>
      </background>

      <actor_ch_info x={"56"} y={"92"} width={"135"} height={"138"}>
        <name_static x={"2"} y={"112"} width={"131"} height={"26"}>
          <text align={"c"} vert_align={"c"} font={"graffiti19"} color={"ui_2"} />
        </name_static>
        <icon x={"2"} y={"2"} width={"131"} height={"108"} stretch={"1"} />
      </actor_ch_info>
      <actor_icon_over x={"56"} y={"92"} width={"135"} height={"138"} stretch={"1"}>
        <texture>ui_inGame2_pda_ranking_icon_over</texture>
      </actor_icon_over>

      <money_caption x={"664"} y={"103"} width={"80"} height={"16"}>
        <text align={"l"} font={"letterica18"} r={"220"} g={"220"} b={"220"}>
          ui_inv_money
        </text>
      </money_caption>
      <money_value x={"744"} y={"103"} width={"80"} height={"16"}>
        <text align={"l"} font={"letterica18"} r={"170"} g={"170"} b={"170"}>
          0 {gameConfig.CURRENCY}
        </text>
      </money_value>

      <stat_info>
        <value color={"ui_1"} />

        <stat x={"208"} y={"103"} width={"24"} height={"16"}>
          <text align={"l"} font={"letterica18"} r={"220"} g={"220"} b={"220"}>
            pda_stat_1
          </text>
        </stat>
        <stat x={"360"} y={"103"} width={"24"} height={"16"}>
          <text align={"l"} font={"letterica18"} r={"220"} g={"220"} b={"220"}>
            pda_stat_2
          </text>
        </stat>
        <stat x={"512"} y={"103"} width={"24"} height={"16"}>
          <text align={"l"} font={"letterica18"} r={"220"} g={"220"} b={"220"}>
            pda_stat_3
          </text>
        </stat>

        <stat x={"288"} y={"150"} width={"24"} height={"16"}>
          <text align={"l"} font={"letterica18"} r={"220"} g={"220"} b={"220"}>
            pda_stat_4
          </text>
        </stat>
        <stat x={"284"} y={"198"} width={"24"} height={"16"}>
          <text align={"l"} font={"letterica18"} r={"220"} g={"220"} b={"220"}>
            pda_stat_5
          </text>
        </stat>

        <stat x={"456"} y={"150"} width={"24"} height={"16"}>
          <text align={"l"} font={"letterica18"} r={"220"} g={"220"} b={"220"}>
            pda_stat_6
          </text>
        </stat>
        <stat x={"456"} y={"198"} width={"24"} height={"16"}>
          <text align={"l"} font={"letterica18"} r={"220"} g={"220"} b={"220"}>
            pda_stat_7
          </text>
        </stat>
      </stat_info>

      <center_caption x={"35"} y={"262"} width={"80"} height={"23"}>
        <text align={"c"} vert_align={"c"} font={"letterica16"} r={"100"} g={"100"} b={"100"} />
      </center_caption>

      <down_background x={"28"} y={"245"} width={"764"} height={"463"} stretch={"1"}>
        <texture>ui_inGame2_pda_buttons_background</texture>
        <auto_frameline x={"6"} y={"15"} width={"753"} height={"23"} vertical={"0"}>
          <texture>ui_inGame2_pda_ranking_center_caption</texture>
        </auto_frameline>
      </down_background>

      <monster_background x={"458"} y={"294"} width={"319"} height={"229"} stretch={"1"}>
        <texture>ui_inGame2_pda_ranking_icon_over</texture>
        <auto_static x={"6"} y={"0"} width={"308"} height={"25"} stretch={"1"}>
          <text align={"l"} vert_align={"c"} font={"letterica16"} r={"220"} g={"220"} b={"220"}>
            pda_stat_mutant_killed
          </text>
        </auto_static>
      </monster_background>
      <monster_over x={"460"} y={"319"} width={"315"} height={"202"} stretch={"1"}>
        <texture>ui_inGame2_pda_ranking_icon_over</texture>
      </monster_over>
      <monster_icon_back x={"460"} y={"319"} width={"314"} height={"200"} stretch={"1"} />
      <monster_icon x={"540"} y={"321"} width={"158"} height={"197"} stretch={"1"} />

      <favorite_weapon_ramka x={"458"} y={"533"} width={"319"} height={"162"} stretch={"1"}>
        <texture>ui_inGame2_pda_ranking_icon_over</texture>
        <auto_static x={"6"} y={"2"} width={"308"} height={"25"} vertical={"0"} stretch={"1"}>
          <text align={"l"} vert_align={"c"} font={"letterica16"} r={"220"} g={"220"} b={"220"}>
            pda_stat_favorite_weapon
          </text>
        </auto_static>
      </favorite_weapon_ramka>
      <favorite_weapon_over x={"460"} y={"561"} width={"315"} height={"132"} stretch={"1"}>
        <texture>ui_inGame2_pda_ranking_icon_over</texture>
      </favorite_weapon_over>
      <favorite_weapon_back x={"460"} y={"561"} width={"315"} height={"132"} stretch={"1"}>
        <texture>ui_inGame2_pda_favorite_weapon_background</texture>
      </favorite_weapon_back>
      <favorite_weapon_icon x={"620"} y={"625"} width={"184"} height={"80"} alignment={"c"} align={"c"} />

      <achievements_background x={"42"} y={"294"} width={"403"} height={"401"}>
        <texture>ui_inGame2_pda_ranking_icon_over</texture>
      </achievements_background>

      <achievements_wnd x={"59"} y={"304"} width={"374"} height={"381"} always_show_scroll={"0"} stretch={"1"} />
      <achievements_itm x={"0"} y={"0"} width={"374"} height={"127"} inverse_dir={"1"}>
        <name x={"106"} y={"3"} width={"256"} height={"25"}>
          <text align={"l"} font={"letterica18"} r={"200"} g={"200"} b={"200"}>
            test
          </text>
        </name>
        <icon x={"2"} y={"3"} width={"97"} height={"121"} stretch={"1"} />
        <descr x={"106"} y={"26"} width={"256"} height={"25"} complex_mode={"1"}>
          <text align={"l"} font={"letterica16"} r={"150"} g={"150"} b={"150"}>
            test
          </text>
        </descr>
        <hint_wnd x={"0"} y={"0"} width={"168"} height={"120"}>
          <background x={"0"} y={"0"} width={"168"} height={"100"} border={"5"} stretch={"1"}>
            <texture>ui_icons_PDA_tooltips</texture>
          </background>
          <text x={"8"} y={"10"} width={"152"} height={"100"}>
            <text font={"letterica16"} r={"150"} g={"150"} b={"150"} complex_mode={"1"} align={"l"} vert_align={"t"} />
          </text>
        </hint_wnd>
      </achievements_itm>
    </w>
  );
}
