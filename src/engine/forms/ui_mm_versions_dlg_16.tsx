import { JSXNode, JSXXML } from "jsx-xml";

/**
 * Creation of ui components related to main menu versions dialog (16/9).
 */
export function create(): JSXNode {
  return (
    <w>
      <background x={"0"} y={"0"} width={"1024"} height={"768"}>
        <auto_static x={"500"} y={"130"} width={"345"} height={"160"} stretch={"1"}>
          <texture width={"432"} height={"160"}>
            ui\video_voroni_crop
          </texture>
        </auto_static>
        <auto_static x={"432"} y={"353"} width={"460"} height={"416"} stretch={"1"}>
          <texture x={"0"} y={"0"} width={"576"} height={"416"}>
            ui\video_water_crop
          </texture>
        </auto_static>
        <auto_static x={"102"} y={"0"} width={"819"} height={"768"} stretch={"1"}>
          <texture>ui_inGame2_background</texture>
        </auto_static>
        <auto_static x={"0"} y={"0"} width={"104"} height={"768"} stretch={"1"}>
          <texture>ui_inGame2_left_widepanel</texture>
        </auto_static>
        <auto_static x={"920"} y={"0"} width={"104"} height={"768"} stretch={"1"}>
          <texture>ui_inGame2_right_widepanel</texture>
        </auto_static>
        <auto_static x={"135"} y={"278"} width={"230"} height={"428"} stretch={"1"}>
          <texture>ui_save_load_back</texture>
        </auto_static>
      </background>

      <form x={"209"} y={"180"} width={"560"} height={"460"} stretch={"1"}>
        <texture>ui_inGame2_main_window_small</texture>
        <caption x={"0"} y={"20"} width={"467"} height={"30"}>
          <text font={"graffiti32"} align={"c"}></text>
        </caption>

        <description x={"235"} y={"80"} width={"209"} height={"300"} complex_mode={"1"}>
          <text font={"graffiti22"} align={"l"}></text>
        </description>

        <btn_cancel x={"314"} y={"427"} width={"108"} height={"26"} stretch={"1"}>
          <texture>ui_inGame2_Mp_bigbuttone</texture>
          <text font={"letterica18"}>ui_mm_cancel</text>
        </btn_cancel>

        <btn_start x={"180"} y={"427"} width={"135"} height={"26"}>
          <texture>ui_inGame2_Mp_bigbuttone</texture>
          <text font={"letterica18"}>ui_mm_apply</text>
        </btn_start>

        <ver_list x={"50"} y={"60"} width={"180"} height={"300"}>
          <list_versions
            x={"2"}
            y={"17"}
            width={"166"}
            height={"290"}
            item_height={"18"}
            always_show_scroll={"1"}
            can_select={"1"}
          >
            <font font={"arial_14"} />
          </list_versions>
          <frame x={"0"} y={"13"} width={"170"} height={"294"}>
            <texture>ui_inGame2_servers_list_frame</texture>
          </frame>
          <header x={"0"} y={"0"} width={"170"} height={"15"}>
            <texture>ui_inGame2_servers_list_button</texture>
            <auto_static x={"0"} y={"0"} width={"150"} height={"15"}>
              <text font={"arial_14"} vert_align={"c"} align={"c"}>
                version
              </text>
            </auto_static>
          </header>
        </ver_list>
      </form>
    </w>
  );
}
