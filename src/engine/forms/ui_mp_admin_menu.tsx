import { JSXNode, JSXXML } from "jsx-xml";

/**
 *  Used.
 *  Defined in C++ codebase: src/xrGame/ui/UIMPAdminMenu.h
 *  Defined in C++ codebase: src/xrGame/ui/UIMPAdminMenu.cpp
 */
export function create(): JSXNode {
  return (
    <w>
      <admin_menu x={"205"} y={"166"} width={"624"} height={"411"}>
        <background x={"0"} y={"0"} width={"624"} height={"411"}>
          <texture>ui_inGame2_screen_4</texture>
        </background>
        <tab_control x={"27"} y={"37"} width={"320"} height={"27"}>
          <button x={"0"} y={"0"} width={"172"} height={"27"} id={"players"} frame_mode={"0"}>
            <text align={"c"} vert_align={"c"} x={"0"} y={"0"} width={"157"} height={"27"} font={"letterica16"}>
              Players
            </text>
            <texture>ui_inGame2_pda_button</texture>
            <text_color>
              <t r={"255"} g={"255"} b={"255"} />
              <d r={"255"} g={"255"} b={"255"} />
              <e r={"200"} g={"200"} b={"200"} />
              <h r={"170"} g={"170"} b={"170"} />
            </text_color>
          </button>
          <button x={"148"} y={"0"} width={"172"} height={"27"} id={"server"} frame_mode={"0"}>
            <text align={"c"} vert_align={"c"} x={"0"} y={"0"} font={"letterica16"}>
              Server
            </text>
            <texture>ui_inGame2_pda_button</texture>
            <text_color>
              <t r={"255"} g={"255"} b={"255"} />
              <d r={"255"} g={"255"} b={"255"} />
              <e r={"200"} g={"200"} b={"200"} />
              <h r={"170"} g={"170"} b={"170"} />
            </text_color>
          </button>
        </tab_control>
        <close_button x={"259"} y={"381"} width={"134"} height={"26"} stretch={"1"}>
          <texture>ui_inGame2_inventory_button</texture>
          <text font={"letterica18"} align={"c"}>
            Close
          </text>
        </close_button>
        <players_adm x={"14"} y={"72"} width={"610"} height={"340"}>
          <players_list
            x={"15"}
            y={"10"}
            width={"345"}
            height={"265"}
            item_height={"18"}
            always_show_scroll={"1"}
            can_select={"1"}
          >
            <font font={"letterica16"} />
          </players_list>
          <refresh_button x={"85"} y={"275"} width={"200"} height={"26"} stretch={"1"}>
            <texture>ui_inGame2_inventory_button</texture>
            <text font={"letterica18"} align={"c"}>
              Refresh list
            </text>
          </refresh_button>
          <screen_all_button x={"395"} y={"10"} width={"200"} height={"26"} stretch={"1"}>
            <texture>ui_inGame2_inventory_button</texture>
            <text font={"letterica18"} align={"c"}>
              Screen all
            </text>
          </screen_all_button>
          <config_all_button x={"395"} y={"40"} width={"200"} height={"26"} stretch={"1"}>
            <texture>ui_inGame2_inventory_button</texture>
            <text font={"letterica18"} align={"c"}>
              Config all
            </text>
          </config_all_button>
          <max_ping_limit_text x={"395"} y={"70"} width={"200"} height={"16"}>
            <text r={"170"} g={"170"} b={"170"} font={"letterica16"} align={"c"} vert_align={"c"}>
              Ping limit: 200
            </text>
          </max_ping_limit_text>
          <max_ping_limit_track x={"395"} y={"90"} width={"200"} height={"16"} step={"1"} is_integer={"1"}>
            <options_item entry={"sv_adm_menu_ping_limit"} group={"mm_mp_server"} depend={"runtime"} />
          </max_ping_limit_track>
          <max_ping_limit_button x={"395"} y={"110"} width={"200"} height={"26"} stretch={"1"}>
            <texture>ui_inGame2_inventory_button</texture>
            <text font={"letterica18"} align={"c"}>
              Max ping limit
            </text>
          </max_ping_limit_button>
          <screen_player_button x={"395"} y={"140"} width={"200"} height={"26"} stretch={"1"}>
            <texture>ui_inGame2_inventory_button</texture>
            <text font={"letterica18"} align={"c"}>
              Screen selected player
            </text>
          </screen_player_button>
          <config_player_button x={"395"} y={"170"} width={"200"} height={"26"} stretch={"1"}>
            <texture>ui_inGame2_inventory_button</texture>
            <text font={"letterica18"} align={"c"}>
              Config selected player
            </text>
          </config_player_button>
          <kick_player_button x={"395"} y={"200"} width={"200"} height={"26"} stretch={"1"}>
            <texture>ui_inGame2_inventory_button</texture>
            <text font={"letterica18"} align={"c"}>
              Kick selected player
            </text>
          </kick_player_button>
          <ban_time_text x={"395"} y={"230"} width={"200"} height={"16"}>
            <text r={"170"} g={"170"} b={"170"} font={"letterica16"} align={"c"} vert_align={"c"}>
              Ban time (minutes): 60
            </text>
          </ban_time_text>
          <ban_time_track x={"395"} y={"250"} width={"200"} height={"16"} step={"1"} is_integer={"1"}>
            <options_item entry={"sv_adm_menu_ban_time"} group={"mm_mp_server"} depend={"runtime"} />
          </ban_time_track>
          <ban_player_button x={"395"} y={"270"} width={"200"} height={"26"} stretch={"1"}>
            <texture>ui_inGame2_inventory_button</texture>
            <text font={"letterica18"} align={"c"}>
              Ban selected player
            </text>
          </ban_player_button>
        </players_adm>
        <server_adm x={"14"} y={"72"} width={"610"} height={"340"}></server_adm>
      </admin_menu>
    </w>
  );
}
