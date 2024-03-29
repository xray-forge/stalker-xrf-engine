import { JSXNode, JSXXML } from "jsx-xml";

/**
 * Create UI forms related to team panels in deathmatch mode for multiplayer.
 */
export function create(): JSXNode {
  return (
    <w>
      <team_panels_wnd x={"300"} y={"65"} width={"444"} height={"679"}>
        <frame className={"static"} x={"0"} y={"0"} width={"444"} height={"679"}>
          <texture>ui_inGame2_screen_3</texture>
        </frame>
        <team tname={"greenteam"} x={"0"} y={"0"} width={"444"} height={"489"}>
          <auto_static x={"45"} y={"41"} width={"80"}>
            <text font={"letterica18"} r={"170"} g={"170"} b={"170"}>
              mp_team_free_stalkers
            </text>
          </auto_static>
          <scroll_panels count={"1"}>
            <panel number={"0"}>
              <scroll_panel
                x={"31"}
                y={"108"}
                width={"395"}
                height={"370"}
                always_show_scroll={"0"}
                vert_interval={"20"}
                left_ident={"10"}
              />
              <team_header x={"31"} y={"36"} width={"395"} height={"66"}>
                <field name={"mp_players"} x={"210"} y={"7"} width={"60"}>
                  <text font={"letterica16"} r={"120"} g={"120"} b={"120"} />
                </field>
                <field name={"mp_frags_upcase"} x={"300"} y={"7"} width={"80"}>
                  <text font={"letterica16"} r={"120"} g={"120"} b={"120"} />
                </field>
                <column name={"mp_name"} x={"0"} y={"45"} width={"165"} height={"21"}>
                  <text vert_align={"c"} align={"c"} font={"letterica16"} r={"120"} g={"120"} b={"120"}>
                    mp_name
                  </text>
                </column>
                <auto_frameline x={"166"} y={"72"} width={"1"} height={"370"} vertical={"1"}>
                  <texture>ui_inGame2_pda_line_vertical</texture>
                </auto_frameline>
                <column name={"mp_frags"} x={"166"} y={"41"} width={"45"} height={"26"} />
                <auto_frameline x={"212"} y={"72"} width={"1"} height={"370"} vertical={"1"}>
                  <texture>ui_inGame2_pda_line_vertical</texture>
                </auto_frameline>
                <column name={"mp_deaths"} x={"212"} y={"41"} width={"45"} height={"26"} />
                <auto_frameline x={"258"} y={"72"} width={"1"} height={"370"} vertical={"1"}>
                  <texture>ui_inGame2_pda_line_vertical</texture>
                </auto_frameline>
                <auto_frameline x={"304"} y={"72"} width={"1"} height={"370"} vertical={"1"}>
                  <texture>ui_inGame2_pda_line_vertical</texture>
                </auto_frameline>
                <column name={"mp_status"} x={"304"} y={"41"} width={"45"} height={"26"} />
                <auto_frameline x={"350"} y={"72"} width={"1"} height={"370"} vertical={"1"}>
                  <texture>ui_inGame2_pda_line_vertical</texture>
                </auto_frameline>
                <column name={"mp_ping"} x={"350"} y={"41"} width={"45"} height={"26"} />
              </team_header>
            </panel>
          </scroll_panels>
          <player_item>
            <textparam name={"mp_name"} x={"10"} y={"0"} width={"155"} height={"16"}>
              <text font={"letterica16"} r={"170"} g={"170"} b={"170"} align={"l"} />
            </textparam>
            <textparam name={"mp_frags"} x={"166"} y={"0"} width={"45"} height={"16"}>
              <text font={"letterica16"} r={"170"} g={"170"} b={"170"} align={"c"} />
            </textparam>
            <textparam name={"mp_deaths"} x={"212"} y={"0"} width={"45"} height={"16"}>
              <text font={"letterica16"} r={"170"} g={"170"} b={"170"} align={"c"} />
            </textparam>
            <iconparam name={"rank"} x={"318"} y={"0"} width={"16"} height={"16"} stretch={"1"} />
            <iconparam name={"death_atf"} x={"335"} y={"0"} width={"16"} height={"16"} stretch={"1"} />
            <textparam name={"mp_ping"} x={"350"} y={"0"} width={"45"} height={"16"}>
              <text font={"letterica16"} r={"170"} g={"170"} b={"170"} align={"c"} />
            </textparam>
          </player_item>
          <local_player_item>
            <auto_static x={"0"} y={"0"} width={"390"} height={"16"} stretch={"1"}>
              <texture a={"200"}>ui_inGame2_mp_screen_selection</texture>
            </auto_static>
            <textparam name={"mp_name"} x={"10"} y={"0"} width={"155"} height={"16"}>
              <text font={"letterica16"} r={"170"} g={"170"} b={"170"} align={"l"} />
            </textparam>
            <textparam name={"mp_frags"} x={"166"} y={"0"} width={"45"} height={"16"}>
              <text font={"letterica16"} r={"170"} g={"170"} b={"170"} align={"c"} />
            </textparam>
            <textparam name={"mp_deaths"} x={"212"} y={"0"} width={"45"} height={"16"}>
              <text font={"letterica16"} r={"170"} g={"170"} b={"170"} align={"c"} />
            </textparam>
            <iconparam name={"rank"} x={"318"} y={"0"} width={"16"} height={"16"} stretch={"1"} />
            <iconparam name={"death_atf"} x={"335"} y={"0"} width={"16"} height={"16"} stretch={"1"} />
            <textparam name={"mp_ping"} x={"350"} y={"0"} width={"45"} height={"16"}>
              <text font={"letterica16"} r={"170"} g={"170"} b={"170"} align={"c"} />
            </textparam>
          </local_player_item>
        </team>
        <team tname={"spectatorsteam"} x={"0"} y={"489"} width={"444"} height={"190"}>
          <auto_static x={"130"} y={"5"} width={"193"} height={"16"}>
            <text font={"letterica16"} r={"120"} g={"120"} b={"120"} align={"c"}>
              mp_spectators
            </text>
          </auto_static>
          <scroll_panels count={"1"}>
            <panel number={"0"}>
              <scroll_panel
                x={"31"}
                y={"30"}
                width={"395"}
                height={"145"}
                always_show_scroll={"0"}
                vert_interval={"20"}
              />
              <team_header x={"31"} y={"0"} width={"395"} height={"20"}>
                <auto_frameline x={"350"} y={"30"} width={"1"} height={"145"} vertical={"1"}>
                  <texture>ui_inGame2_pda_line_vertical</texture>
                </auto_frameline>
              </team_header>
            </panel>
          </scroll_panels>
          <player_item>
            <textparam name={"mp_name"} x={"10"} y={"0"} width={"155"} height={"16"}>
              <text font={"letterica16"} r={"170"} g={"170"} b={"170"} align={"l"} />
            </textparam>
            <textparam name={"mp_ping"} x={"350"} y={"0"} width={"45"} height={"16"}>
              <text font={"letterica16"} r={"170"} g={"170"} b={"170"} align={"c"} />
            </textparam>
          </player_item>
          <local_player_item>
            <auto_static x={"0"} y={"0"} width={"390"} height={"16"} stretch={"1"}>
              <texture>ui_inGame2_mp_screen_selection</texture>
            </auto_static>
            <textparam name={"mp_name"} x={"10"} y={"0"} width={"155"} height={"16"}>
              <text font={"letterica16"} r={"170"} g={"170"} b={"170"} align={"l"} />
            </textparam>
            <textparam name={"mp_ping"} x={"350"} y={"0"} width={"45"} height={"16"}>
              <text font={"letterica16"} r={"170"} g={"170"} b={"170"} align={"c"} />
            </textparam>
          </local_player_item>
        </team>
        <team tname={"greenteam_pending"} x={"0"} y={"0"} width={"444"} height={"489"}>
          <auto_static x={"45"} y={"41"} width={"80"}>
            <text font={"letterica18"} r={"170"} g={"170"} b={"170"}>
              mp_team_free_stalkers
            </text>
          </auto_static>
          <scroll_panels count={"1"}>
            <panel number={"0"}>
              <scroll_panel
                x={"31"}
                y={"108"}
                width={"399"}
                height={"370"}
                always_show_scroll={"0"}
                vert_interval={"20"}
                left_ident={"10"}
              />
              <team_header x={"31"} y={"36"} width={"399"} height={"66"}>
                <field name={"mp_players"} x={"210"} y={"7"} width={"60"}>
                  <text font={"letterica16"} r={"120"} g={"120"} b={"120"} />
                </field>
                <column name={"mp_name"} x={"0"} y={"45"} width={"165"} height={"21"}>
                  <text vert_align={"c"} align={"c"} font={"letterica16"} r={"120"} g={"120"} b={"120"}>
                    mp_name
                  </text>
                </column>
                <auto_frameline x={"166"} y={"72"} width={"1"} height={"370"} vertical={"1"}>
                  <texture>ui_inGame2_pda_line_vertical</texture>
                </auto_frameline>
                <auto_frameline x={"212"} y={"72"} width={"1"} height={"370"} vertical={"1"}>
                  <texture>ui_inGame2_pda_line_vertical</texture>
                </auto_frameline>
                <auto_frameline x={"258"} y={"72"} width={"1"} height={"370"} vertical={"1"}>
                  <texture>ui_inGame2_pda_line_vertical</texture>
                </auto_frameline>
                <auto_frameline x={"304"} y={"72"} width={"1"} height={"370"} vertical={"1"}>
                  <texture>ui_inGame2_pda_line_vertical</texture>
                </auto_frameline>
                <column name={"mp_status"} x={"304"} y={"41"} width={"45"} height={"26"} />
                <auto_frameline x={"350"} y={"72"} width={"1"} height={"370"} vertical={"1"}>
                  <texture>ui_inGame2_pda_line_vertical</texture>
                </auto_frameline>
                <column name={"mp_ping"} x={"350"} y={"41"} width={"45"} height={"26"} />
              </team_header>
            </panel>
          </scroll_panels>
          <player_item>
            <textparam name={"mp_name"} x={"10"} y={"0"} width={"155"} height={"16"}>
              <text font={"letterica16"} r={"170"} g={"170"} b={"170"} align={"l"} />
            </textparam>
            <textparam name={"mp_status"} x={"304"} y={"0"} width={"45"} height={"16"}>
              <text font={"letterica16"} r={"170"} g={"170"} b={"170"} align={"c"} />
            </textparam>
            <textparam name={"mp_ping"} x={"350"} y={"0"} width={"45"} height={"16"}>
              <text font={"letterica16"} r={"170"} g={"170"} b={"170"} align={"c"} />
            </textparam>
          </player_item>
          <local_player_item>
            <auto_static x={"0"} y={"0"} width={"387"} height={"16"} stretch={"1"}>
              <texture a={"200"}>ui_inGame2_mp_screen_selection</texture>
            </auto_static>
            <textparam name={"mp_name"} x={"10"} y={"0"} width={"155"} height={"16"}>
              <text font={"letterica16"} r={"170"} g={"170"} b={"170"} align={"l"} />
            </textparam>
            <textparam name={"mp_status"} x={"304"} y={"0"} width={"45"} height={"16"}>
              <text font={"letterica16"} r={"170"} g={"170"} b={"170"} align={"c"} />
            </textparam>
            <textparam name={"mp_ping"} x={"350"} y={"0"} width={"45"} height={"16"}>
              <text font={"letterica16"} r={"170"} g={"170"} b={"170"} align={"c"} />
            </textparam>
          </local_player_item>
        </team>
      </team_panels_wnd>
    </w>
  );
}
