import { Fragment, JSXNode, JSXXML } from "jsx-xml";

/**
 * Tips shown when actor hovers over quest items.
 * Example: searching helicopters from main quest, placing scanners from scientists etc.
 */
export function GameQuestsObjectsInteractionTips(): JSXNode {
  return (
    <Fragment>
      {/* }<!--
            #Phrase|string_count|coordinate
            1	4 (890)
            2	2 (920)
            3	2 (920)
            4	3 (910)
            5	4 (890)
            6	3 (910)
            7	4 (890)
            8	3 (910)
            9	4 (890)
            10	5 (870)
            11	2 (920)
            12	2 (920)
            -->*/}
      <jup_b32_scanner>
        <global_wnd />

        <item>
          <disabled_key>quit</disabled_key>
          <length_sec />
          <action id={"use"} finalize={"1"}>
            xr_effects.jup_b32_place_scanner
          </action>
          <guard_key>use</guard_key>
          <grab_input>0</grab_input>
          <main_wnd>
            <auto_static
              start_time={"0"}
              length_sec={"5000"}
              x={"512"}
              y={"660"}
              width={"300"}
              height={"60"}
              alignment={"c"}
              stretch={"1"}
              la_cyclic={"1"}
              la_texture={"1"}
              la_alpha={"1"}
            >
              <text font={"graffiti22"} r={"225"} g={"225"} b={"250"} a={"255"} align={"c"}>
                jup_b209_scanner_place_tips
              </text>
            </auto_static>
          </main_wnd>
        </item>
      </jup_b32_scanner>

      <pri_b306_generator>
        <global_wnd />

        <item>
          <disabled_key>quit</disabled_key>
          <length_sec />
          <action id={"use"} finalize={"1"}>
            xr_effects.pri_b306_generator_start
          </action>
          <guard_key>use</guard_key>
          <grab_input>0</grab_input>
          <main_wnd>
            <auto_static
              start_time={"0"}
              length_sec={"5000"}
              x={"512"}
              y={"660"}
              width={"300"}
              height={"60"}
              alignment={"c"}
              stretch={"1"}
              la_cyclic={"1"}
              la_texture={"1"}
              la_alpha={"1"}
            >
              <text font={"graffiti22"} r={"225"} g={"225"} b={"250"} a={"255"} align={"c"}>
                pri_b306_generator_use
              </text>
            </auto_static>
          </main_wnd>
        </item>
      </pri_b306_generator>

      <jup_b206_plant>
        <global_wnd />

        <item>
          <disabled_key>quit</disabled_key>
          <length_sec />
          <action id={"use"} finalize={"1"}>
            xr_effects.jup_b206_get_plant
          </action>
          <guard_key>use</guard_key>
          <grab_input>0</grab_input>
          <main_wnd>
            <auto_static
              start_time={"0"}
              length_sec={"5000"}
              x={"512"}
              y={"660"}
              width={"300"}
              height={"60"}
              alignment={"c"}
              stretch={"1"}
              la_cyclic={"1"}
              la_texture={"1"}
              la_alpha={"1"}
            >
              <text font={"graffiti22"} r={"225"} g={"225"} b={"250"} a={"255"} align={"c"}>
                jup_b206_use_plant
              </text>
            </auto_static>
          </main_wnd>
        </item>
      </jup_b206_plant>

      <pas_b400_switcher>
        <global_wnd />

        <item>
          <disabled_key>quit</disabled_key>
          <length_sec />
          <action id={"use"} finalize={"1"}>
            xr_effects.pas_b400_switcher
          </action>
          <guard_key>use</guard_key>
          <grab_input>0</grab_input>
          <main_wnd>
            <auto_static
              start_time={"0"}
              length_sec={"5000"}
              x={"512"}
              y={"660"}
              width={"300"}
              height={"60"}
              alignment={"c"}
              stretch={"1"}
              la_cyclic={"1"}
              la_texture={"1"}
              la_alpha={"1"}
            >
              <text font={"graffiti22"} r={"225"} g={"225"} b={"250"} a={"255"} align={"c"}>
                pas_b400_tip_switcher
              </text>
            </auto_static>
          </main_wnd>
        </item>
      </pas_b400_switcher>

      <pri_a18_use_idol>
        <global_wnd />

        <item>
          <disabled_key>quit</disabled_key>
          <length_sec />
          <action id={"use"} finalize={"1"}>
            xr_effects.pri_a18_use_idol
          </action>
          <guard_key>use</guard_key>
          <grab_input>0</grab_input>
          <main_wnd>
            <auto_static
              start_time={"0"}
              length_sec={"5000"}
              x={"512"}
              y={"660"}
              width={"300"}
              height={"60"}
              alignment={"c"}
              stretch={"1"}
              la_cyclic={"1"}
              la_texture={"1"}
              la_alpha={"1"}
            >
              <text font={"graffiti22"} r={"225"} g={"225"} b={"250"} a={"255"} align={"c"}>
                pri_a18_use_idol
              </text>
            </auto_static>
          </main_wnd>
        </item>
      </pri_a18_use_idol>

      <jup_b209_monster_scanner_placed>
        <global_wnd />

        <item>
          <disabled_key>quit</disabled_key>
          <length_sec />
          <action id={"use"} finalize={"1"}>
            xr_effects.jup_b209_place_scanner
          </action>
          <guard_key>use</guard_key>
          <grab_input>0</grab_input>
          <main_wnd>
            <auto_static
              start_time={"0"}
              length_sec={"5000"}
              x={"512"}
              y={"660"}
              width={"300"}
              height={"60"}
              alignment={"c"}
              stretch={"1"}
              la_cyclic={"1"}
              la_texture={"1"}
              la_alpha={"1"}
            >
              <text font={"graffiti22"} r={"225"} g={"225"} b={"250"} a={"255"} align={"c"}>
                jup_b209_scanner_place_tips
              </text>
            </auto_static>
          </main_wnd>
        </item>
      </jup_b209_monster_scanner_placed>

      <jup_b9_heli_1>
        <global_wnd />

        <item>
          <disabled_key>quit</disabled_key>
          <length_sec />
          <action id={"use"} finalize={"1"}>
            xr_effects.jup_b9_heli_1_searching
          </action>
          <guard_key>use</guard_key>
          <grab_input>0</grab_input>
          <main_wnd>
            <auto_static
              start_time={"0"}
              length_sec={"5000"}
              x={"512"}
              y={"660"}
              width={"300"}
              height={"60"}
              alignment={"c"}
              stretch={"1"}
              la_cyclic={"1"}
              la_texture={"1"}
              la_alpha={"1"}
            >
              <text font={"graffiti22"} r={"225"} g={"225"} b={"250"} a={"255"} align={"c"}>
                st_search_helicopter
              </text>
            </auto_static>
          </main_wnd>
        </item>
      </jup_b9_heli_1>

      <jup_b8_heli_4>
        <global_wnd />

        <item>
          <disabled_key>quit</disabled_key>
          <length_sec />
          <action id={"use"} finalize={"1"}>
            xr_effects.jup_b8_heli_4_searching
          </action>
          <guard_key>use</guard_key>
          <grab_input>0</grab_input>
          <main_wnd>
            <auto_static
              start_time={"0"}
              length_sec={"5000"}
              x={"512"}
              y={"660"}
              width={"300"}
              height={"60"}
              alignment={"c"}
              stretch={"1"}
              la_cyclic={"1"}
              la_texture={"1"}
              la_alpha={"1"}
            >
              <text font={"graffiti22"} r={"225"} g={"225"} b={"250"} a={"255"} align={"c"}>
                st_search_helicopter
              </text>
            </auto_static>
          </main_wnd>
        </item>
      </jup_b8_heli_4>

      <jup_b10_ufo_tutor>
        <global_wnd />

        <item>
          <disabled_key>quit</disabled_key>
          <length_sec />
          <action id={"use"} finalize={"1"}>
            xr_effects.jup_b10_ufo_searching
          </action>
          <guard_key>use</guard_key>
          <grab_input>0</grab_input>
          <main_wnd>
            <auto_static
              start_time={"0"}
              length_sec={"5000"}
              x={"512"}
              y={"660"}
              width={"300"}
              height={"60"}
              alignment={"c"}
              stretch={"1"}
              la_cyclic={"1"}
              la_texture={"1"}
              la_alpha={"1"}
            >
              <text font={"graffiti22"} r={"225"} g={"225"} b={"250"} a={"255"} align={"c"}>
                jup_b10_ufo_searching_tips
              </text>
            </auto_static>
          </main_wnd>
        </item>
      </jup_b10_ufo_tutor>

      <zat_b101_heli_5>
        <global_wnd />

        <item>
          <disabled_key>quit</disabled_key>
          <length_sec />
          <action id={"use"} finalize={"1"}>
            xr_effects.zat_b101_heli_5_searching
          </action>
          <guard_key>use</guard_key>
          <grab_input>0</grab_input>
          <main_wnd>
            <auto_static
              start_time={"0"}
              length_sec={"5000"}
              x={"512"}
              y={"660"}
              width={"300"}
              height={"60"}
              alignment={"c"}
              stretch={"1"}
              la_cyclic={"1"}
              la_texture={"1"}
              la_alpha={"1"}
            >
              <text font={"graffiti22"} r={"225"} g={"225"} b={"250"} a={"255"} align={"c"}>
                st_search_helicopter
              </text>
            </auto_static>
          </main_wnd>
        </item>
      </zat_b101_heli_5>

      <zat_b28_heli_3>
        <global_wnd />

        <item>
          <disabled_key>quit</disabled_key>
          <length_sec />
          <action id={"use"} finalize={"1"}>
            xr_effects.zat_b28_heli_3_searching
          </action>
          <guard_key>use</guard_key>
          <grab_input>0</grab_input>
          <main_wnd>
            <auto_static
              start_time={"0"}
              length_sec={"5000"}
              x={"512"}
              y={"660"}
              width={"300"}
              height={"60"}
              alignment={"c"}
              stretch={"1"}
              la_cyclic={"1"}
              la_texture={"1"}
              la_alpha={"1"}
            >
              <text font={"graffiti22"} r={"225"} g={"225"} b={"250"} a={"255"} align={"c"}>
                st_search_helicopter
              </text>
            </auto_static>
          </main_wnd>
        </item>
      </zat_b28_heli_3>

      <zat_b100_heli_2>
        <global_wnd />

        <item>
          <disabled_key>quit</disabled_key>
          <length_sec />
          <action id={"use"} finalize={"1"}>
            xr_effects.zat_b100_heli_2_searching
          </action>
          <guard_key>use</guard_key>
          <grab_input>0</grab_input>
          <main_wnd>
            <auto_static
              start_time={"0"}
              length_sec={"5000"}
              x={"512"}
              y={"660"}
              width={"300"}
              height={"60"}
              alignment={"c"}
              stretch={"1"}
              la_cyclic={"1"}
              la_texture={"1"}
              la_alpha={"1"}
            >
              <text font={"graffiti22"} r={"225"} g={"225"} b={"250"} a={"255"} align={"c"}>
                st_search_helicopter
              </text>
            </auto_static>
          </main_wnd>
        </item>
      </zat_b100_heli_2>

      <zat_b33_snag_container>
        <global_wnd />

        <item>
          <disabled_key>quit</disabled_key>
          <length_sec />
          <action id={"use"} finalize={"1"}>
            xr_effects.zat_b33_pic_snag_container
          </action>
          <guard_key>use</guard_key>
          <grab_input>0</grab_input>
          <main_wnd>
            <auto_static
              start_time={"0"}
              length_sec={"5000"}
              x={"512"}
              y={"660"}
              width={"300"}
              height={"60"}
              alignment={"c"}
              stretch={"1"}
              la_cyclic={"1"}
              la_texture={"1"}
              la_alpha={"1"}
            >
              <text font={"graffiti22"} r={"225"} g={"225"} b={"250"} a={"255"} align={"c"}>
                zat_b33_car_searching_tip
              </text>
            </auto_static>
          </main_wnd>
        </item>
      </zat_b33_snag_container>
    </Fragment>
  );
}
