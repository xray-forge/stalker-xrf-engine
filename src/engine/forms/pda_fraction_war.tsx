import { JSXNode, JSXXML } from "jsx-xml";

/**
 * Generation of PDA faction wars section UI forms.
 */
export function create(): JSXNode {
  return (
    <w>
      <main_wnd x={"0"} y={"0"} width={"1024"} height={"768"} update_delay={"2900"} />

      <background x={"35"} y={"89"} width={"955"} height={"620"} vertical={"1"}>
        <texture>ui_pda2_fr</texture>
      </background>

      <center_background x={"35"} y={"340"} width={"955"} height={"103"}>
        <texture>ui_pda2_fr_delimiter_fraction</texture>
      </center_background>

      <target_static x={"320"} y={"93"} width={"390"} height={"16"}>
        <text font={"letterica16"} align={"c"} r={"250"} g={"250"} b={"250"} a={"100"}>
          ui_st_target_static
        </text>
      </target_static>

      <target_caption x={"320"} y={"120"} width={"390"} height={"25"} complex_mode={"1"}>
        <text font={"letterica25"} align={"c"} vert_align={"c"} r={"250"} g={"250"} b={"250"} a={"255"}>
          target
        </text>
      </target_caption>

      <target_decs x={"320"} y={"150"} width={"390"} height={"115"}>
        <text font={"letterica16"} align={"c"} r={"200"} g={"200"} b={"200"} a={"150"} complex_mode={"1"}></text>
      </target_decs>

      <state_static x={"320"} y={"278"} width={"390"} height={"16"}>
        <text font={"letterica16"} align={"c"} vert_align={"c"} r={"250"} g={"250"} b={"250"} a={"100"}>
          ui_st_state_confrontation
        </text>
      </state_static>

      <static_our_icon x={"50"} y={"93"} width={"251"} height={"196"} stretch={"1"} />
      <static_enemy_icon x={"720"} y={"93"} width={"251"} height={"196"} stretch={"1"} />

      <static_our_icon_over x={"50"} y={"93"} width={"251"} height={"196"}>
        <texture>ui_fm_over_fraction_logo_l</texture>
      </static_our_icon_over>
      <static_enemy_icon_over x={"720"} y={"93"} width={"251"} height={"196"}>
        <texture>ui_fm_over_fraction_logo_r</texture>
      </static_enemy_icon_over>

      <static_our_name x={"50"} y={"308"} width={"200"} height={"25"}>
        <text font={"letterica25"} align={"l"} r={"250"} g={"250"} b={"250"} a={"255"}>
          our name
        </text>
      </static_our_name>
      <static_enemy_name x={"770"} y={"308"} width={"200"} height={"25"}>
        <text font={"letterica25"} align={"r"} r={"250"} g={"250"} b={"250"} a={"255"}>
          enemy name
        </text>
      </static_enemy_name>

      <static_our_frac_info x={"62"} y={"378"} width={"160"} height={"16"}>
        <text font={"letterica16"} align={"l"} r={"250"} g={"250"} b={"250"} a={"100"}>
          ui_st_our_frac_info
        </text>
      </static_our_frac_info>
      <static_enemy_frac_info x={"803"} y={"378"} width={"160"} height={"16"}>
        <text font={"letterica16"} align={"r"} r={"250"} g={"250"} b={"250"} a={"100"}>
          ui_st_enemy_frac_info
        </text>
      </static_enemy_frac_info>

      <static_our_mem_count x={"62"} y={"450"} width={"180"} height={"16"}>
        <text font={"letterica16"} align={"l"} r={"250"} g={"250"} b={"250"} a={"150"}>
          ui_st_our_mem_count
        </text>
      </static_our_mem_count>
      <static_enemy_mem_count x={"783"} y={"450"} width={"180"} height={"16"}>
        <text font={"letterica16"} align={"r"} r={"250"} g={"250"} b={"250"} a={"150"}>
          ui_st_enemy_mem_count
        </text>
      </static_enemy_mem_count>

      <static_our_resource x={"62"} y={"530"} width={"180"} height={"16"}>
        <text font={"letterica16"} align={"l"} r={"250"} g={"250"} b={"250"} a={"150"}>
          ui_st_our_resource
        </text>
      </static_our_resource>
      <static_enemy_resource x={"783"} y={"530"} width={"180"} height={"16"}>
        <text font={"letterica16"} align={"r"} r={"250"} g={"250"} b={"250"} a={"150"}>
          ui_st_enemy_resource
        </text>
      </static_enemy_resource>

      <progress_our_state x={"282"} y={"300"} width={"220"} height={"57"} min={"0"} max={"100"} pos={"0"} mode={"horz"}>
        <progress>
          <texture color={"pda_green"}>ui_pda2_big_progress</texture>
        </progress>
        <background>
          <texture a={"60"}>ui_pda2_big_progress2</texture>
        </background>
      </progress_our_state>
      <progress_enemy_state
        x={"525"}
        y={"300"}
        width={"220"}
        height={"57"}
        min={"0"}
        max={"100"}
        pos={"0"}
        mode={"back"}
      >
        <progress>
          <texture color={"pda_green"}>ui_pda2_big_progress</texture>
        </progress>
        <background>
          <texture a={"60"}>ui_pda2_big_progress2</texture>
        </background>
      </progress_enemy_state>

      <progress_our_mem_count
        x={"62"}
        y={"470"}
        width={"433"}
        height={"38"}
        min={"0"}
        max={"100"}
        pos={"0"}
        mode={"horz"}
      >
        <progress>
          <texture color={"pda_yellow"}>ui_pda2_small_progress</texture>
        </progress>
        <background>
          <texture a={"60"}>ui_pda2_small_progress2</texture>
        </background>
      </progress_our_mem_count>
      <progress_enemy_mem_count
        x={"530"}
        y={"470"}
        width={"433"}
        height={"38"}
        min={"0"}
        max={"100"}
        pos={"0"}
        mode={"back"}
      >
        <progress>
          <texture color={"pda_yellow"}>ui_pda2_small_progress</texture>
        </progress>
        <background>
          <texture a={"60"}>ui_pda2_small_progress2</texture>
        </background>
      </progress_enemy_mem_count>

      <progress_our_resource
        x={"62"}
        y={"550"}
        width={"433"}
        height={"38"}
        min={"0"}
        max={"100"}
        pos={"0"}
        mode={"horz"}
      >
        <progress>
          <texture color={"pda_yellow"}>ui_pda2_small_progress</texture>
        </progress>
        <background>
          <texture a={"60"}>ui_pda2_small_progress2</texture>
        </background>
      </progress_our_resource>
      <progress_enemy_resource
        x={"530"}
        y={"550"}
        width={"433"}
        height={"38"}
        min={"0"}
        max={"100"}
        pos={"0"}
        mode={"back"}
      >
        <progress>
          <texture color={"pda_yellow"}>ui_pda2_small_progress</texture>
        </progress>
        <background>
          <texture a={"60"}>ui_pda2_small_progress2</texture>
        </background>
      </progress_enemy_resource>

      <static_vs_state x={"310"} y={"370"} width={"65"} height={"31"} dx={"20"} xcenter={"512"} delay={"700"}>
        <img x={"0"} y={"0"} width={"65"} height={"31"}></img>
      </static_vs_state>

      <static_our_bonuce x={"62"} y={"620"} width={"1"} height={"1"} dx={"14"} stretch={"1"}>
        <texture a={"0"}>ui_fm_base_bonuse</texture>
      </static_our_bonuce>
      <static_enemy_bonuce x={"530"} y={"620"} width={"1"} height={"1"} dx={"14"} stretch={"1"}>
        <texture a={"0"}>ui_fm_base_bonuse</texture>
      </static_enemy_bonuce>

      <static_line1 x={"312"} y={"112"} width={"401"} height={"3"}>
        <texture>ui_pda2_line_h</texture>
      </static_line1>
      <static_line2 x={"312"} y={"270"} width={"401"} height={"4"}>
        <texture>ui_pda2_line_d</texture>
      </static_line2>
      <static_line3 x={"512"} y={"300"} width={"3"} height={"57"} vertical={"1"}>
        <texture>ui_pda2_line_v</texture>
      </static_line3>
      <static_line4 x={"512"} y={"450"} width={"3"} height={"248"} vertical={"1"}>
        <texture>ui_pda2_line_v</texture>
      </static_line4>

      <static_line_left x={"53"} y={"398"} width={"190"} height={"4"}>
        <texture>ui_pda2_line_d</texture>
      </static_line_left>
      <static_line_right x={"783"} y={"398"} width={"190"} height={"4"}>
        <texture>ui_pda2_line_d</texture>
      </static_line_right>
    </w>
  );
}
