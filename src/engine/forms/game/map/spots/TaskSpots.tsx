import { Fragment, JSXNode, JSXXML } from "jsx-xml";

/**
 *
 */
export function TaskSpots(): JSXNode {
  return (
    <Fragment>
      <storyline_task_location>
        <level_map spot={"storyline_task_spot"} pointer={"quest_pointer2"} />
        <mini_map spot={"storyline_task_spot_mini"} pointer={"quest_pointer2"} />
      </storyline_task_location>
      <storyline_task_spot
        x={"0"}
        y={"0"}
        width={"19"}
        height={"19"}
        stretch={"1"}
        alignment={"c"}
        location_level={"5"}
      >
        <texture>ui_inGame2_PDA_icon_Primary_mission</texture>
        <static_border
          x={"-4"}
          y={"-5"}
          width={"29"}
          height={"29"}
          stretch={"1"}
          light_anim={"ui_slow_blinking_alpha"}
          la_cyclic={"1"}
          la_texture={"1"}
          la_text={"0"}
          la_alpha={"1"}
        >
          <texture r={"242"} g={"231"} b={"11"}>
            ui_pda2_stask_last_02
          </texture>
        </static_border>
      </storyline_task_spot>

      <storyline_task_spot_mini
        x={"0"}
        y={"0"}
        width={"19"}
        height={"19"}
        stretch={"1"}
        alignment={"c"}
        location_level={"5"}
      >
        <texture>ui_inGame2_PDA_icon_Primary_mission</texture>
        <static_border
          x={"-4"}
          y={"-5"}
          width={"29"}
          height={"29"}
          stretch={"1"}
          light_anim={"ui_slow_blinking_alpha"}
          la_cyclic={"1"}
          la_texture={"1"}
          la_text={"0"}
          la_alpha={"1"}
        >
          <texture r={"242"} g={"231"} b={"11"}>
            ui_mmap_stask_last_02
          </texture>
        </static_border>
        <texture_below>storyline_task_spot_below</texture_below>
        <texture_above>storyline_task_spot_above</texture_above>
      </storyline_task_spot_mini>
      {/** <!-- Второстепенные задания --> */}
      <secondary_task_location>
        <level_map spot={"secondary_task_spot"} pointer={"quest_pointer"} />
        <mini_map spot={"secondary_task_spot_mini"} pointer={"quest_pointer"} />
      </secondary_task_location>

      <secondary_task_spot
        x={"0"}
        y={"0"}
        width={"19"}
        height={"19"}
        stretch={"1"}
        alignment={"c"}
        location_level={"5"}
      >
        <texture>ui_inGame2_PDA_icon_Secondary_mission</texture>
        <static_border
          x={"-4"}
          y={"-5"}
          width={"29"}
          height={"29"}
          stretch={"1"}
          light_anim={"ui_slow_blinking_alpha"}
          la_cyclic={"1"}
          la_texture={"1"}
          la_text={"0"}
          la_alpha={"1"}
        >
          <texture>ui_pda2_stask_last_02</texture>
        </static_border>
      </secondary_task_spot>

      <secondary_task_spot_mini
        x={"0"}
        y={"0"}
        width={"19"}
        height={"19"}
        stretch={"1"}
        alignment={"c"}
        location_level={"5"}
      >
        <texture>ui_inGame2_PDA_icon_Secondary_mission</texture>
        <static_border
          x={"-4"}
          y={"-5"}
          width={"29"}
          height={"29"}
          stretch={"1"}
          light_anim={"ui_slow_blinking_alpha"}
          la_cyclic={"1"}
          la_texture={"1"}
          la_text={"0"}
          la_alpha={"1"}
        >
          <texture>ui_mmap_stask_last_02</texture>
        </static_border>
        <texture_below>secondary_task_spot_below</texture_below>
        <texture_above>secondary_task_spot_above</texture_above>
      </secondary_task_spot_mini>

      {/** <!--task_highlight --> */}
      <ui_storyline_task_blink ttl={"15"} hint={"disable_hint"} location_level={"-1"}>
        <level_map spot={"ui_storyline_task_blink_spot"} />
      </ui_storyline_task_blink>
      <ui_storyline_task_blink_spot
        x={"-8"}
        y={"-10"}
        width={"39"}
        height={"39"}
        stretch={"1"}
        light_anim={"new_task_highlight"}
        light_anim_cyclic={"1"}
        la_texture={"1"}
        xform_anim={"new_task_highlight_xform"}
        xform_anim_cyclic={"1"}
        alignment={"c"}
        location_level={"-1"}
      >
        <texture>ui_pda2_stask_last_01a</texture>
      </ui_storyline_task_blink_spot>

      <ui_secondary_task_blink ttl={"15"} hint={"disable_hint"} location_level={"-1"}>
        <level_map spot={"ui_secondary_task_blink_spot"} />
      </ui_secondary_task_blink>
      <ui_secondary_task_blink_spot
        x={"-8"}
        y={"-40"}
        width={"39"}
        height={"39"}
        stretch={"1"}
        light_anim={"new_task_highlight_00"}
        light_anim_cyclic={"1"}
        la_texture={"1"}
        xform_anim={"new_task_highlight_xform"}
        xform_anim_cyclic={"1"}
        alignment={"c"}
        location_level={"-1"}
      >
        <texture>ui_pda2_stask_last_01a</texture>
      </ui_secondary_task_blink_spot>

      {/* <!-- <secondary_na_border x="0" y="0" width="37" height="37" alignment="c" stretch="1" scale_min="2.5"
   scale_max="4.1" scale="1" location_level="5">
   <texture r="0" g="154" b="218">ui_pda2_hl_quest_base</texture>
   </secondary_na_border>
   <secondary_mini_na_border x="0" y="0" width="18" height="18" alignment="c" stretch="1" scale_min="2.5"
   scale_max="4.1" scale="1" location_level="5">
   <texture r="0" g="154" b="218">ui_pda2_hl_quest_base</texture>
   </secondary_mini_na_border>

   <secondary_ac_border x="0" y="0" width="37" height="37" alignment="c" stretch="1" scale_min="2.5" scale_max="4.1"
   scale="1" location_level="5">
   <texture r="255" g="240" b="0">ui_pda2_hl_quest_base</texture>
   </secondary_ac_border>
   <secondary_mini_ac_border x="0" y="0" width="18" height="18" alignment="c" stretch="1" scale_min="2.5"
   scale_max="4.1" scale="1" location_level="5">
   <texture r="255" g="240" b="0">ui_pda2_hl_quest_base</texture>
   </secondary_mini_ac_border> -->

   <!--
   <primary_task_location>
   <level_map spot="primary_task_spot"        pointer="quest_pointer"/>
   <mini_map spot="primary_task_spot_mini"        pointer="quest_pointer"/>
   </primary_task_location>
   <primary_task_spot x="0" y="0" width="21" height="21" stretch="1" alignment="c" location_level="5">
   <texture r="242" g="15" b="11">ui_pda2_quest</texture>
   </primary_task_spot>
   <primary_task_spot_mini  x="0" y="0" width="15" height="15" stretch="1" alignment="c" location_level="5">
   <texture r="242" g="15" b="11">ui_mmap_quest</texture>
   <texture_below r="242" g="15" b="11">ui_mini_sn_spot_below</texture_below>
   <texture_above r="242" g="15" b="11">ui_mini_sn_spot_above</texture_above>
   </primary_task_spot_mini>

   <primary_na_border x="0" y="0" width="37" height="37" alignment="c" stretch="1" location_level="5">
   <texture r="0" g="154" b="218">ui_pda2_hl_quest_base</texture>
   </primary_na_border>
   <primary_mini_na_border x="0" y="0" width="18" height="18" alignment="c" stretch="1" location_level="5">
   <texture r="0" g="154" b="218">ui_pda2_hl_quest_base</texture>
   </primary_mini_na_border>

   <primary_ac_border x="0" y="0" width="37" height="37" alignment="c" stretch="1" location_level="5">
   <texture r="255" g="240" b="0">ui_pda2_hl_quest_base</texture>
   </primary_ac_border>
   <primary_mini_ac_border x="0" y="0" width="18" height="18" alignment="c" stretch="1" location_level="5">
   <texture r="255" g="240" b="0">ui_pda2_hl_quest_base</texture>
   </primary_mini_ac_border>

   <third_task_location>
   <level_map spot="third_task_spot"/>
   </third_task_location>
   <third_task_spot x="0" y="0" width="27" height="27" stretch="1" alignment="c" location_level="5">
   <texture r="0" g="154" b="218">ui_pda2_sq_sos</texture>
   </third_task_spot>

   <third_na_border x="0" y="0" width="37" height="37" alignment="c" stretch="1" location_level="5">
   <texture r="0" g="154" b="218">ui_pda2_hl_quest_base</texture>
   </third_na_border>

   <third_ac_border x="0" y="0" width="37" height="37" alignment="c" stretch="1" location_level="5">
   <texture r="255" g="240" b="0">ui_pda2_hl_quest_base</texture>
   </third_ac_border>

   --> */}

      {/** <!-- Сюжетные задания --> */}
      <no_spot x={"0"} y={"0"} width={"0"} height={"0"} stretch={"1"} alignment={"c"}>
        <texture>ui_pda2_hl_seq_quest2</texture>
      </no_spot>

      <secondary_task_location_complex>
        <complex_spot spot={"secondary_task_complex_spot"} pointer={"quest_pointer2"} />
        <mini_map spot={"secondary_task_spot_mini"} pointer={"quest_pointer2"} />
      </secondary_task_location_complex>
      <secondary_task_complex_spot
        x={"0"}
        y={"0"}
        width={"30"}
        height={"27"}
        stretch={"0"}
        alignment={"c"}
        location_level={"5"}
        scale={"0"}
        scale_min={"2.5"}
        scale_max={"5.1"}
      >
        <left_icon x={"0"} y={"0"} width={"0"} height={"0"} stretch={"1"} />
        <right_icon x={"0"} y={"0"} width={"0"} height={"0"} stretch={"1"} />
        <top_icon x={"6"} y={"5.5"} width={"19"} height={"19"} stretch={"1"}>
          <texture r={"242"} g={"231"} b={"11"}>
            ui_pda2_secondary_task2
          </texture>
        </top_icon>
        <timer x={"0"} y={"25"} width={"30"} height={"10"}>
          <text font={"letterica18"} color={"ui_4"} align={"c"} stretch={"1"} />
          <texture></texture>
        </timer>
        <static_border
          x={"2.5"}
          y={"2.5"}
          width={"25"}
          height={"25"}
          stretch={"0"}
          light_anim={"ui_slow_blinking_alpha"}
          la_cyclic={"1"}
          la_texture={"1"}
          la_text={"0"}
          la_alpha={"1"}
        >
          <texture r={"242"} g={"231"} b={"11"}>
            ui_pda2_stask_last_02a
          </texture>
        </static_border>
      </secondary_task_complex_spot>

      <storyline_task_location_complex_timer>
        <complex_spot spot={"secondary_task_complex_spot_timer"} pointer={"quest_pointer2"} />
        <mini_map spot={"secondary_task_complex_spot_mini_timer"} pointer={"quest_pointer2"} />
      </storyline_task_location_complex_timer>

      <secondary_task_location_complex_timer>
        <complex_spot spot={"secondary_task_complex_spot_timer"} pointer={"quest_pointer2"} />
        <mini_map spot={"secondary_task_complex_spot_mini_timer"} pointer={"quest_pointer2"} />
      </secondary_task_location_complex_timer>
      <secondary_task_complex_spot_timer
        x={"0"}
        y={"0"}
        width={"30"}
        height={"27"}
        stretch={"0"}
        alignment={"c"}
        location_level={"5"}
        scale={"0"}
        scale_min={"2.5"}
        scale_max={"5.1"}
      >
        <left_icon x={"0"} y={"0"} width={"0"} height={"0"} stretch={"1"} />
        <right_icon x={"0"} y={"0"} width={"0"} height={"0"} stretch={"1"} />
        <top_icon x={"6"} y={"5.5"} width={"19"} height={"19"} stretch={"1"} blink={"1"}>
          <texture r={"242"} g={"231"} b={"11"}>
            ui_pda2_secondary_alert2
          </texture>
        </top_icon>
        <timer x={"0"} y={"25"} width={"30"} height={"10"}>
          <text font={"letterica18"} color={"ui_4"} align={"c"} stretch={"1"} />
          <texture></texture>
        </timer>
        <static_border
          x={"2.5"}
          y={"2.5"}
          width={"25"}
          height={"25"}
          stretch={"0"}
          light_anim={"ui_slow_blinking_alpha"}
          la_cyclic={"1"}
          la_texture={"1"}
          la_text={"0"}
          la_alpha={"1"}
        >
          <texture r={"242"} g={"231"} b={"11"}>
            ui_pda2_stask_last_02a
          </texture>
        </static_border>
      </secondary_task_complex_spot_timer>
      <secondary_task_complex_spot_mini_timer
        x={"0"}
        y={"0"}
        width={"11"}
        height={"11"}
        stretch={"1"}
        alignment={"c"}
        location_level={"5"}
      >
        <texture r={"242"} g={"231"} b={"11"}>
          ui_mmap_secondary_alert
        </texture>
        <texture_below r={"242"} g={"231"} b={"11"}>
          ui_mini_sn_spot_below
        </texture_below>
        <texture_above r={"242"} g={"231"} b={"11"}>
          ui_mini_sn_spot_above
        </texture_above>
      </secondary_task_complex_spot_mini_timer>

      <secondary_task_location_complex_eliminate_smart>
        <complex_spot spot={"secondary_task_eliminate_smart_complex_spot"} pointer={"quest_pointer2"} />
        <mini_map spot={"secondary_task_spot_mini"} pointer={"quest_pointer2"} />
      </secondary_task_location_complex_eliminate_smart>
      <secondary_task_eliminate_smart_complex_spot
        x={"0"}
        y={"0"}
        width={"30"}
        height={"27"}
        stretch={"0"}
        alignment={"c"}
        location_level={"5"}
        scale={"0"}
        scale_min={"2.5"}
        scale_max={"5.1"}
      >
        <left_icon x={"0"} y={"0"} width={"0"} height={"0"} stretch={"1"} />
        <right_icon x={"0"} y={"0"} width={"0"} height={"0"} stretch={"1"} />
        <top_icon x={"6"} y={"5.5"} width={"19"} height={"19"} stretch={"1"}>
          <texture r={"242"} g={"231"} b={"11"}>
            ui_pda2_attack_base2
          </texture>
        </top_icon>
        <timer x={"0"} y={"25"} width={"30"} height={"10"}>
          <text font={"letterica18"} color={"ui_4"} align={"c"} stretch={"1"} />
          <texture></texture>
        </timer>
        <static_border
          x={"2.5"}
          y={"2.5"}
          width={"25"}
          height={"25"}
          stretch={"0"}
          light_anim={"ui_slow_blinking_alpha"}
          la_cyclic={"1"}
          la_texture={"1"}
          la_text={"0"}
          la_alpha={"1"}
        >
          <texture r={"242"} g={"231"} b={"11"}>
            ui_pda2_stask_last_02a
          </texture>
        </static_border>

        {/**
         <!--focused_border x="0" y="-5" width="25" height="25" stretch="0" light_anim="tutor_rad_sign_clr"
         light_anim_cyclic="1" la_alpha="1" la_texture="1"
         xform_anim="map_spot_border_xform" xform_anim_cyclic="1">
         <texture r="242" g="31" b="11">ui_pda2_stask_last_02</texture>
         </focused_border-->
          */}
      </secondary_task_eliminate_smart_complex_spot>

      <secondary_task_location_complex_capture_smart>
        <complex_spot spot={"secondary_task_capture_smart_complex_spot"} pointer={"quest_pointer2"} />
        <mini_map spot={"secondary_task_spot_mini"} pointer={"quest_pointer2"} />
      </secondary_task_location_complex_capture_smart>
      <secondary_task_capture_smart_complex_spot
        x={"0"}
        y={"0"}
        width={"30"}
        height={"27"}
        stretch={"0"}
        alignment={"c"}
        location_level={"5"}
        scale={"0"}
        scale_min={"2.5"}
        scale_max={"5.1"}
      >
        <left_icon x={"0"} y={"0"} width={"0"} height={"0"} stretch={"1"} />
        <right_icon x={"0"} y={"0"} width={"0"} height={"0"} stretch={"1"} />
        <top_icon x={"6"} y={"5.5"} width={"19"} height={"19"} stretch={"1"}>
          <texture r={"242"} g={"231"} b={"11"}>
            ui_pda2_capture_base2
          </texture>
        </top_icon>
        <timer x={"0"} y={"25"} width={"30"} height={"10"}>
          <text font={"letterica18"} color={"ui_4"} align={"c"} stretch={"1"} />
          <texture></texture>
        </timer>
        <static_border
          x={"2.5"}
          y={"2.5"}
          width={"25"}
          height={"25"}
          stretch={"0"}
          light_anim={"ui_slow_blinking_alpha"}
          la_cyclic={"1"}
          la_texture={"1"}
          la_text={"0"}
          la_alpha={"1"}
        >
          <texture r={"242"} g={"231"} b={"11"}>
            ui_pda2_stask_last_02a
          </texture>
        </static_border>
      </secondary_task_capture_smart_complex_spot>

      <secondary_task_location_complex_defend_smart>
        <complex_spot spot={"secondary_task_defend_smart_complex_spot"} pointer={"quest_pointer2"} />
        <mini_map spot={"secondary_task_spot_mini"} pointer={"quest_pointer2"} />
      </secondary_task_location_complex_defend_smart>
      <secondary_task_defend_smart_complex_spot
        x={"0"}
        y={"0"}
        width={"30"}
        height={"27"}
        stretch={"0"}
        alignment={"c"}
        location_level={"5"}
        scale={"0"}
        scale_min={"2.5"}
        scale_max={"5.1"}
      >
        <left_icon x={"0"} y={"0"} width={"0"} height={"0"} stretch={"1"} />
        <right_icon x={"0"} y={"0"} width={"0"} height={"0"} stretch={"1"} />
        <top_icon x={"6"} y={"5.5"} width={"19"} height={"19"} stretch={"1"}>
          <texture r={"242"} g={"231"} b={"11"}>
            ui_pda2_defend_base2
          </texture>
        </top_icon>
        <timer x={"0"} y={"25"} width={"30"} height={"10"}>
          <text font={"letterica18"} color={"ui_4"} align={"c"} stretch={"1"} />
          <texture></texture>
        </timer>
        <static_border
          x={"2.5"}
          y={"2.5"}
          width={"25"}
          height={"25"}
          stretch={"0"}
          light_anim={"ui_slow_blinking_alpha"}
          la_cyclic={"1"}
          la_texture={"1"}
          la_text={"0"}
          la_alpha={"1"}
        >
          <texture r={"242"} g={"231"} b={"11"}>
            ui_pda2_stask_last_02a
          </texture>
        </static_border>
      </secondary_task_defend_smart_complex_spot>

      <secondary_task_location_complex_defend_smart_delay>
        <complex_spot spot={"secondary_task_complex_spot_timer"} pointer={"quest_pointer2"} />
        <mini_map spot={"secondary_task_complex_spot_mini_timer"} pointer={"quest_pointer2"} />
        {/**
          <!--
         <complex_spot spot="secondary_task_defend_smart_delay_complex_spot" pointer="quest_pointer2"/>
         <mini_map     spot="secondary_task_spot_mini" pointer="quest_pointer2"/>
         -->
          */}
      </secondary_task_location_complex_defend_smart_delay>

      {/**
        <!--
       <secondary_task_defend_smart_delay_complex_spot
       x="0"  y="0"  width="30" height="27" stretch="0" alignment="c"
       location_level="5" scale="0" scale_min="2.5" scale_max="5.1">
       <left_icon   x="0"  y="0"  width="0"  height="0"  stretch="1" />
       <right_icon  x="0"  y="0"  width="0"  height="0"  stretch="1" />
       <top_icon    x="7.5"  y="0"  width="15" height="15" stretch="1" >
       <texture  r="242" g="231" b="11">ui_pda2_defend_base</texture>
       </top_icon>
       <timer       x="0"  y="17" width="30" height="10" >
       <text font="letterica18" color="ui_4"align="c" stretch="1" />
       <texture></texture>
       </timer>
       </secondary_task_defend_smart_delay_complex_spot>
       -->
        */}

      <secondary_task_location_complex_bring_item>
        <complex_spot spot={"secondary_task_bring_item_complex_spot"} pointer={"quest_pointer2"} />
        <mini_map spot={"secondary_task_spot_mini"} pointer={"quest_pointer2"} />
      </secondary_task_location_complex_bring_item>
      <secondary_task_bring_item_complex_spot
        x={"0"}
        y={"0"}
        width={"30"}
        height={"27"}
        stretch={"0"}
        alignment={"c"}
        location_level={"5"}
        scale={"0"}
        scale_min={"2.5"}
        scale_max={"5.1"}
      >
        <left_icon x={"0"} y={"0"} width={"0"} height={"0"} stretch={"1"} />
        <right_icon x={"0"} y={"0"} width={"0"} height={"0"} stretch={"1"} />
        <top_icon x={"6"} y={"5.5"} width={"19"} height={"19"} stretch={"1"}>
          <texture r={"242"} g={"231"} b={"11"}>
            ui_pda2_bring_item2
          </texture>
        </top_icon>
        <timer x={"0"} y={"25"} width={"30"} height={"10"}>
          <text font={"letterica18"} color={"ui_4"} align={"c"} stretch={"1"} />
          <texture></texture>
        </timer>
        <static_border
          x={"2.5"}
          y={"2.5"}
          width={"25"}
          height={"25"}
          stretch={"0"}
          light_anim={"ui_slow_blinking_alpha"}
          la_cyclic={"1"}
          la_texture={"1"}
          la_text={"0"}
          la_alpha={"1"}
        >
          <texture r={"242"} g={"231"} b={"11"}>
            ui_pda2_stask_last_02a
          </texture>
        </static_border>
      </secondary_task_bring_item_complex_spot>

      <secondary_task_location_complex_recover_item>
        <complex_spot spot={"secondary_task_recover_item_complex_spot"} pointer={"quest_pointer2"} />
        <mini_map spot={"secondary_task_spot_mini"} pointer={"quest_pointer2"} />
      </secondary_task_location_complex_recover_item>
      <secondary_task_recover_item_complex_spot
        x={"0"}
        y={"0"}
        width={"30"}
        height={"27"}
        stretch={"0"}
        alignment={"c"}
        location_level={"5"}
        scale={"0"}
        scale_min={"2.5"}
        scale_max={"5.1"}
      >
        <left_icon x={"0"} y={"0"} width={"0"} height={"0"} stretch={"1"} />
        <right_icon x={"0"} y={"0"} width={"0"} height={"0"} stretch={"1"} />
        <top_icon x={"6"} y={"5.5"} width={"19"} height={"19"} stretch={"1"}>
          <texture r={"242"} g={"231"} b={"11"}>
            ui_pda2_bring_item2
          </texture>
        </top_icon>
        <timer x={"0"} y={"25"} width={"30"} height={"10"}>
          <text font={"letterica18"} color={"ui_4"} align={"c"} stretch={"1"} />
          <texture></texture>
        </timer>
        <static_border
          x={"2.5"}
          y={"2.5"}
          width={"25"}
          height={"25"}
          stretch={"0"}
          light_anim={"ui_slow_blinking_alpha"}
          la_cyclic={"1"}
          la_texture={"1"}
          la_text={"0"}
          la_alpha={"1"}
        >
          <texture r={"242"} g={"231"} b={"11"}>
            ui_pda2_stask_last_02a
          </texture>
        </static_border>
      </secondary_task_recover_item_complex_spot>

      <secondary_task_location_complex_hide_from_surge>
        <complex_spot spot={"secondary_task_hide_from_surge_complex_spot"} pointer={"quest_pointer2"} />
        <mini_map spot={"secondary_task_spot_mini"} pointer={"quest_pointer2"} />
      </secondary_task_location_complex_hide_from_surge>
      <secondary_task_hide_from_surge_complex_spot
        x={"0"}
        y={"0"}
        width={"30"}
        height={"27"}
        stretch={"0"}
        alignment={"c"}
        location_level={"5"}
        scale={"0"}
        scale_min={"2.5"}
        scale_max={"5.1"}
      >
        <left_icon x={"0"} y={"0"} width={"0"} height={"0"} stretch={"1"} />
        <right_icon x={"0"} y={"0"} width={"0"} height={"0"} stretch={"1"} />
        <top_icon x={"6"} y={"5.5"} width={"19"} height={"19"} stretch={"1"}>
          <texture r={"242"} g={"231"} b={"11"}>
            ui_pda2_secondary_task2
          </texture>
        </top_icon>
        <timer x={"0"} y={"25"} width={"30"} height={"10"}>
          <text font={"letterica18"} color={"ui_4"} align={"c"} stretch={"1"} />
          <texture></texture>
        </timer>
        <static_border
          x={"2.5"}
          y={"2.5"}
          width={"25"}
          height={"25"}
          stretch={"0"}
          light_anim={"ui_slow_blinking_alpha"}
          la_cyclic={"1"}
          la_texture={"1"}
          la_text={"0"}
          la_alpha={"1"}
        >
          <texture r={"242"} g={"231"} b={"11"}>
            ui_pda2_stask_last_02a
          </texture>
        </static_border>
      </secondary_task_hide_from_surge_complex_spot>

      <secondary_task_location_complex_eliminate_squad>
        <complex_spot spot={"secondary_task_eliminate_squad_complex_spot"} pointer={"quest_pointer2"} />
        <mini_map spot={"secondary_task_spot_mini"} pointer={"quest_pointer2"} />
      </secondary_task_location_complex_eliminate_squad>
      <secondary_task_eliminate_squad_complex_spot
        x={"0"}
        y={"0"}
        width={"30"}
        height={"27"}
        stretch={"0"}
        alignment={"c"}
        location_level={"5"}
        scale={"0"}
        scale_min={"2.5"}
        scale_max={"5.1"}
      >
        <left_icon x={"0"} y={"0"} width={"0"} height={"0"} stretch={"1"} />
        <right_icon x={"0"} y={"0"} width={"0"} height={"0"} stretch={"1"} />
        <top_icon x={"6"} y={"5.5"} width={"19"} height={"19"} stretch={"1"}>
          <texture r={"242"} g={"231"} b={"11"}>
            ui_pda2_destroy_enemy2
          </texture>
        </top_icon>
        <timer x={"0"} y={"25"} width={"30"} height={"10"}>
          <text font={"letterica18"} color={"ui_4"} align={"c"} stretch={"1"} />
          <texture></texture>
        </timer>
        <static_border
          x={"2.5"}
          y={"2.5"}
          width={"25"}
          height={"25"}
          stretch={"0"}
          light_anim={"ui_slow_blinking_alpha"}
          la_cyclic={"1"}
          la_texture={"1"}
          la_text={"0"}
          la_alpha={"1"}
        >
          <texture r={"242"} g={"231"} b={"11"}>
            ui_pda2_stask_last_02a
          </texture>
        </static_border>
      </secondary_task_eliminate_squad_complex_spot>

      <secondary_task_location_complex_take_reward>
        <complex_spot spot={"secondary_task_take_reward_complex_spot"} pointer={"quest_pointer2"} />
        <mini_map spot={"secondary_task_spot_mini"} pointer={"quest_pointer2"} />
      </secondary_task_location_complex_take_reward>
      <secondary_task_take_reward_complex_spot
        x={"0"}
        y={"0"}
        width={"30"}
        height={"27"}
        stretch={"0"}
        alignment={"c"}
        location_level={"5"}
        scale={"0"}
        scale_min={"2.5"}
        scale_max={"5.1"}
      >
        <left_icon x={"0"} y={"0"} width={"0"} height={"0"} stretch={"1"} />
        <right_icon x={"0"} y={"0"} width={"0"} height={"0"} stretch={"1"} />
        <top_icon x={"6"} y={"5.5"} width={"19"} height={"19"} stretch={"1"}>
          <texture r={"242"} g={"231"} b={"11"}>
            ui_pda2_info2
          </texture>
        </top_icon>
        <timer x={"0"} y={"25"} width={"30"} height={"10"}>
          <text font={"letterica18"} color={"ui_4"} align={"c"} stretch={"1"} />
          <texture></texture>
        </timer>
        <static_border
          x={"2.5"}
          y={"2.5"}
          width={"25"}
          height={"25"}
          stretch={"0"}
          light_anim={"ui_slow_blinking_alpha"}
          la_cyclic={"1"}
          la_texture={"1"}
          la_text={"0"}
          la_alpha={"1"}
        >
          <texture r={"242"} g={"231"} b={"11"}>
            ui_pda2_stask_last_02a
          </texture>
        </static_border>
      </secondary_task_take_reward_complex_spot>

      {/*
        <!-- <texture id="ui_mmap_bring_item"	x="846" y="841" width="11" height="11" />
       <texture id="ui_pda2_bring_item"	x="830" y="841" width="15" height="15" />

       <texture id="ui_mmap_upgrades"	x="846" y="856" width="11" height="11" />
       <texture id="ui_pda2_upgrades"	x="830" y="856" width="15" height="15" />

       <texture id="ui_mmap_capture_base"	x="846" y="871" width="11" height="11" />
       <texture id="ui_pda2_capture_base"	x="830" y="871" width="15" height="15" />

       <texture id="ui_mmap_attack_base"	x="846" y="886" width="11" height="11" />
       <texture id="ui_pda2_attack_base"	x="830" y="886" width="15" height="15" />

       <texture id="ui_mmap_defend_base"	x="846" y="901" width="11" height="11" />
       <texture id="ui_pda2_defend_base"	x="830" y="901" width="15" height="15" />

       <texture id="ui_mmap_destroy_enemy"	x="846" y="916" width="11" height="11" />
       <texture id="ui_pda2_destroy_enemy"	x="830" y="916" width="15" height="15" />

       <texture id="ui_mmap_mutant"		x="846" y="931" width="11" height="11" />
       <texture id="ui_pda2_mutant"		x="830" y="931" width="15" height="15" />

       <texture id="ui_mmap_info"		x="846" y="946" width="11" height="11" />
       <texture id="ui_pda2_info"		x="830" y="946" width="15" height="15" />
       -->
        */}
    </Fragment>
  );
}
