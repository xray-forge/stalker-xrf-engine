import { JSXNode, JSXXML } from "jsx-xml";

/**
 * Once game is finished this part is played.
 */
// todo: JSX + globals.
export function GameEndOutro(): JSXNode {
  return (
    <outro_game>
      <persistent>1</persistent>
      <global_wnd width={"1024"} height={"768"}>
        <pause_state>on</pause_state>
        <auto_static width={"1024"} height={"768"} stretch={"1"}>
          <texture>intro\intro_back</texture>
        </auto_static>
        <function_on_start>outro.start_bk_sound</function_on_start>
        <function_on_stop>outro.stop_bk_sound</function_on_stop>
      </global_wnd>

      {/* }<!------ 0_pause -->*/}
      <item>
        <length_sec>8</length_sec>
        <function_on_frame>outro.update_bk_sound_fade_start</function_on_frame>

        <main_wnd>
          <auto_static start_time={"0"} length_sec={"8"} x={"0"} y={"32"} width={"1024"} height={"576"} stretch={"1"}>
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\0_pause
            </texture>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 1_medal -->*/}
      <item>
        <length_sec>15.6</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_1</sound>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"15.6"}
            x={"0"}
            y={"32"}
            width={"1024"}
            height={"576"}
            stretch={"1"}
          >
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\1_medal
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"15.6"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_1"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_1
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 2_top_secret -->*/}
      <item>
        <length_sec>22.4</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_2</sound>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"22.4"}
            x={"0"}
            y={"32"}
            width={"1024"}
            height={"576"}
            stretch={"1"}
          >
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\2_top_secret
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"22.4"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_2"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_2
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 3_product_62 -->*/}
      <item>
        <length_sec>22.9</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_3</sound>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"22.9"}
            x={"0"}
            y={"32"}
            width={"1024"}
            height={"576"}
            stretch={"1"}
          >
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\3_product_62
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"22.9"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_3"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_3
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 4a_skadovsk_good -->*/}
      <item>
        <length_sec>21.2</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_4_a</sound>
        <function_check_start>outro.conditions.skadovsk_good_cond</function_check_start>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"21.2"}
            x={"0"}
            y={"32"}
            width={"1024"}
            height={"576"}
            stretch={"1"}
          >
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\4a_skadovsk_good
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"21.2"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_4a"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_4_a
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 4b_skadovsk_bad -->*/}
      <item>
        <length_sec>24.1</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_4_b</sound>
        <function_check_start>outro.conditions.skadovsk_bad_cond</function_check_start>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"24.1"}
            x={"0"}
            y={"32"}
            width={"1024"}
            height={"576"}
            stretch={"1"}
          >
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\4b_skadovsk_bad
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"24.1"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_4b"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_4_b
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 4c_skadovsk_neutral -->*/}
      <item>
        <length_sec>16.5</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_4_c</sound>
        <function_check_start>outro.conditions.skadovsk_neutral_cond</function_check_start>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"16.5"}
            x={"0"}
            y={"32"}
            width={"1024"}
            height={"576"}
            stretch={"1"}
          >
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\4c_skadovsk_neutral
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"16.5"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_4c"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_4_c
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 5a_bloodsucker_live -->*/}
      <item>
        <length_sec>20.7</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_5_a</sound>
        <function_check_start>outro.conditions.bloodsucker_live_cond</function_check_start>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"20.7"}
            x={"0"}
            y={"32"}
            width={"1024"}
            height={"576"}
            stretch={"1"}
          >
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\5a_bloodsucker_live
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"20.7"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_5a"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_5_a
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 5b_bloodsucker_dead -->*/}
      <item>
        <length_sec>13.7</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_5_b</sound>
        <function_check_start>outro.conditions.bloodsucker_dead_cond</function_check_start>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"13.7"}
            x={"0"}
            y={"32"}
            width={"1024"}
            height={"576"}
            stretch={"1"}
          >
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\5b_bloodsucker_dead
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"13.7"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_5b"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_5_b
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 6a_dolg_die -->*/}
      <item>
        <length_sec>19.2</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_6_a</sound>
        <function_check_start>outro.conditions.dolg_die_cond</function_check_start>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"19.2"}
            x={"0"}
            y={"32"}
            width={"1024"}
            height={"576"}
            stretch={"1"}
          >
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\6a_dolg_die
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"19.2"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_6a"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_6_a
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 6b_freedom_die -->*/}
      <item>
        <length_sec>13.4</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_6_b</sound>
        <function_check_start>outro.conditions.freedom_die_cond</function_check_start>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"13.4"}
            x={"0"}
            y={"32"}
            width={"1024"}
            height={"576"}
            stretch={"1"}
          >
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\6b_freedom_die
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"13.4"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_6b"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_6_b
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 6c_dolg_n_freedom -->*/}
      <item>
        <length_sec>14</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_6_c</sound>
        <function_check_start>outro.conditions.dolg_n_freedom_cond</function_check_start>
        <main_wnd>
          <auto_static start_time={"0"} length_sec={"14"} x={"0"} y={"32"} width={"1024"} height={"576"} stretch={"1"}>
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\6c_dolg_n_freedom
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"14"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_6c"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_6_c
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 7a_scientist_good -->*/}
      <item>
        <length_sec>17.5</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_7_a</sound>
        <function_check_start>outro.conditions.scientist_good_cond</function_check_start>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"17.5"}
            x={"0"}
            y={"32"}
            width={"1024"}
            height={"576"}
            stretch={"1"}
          >
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\7a_scientist_good
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"17.5"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_7a"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_7_a
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 7b_scientist_bad -->*/}
      <item>
        <length_sec>15.8</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_7_b</sound>
        <function_check_start>outro.conditions.scientist_bad_cond</function_check_start>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"15.8"}
            x={"0"}
            y={"32"}
            width={"1024"}
            height={"576"}
            stretch={"1"}
          >
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\7b_scientist_bad
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"15.8"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_7b"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_7_b
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 8a_garik_good -->*/}
      <item>
        <length_sec>22.9</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_8_a</sound>
        <function_check_start>outro.conditions.garik_good_cond</function_check_start>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"22.9"}
            x={"0"}
            y={"32"}
            width={"1024"}
            height={"576"}
            stretch={"1"}
          >
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\8a_garik_good
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"22.9"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_8a"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_8_a
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 8b_garik_bad -->*/}
      <item>
        <length_sec>17.2</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_8_b</sound>
        <function_check_start>outro.conditions.garik_bad_cond</function_check_start>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"17.2"}
            x={"0"}
            y={"32"}
            width={"1024"}
            height={"576"}
            stretch={"1"}
          >
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\8b_garik_bad
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"17.2"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_8b"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_8_b
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 9_oasis -->*/}
      <item>
        <length_sec>24.8</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_9</sound>
        <function_check_start>outro.conditions.oasis_cond</function_check_start>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"24.8"}
            x={"0"}
            y={"32"}
            width={"1024"}
            height={"576"}
            stretch={"1"}
          >
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\9_oasis
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"24.8"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_9"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_9
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 10_mercenarys -->*/}
      <item>
        <length_sec>16.4</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_10</sound>
        <function_check_start>outro.conditions.mercenarys_cond</function_check_start>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"16.4"}
            x={"0"}
            y={"32"}
            width={"1024"}
            height={"576"}
            stretch={"1"}
          >
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\10_mercenarys
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"16.4"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_10"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_10
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 11a_yanov_good -->*/}
      <item>
        <length_sec>17.2</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_11_a</sound>
        <function_check_start>outro.conditions.yanov_good_cond</function_check_start>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"17.2"}
            x={"0"}
            y={"32"}
            width={"1024"}
            height={"576"}
            stretch={"1"}
          >
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\11a_yanov_good
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"17.2"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_11a"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_11_a
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 11b_yanov_bad -->*/}
      <item>
        <length_sec>19.6</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_11_b</sound>
        <function_check_start>outro.conditions.yanov_bad_cond</function_check_start>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"19.6"}
            x={"0"}
            y={"32"}
            width={"1024"}
            height={"576"}
            stretch={"1"}
          >
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\11b_yanov_bad
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"19.6"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_11b"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_11_b
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 12a_zuluz_good -->*/}
      <item>
        <length_sec>14</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_12_a</sound>
        <function_check_start>outro.conditions.zuluz_good_cond</function_check_start>
        <main_wnd>
          <auto_static start_time={"0"} length_sec={"14"} x={"0"} y={"32"} width={"1024"} height={"576"} stretch={"1"}>
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\12a_zuluz_good
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"14"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_12a"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_12_a
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 12b_zuluz_bad -->*/}
      <item>
        <length_sec>14.1</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_12_b</sound>
        <function_check_start>outro.conditions.zuluz_bad_cond</function_check_start>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"14.1"}
            x={"0"}
            y={"32"}
            width={"1024"}
            height={"576"}
            stretch={"1"}
          >
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\12b_zuluz_bad
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"14.1"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_12b"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_12_b
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 13a_vano_good -->*/}
      <item>
        <length_sec>15.1</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_13_a</sound>
        <function_check_start>outro.conditions.vano_good_cond</function_check_start>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"15.1"}
            x={"0"}
            y={"32"}
            width={"1024"}
            height={"576"}
            stretch={"1"}
          >
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\13a_vano_good
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"15.1"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_13a"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_13_a
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 13b_vano_bad -->*/}
      <item>
        <length_sec>14.6</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_13_b</sound>
        <function_check_start>outro.conditions.vano_bad_cond</function_check_start>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"14.6"}
            x={"0"}
            y={"32"}
            width={"1024"}
            height={"576"}
            stretch={"1"}
          >
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\13b_vano_bad
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"14.6"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_13b"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_13_b
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 14a_brodyaga_good -->*/}
      <item>
        <length_sec>15.6</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_14_a</sound>
        <function_check_start>outro.conditions.brodyaga_good_cond</function_check_start>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"15.6"}
            x={"0"}
            y={"32"}
            width={"1024"}
            height={"576"}
            stretch={"1"}
          >
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\14a_brodyaga_good
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"15.6"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_14a"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_14_a
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 14b_brodyaga_bad -->*/}
      <item>
        <length_sec>9.7</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_14_b</sound>
        <function_check_start>outro.conditions.brodyaga_bad_cond</function_check_start>
        <main_wnd>
          <auto_static start_time={"0"} length_sec={"9.7"} x={"0"} y={"32"} width={"1024"} height={"576"} stretch={"1"}>
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\14b_brodyaga_bad
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"9.7"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_14b"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_14_b
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 15a_sokolov_good -->*/}
      <item>
        <length_sec>19.6</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_15_a</sound>
        <function_check_start>outro.conditions.sokolov_good_cond</function_check_start>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"19.6"}
            x={"0"}
            y={"32"}
            width={"1024"}
            height={"576"}
            stretch={"1"}
          >
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\15a_sokolov_good
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"19.6"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_15a"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_15_a
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 15b_sokolov_bad -->*/}
      <item>
        <length_sec>14</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_15_b</sound>
        <function_check_start>outro.conditions.sokolov_bad_cond</function_check_start>
        <main_wnd>
          <auto_static start_time={"0"} length_sec={"14"} x={"0"} y={"32"} width={"1024"} height={"576"} stretch={"1"}>
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\15b_sokolov_bad
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"14"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_15b"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_15_b
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 16_sich -->*/}
      <item>
        <length_sec>10.6</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_16</sound>
        <function_check_start>outro.conditions.sich_cond</function_check_start>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"10.6"}
            x={"0"}
            y={"32"}
            width={"1024"}
            height={"576"}
            stretch={"1"}
          >
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\16_sich
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"10.6"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_16"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_16
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 17_noahs_ark -->*/}
      <item>
        <length_sec>23.1</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_17</sound>
        <function_check_start>outro.conditions.noahs_ark_cond</function_check_start>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"23.1"}
            x={"0"}
            y={"32"}
            width={"1024"}
            height={"576"}
            stretch={"1"}
          >
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\17_noahs_ark
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"23.1"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_17"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_17
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 18a_kardan_good -->*/}
      <item>
        <length_sec>23.2</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_18_a</sound>
        <function_check_start>outro.conditions.kardan_good_cond</function_check_start>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"23.2"}
            x={"0"}
            y={"32"}
            width={"1024"}
            height={"576"}
            stretch={"1"}
          >
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\18a_kardan_good
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"23.2"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_18a"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_18_a
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 18b_kardan_bad -->*/}
      <item>
        <length_sec>18.4</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_18_b</sound>
        <function_check_start>outro.conditions.kardan_bad_cond</function_check_start>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"18.4"}
            x={"0"}
            y={"32"}
            width={"1024"}
            height={"576"}
            stretch={"1"}
          >
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\18b_kardan_bad
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"18.4"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_18b"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_18_b
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 19a_strelok_live -->*/}
      <item>
        <length_sec>17</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_19_a</sound>
        <function_check_start>outro.conditions.strelok_live_cond</function_check_start>
        <main_wnd>
          <auto_static start_time={"0"} length_sec={"17"} x={"0"} y={"32"} width={"1024"} height={"576"} stretch={"1"}>
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\19a_strelok_live
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"17"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_19a"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_19_a
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 19b_strelok_die -->*/}
      <item>
        <length_sec>16.1</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_19_b</sound>
        <function_check_start>outro.conditions.strelok_die_cond</function_check_start>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"16.1"}
            x={"0"}
            y={"32"}
            width={"1024"}
            height={"576"}
            stretch={"1"}
          >
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\19b_strelok_die
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"16.1"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_19b"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_19_b
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 20a_kovalski_live -->*/}
      <item>
        <length_sec>15.9</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_20_a</sound>
        <function_check_start>outro.conditions.kovalski_live_cond</function_check_start>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"15.9"}
            x={"0"}
            y={"32"}
            width={"1024"}
            height={"576"}
            stretch={"1"}
          >
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\20a_kovalski_live
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"15.9"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_20a"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_20_a
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 20b_kovalski_die -->*/}
      <item>
        <length_sec>17.4</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_20_b</sound>
        <function_check_start>outro.conditions.kovalski_die_cond</function_check_start>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"17.4"}
            x={"0"}
            y={"32"}
            width={"1024"}
            height={"576"}
            stretch={"1"}
          >
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\20b_kovalski_die
            </texture>
          </auto_static>
          <auto_static
            start_time={"0"}
            length_sec={"17.4"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"pri_a28_phrase_20b"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} r={"100"} g={"100"} b={"100"} a={"255"}>
              pri_a28_outro_phrase_20_b
            </text>
          </auto_static>
        </main_wnd>
      </item>

      {/* }<!------ 21_final_picture -->*/}
      <item>
        <length_sec>25</length_sec>
        <function_on_frame>outro.update_bk_sound_fade_stop</function_on_frame>
        <main_wnd>
          <auto_static start_time={"0"} length_sec={"25"} x={"0"} y={"32"} width={"1024"} height={"576"} stretch={"1"}>
            <widescreen_rect width={"1024"} height={"768"} />
            <texture width={"638"} height={"358"}>
              outro\21_final_picture
            </texture>
          </auto_static>
        </main_wnd>
        <grab_input>0</grab_input>
      </item>
    </outro_game>
  );
}
