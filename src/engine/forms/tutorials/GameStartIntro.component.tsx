import { JSXNode, JSXXML } from "jsx-xml";

/**
 * Played once game starts.
 * Default scenes with speech.
 */
export function GameStartIntro(): JSXNode {
  return (
    <intro_game>
      <global_wnd width={"1024"} height={"768"}>
        <pause_state>on</pause_state>
        <sound>music\intro</sound>

        <auto_static width={"1024"} height={"768"} stretch={"1"}>
          <texture>intro\intro_back</texture>
        </auto_static>
        <auto_static x={"0"} y={"32"} width={"1024"} height={"576"} stretch={"1"}>
          <texture x={"1"} y={"1"} width={"638"} height={"358"}>
            intro\cop_intro_movie
          </texture>
        </auto_static>
      </global_wnd>

      <global_wnd_16 width={"1024"} height={"768"}>
        <sound>music\intro</sound>
        <auto_static width={"1024"} height={"768"} stretch={"1"}>
          <texture x={"1"} y={"1"} width={"638"} height={"358"}>
            intro\cop_intro_movie
          </texture>
        </auto_static>
      </global_wnd_16>

      <item>
        <length_sec>6</length_sec>
        <function_on_stop>xr_effects.zat_a1_tutorial_end_give</function_on_stop>
        <grab_input>on</grab_input>
        <main_wnd />
      </item>

      <item>
        <length_sec>20.5</length_sec>
        <sound>characters_voice\scenario\zaton\zat_a1_cutscene_phrase_1</sound>
        <function_on_stop>xr_effects.zat_a1_tutorial_end_give</function_on_stop>
        <grab_input>on</grab_input>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"20.5"}
            x={"500"}
            y={"890"}
            width={"890"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"zat_a1_phrase_1"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} color={"tut_gray"}>
              zat_a1_cutscene_phrase_1
            </text>
          </auto_static>
        </main_wnd>
      </item>

      <item>
        <length_sec>10</length_sec>
        <sound>characters_voice\scenario\zaton\zat_a1_cutscene_phrase_2</sound>
        <function_on_stop>xr_effects.zat_a1_tutorial_end_give</function_on_stop>
        <grab_input>on</grab_input>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"10"}
            x={"500"}
            y={"920"}
            width={"920"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"zat_a1_phrase_2"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} color={"tut_gray"}>
              zat_a1_cutscene_phrase_2
            </text>
          </auto_static>
        </main_wnd>
      </item>

      <item>
        <length_sec>8.4</length_sec>
        <sound>characters_voice\scenario\zaton\zat_a1_cutscene_phrase_3</sound>
        <function_on_stop>xr_effects.zat_a1_tutorial_end_give</function_on_stop>
        <grab_input>on</grab_input>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"8.4"}
            x={"500"}
            y={"920"}
            width={"920"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"zat_a1_phrase_3"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} color={"tut_gray"}>
              zat_a1_cutscene_phrase_3
            </text>
          </auto_static>
        </main_wnd>
      </item>

      <item>
        <length_sec>15.5</length_sec>
        <sound>characters_voice\scenario\zaton\zat_a1_cutscene_phrase_4</sound>
        <function_on_stop>xr_effects.zat_a1_tutorial_end_give</function_on_stop>
        <grab_input>on</grab_input>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"15.5"}
            x={"500"}
            y={"910"}
            width={"910"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"zat_a1_phrase_4"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} color={"tut_gray"}>
              zat_a1_cutscene_phrase_4
            </text>
          </auto_static>
        </main_wnd>
      </item>

      <item>
        <length_sec>20.9</length_sec>
        <sound>characters_voice\scenario\zaton\zat_a1_cutscene_phrase_5</sound>
        <function_on_stop>xr_effects.zat_a1_tutorial_end_give</function_on_stop>
        <grab_input>on</grab_input>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"20.9"}
            x={"500"}
            y={"890"}
            width={"890"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"zat_a1_phrase_5"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} color={"tut_gray"}>
              zat_a1_cutscene_phrase_5
            </text>
          </auto_static>
        </main_wnd>
      </item>

      <item>
        <length_sec>14.3</length_sec>
        <sound>characters_voice\scenario\zaton\zat_a1_cutscene_phrase_6</sound>
        <function_on_stop>xr_effects.zat_a1_tutorial_end_give</function_on_stop>
        <grab_input>on</grab_input>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"14.3"}
            x={"500"}
            y={"910"}
            width={"910"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"zat_a1_phrase_6"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} color={"tut_gray"}>
              zat_a1_cutscene_phrase_6
            </text>
          </auto_static>
        </main_wnd>
      </item>

      <item>
        <length_sec>17.8</length_sec>
        <sound>characters_voice\scenario\zaton\zat_a1_cutscene_phrase_7</sound>
        <function_on_stop>xr_effects.zat_a1_tutorial_end_give</function_on_stop>
        <grab_input>on</grab_input>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"17.8"}
            x={"500"}
            y={"890"}
            width={"890"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"zat_a1_phrase_7"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} color={"tut_gray"}>
              zat_a1_cutscene_phrase_7
            </text>
          </auto_static>
        </main_wnd>
      </item>

      <item>
        <length_sec>14.3</length_sec>
        <sound>characters_voice\scenario\zaton\zat_a1_cutscene_phrase_8</sound>
        <function_on_stop>xr_effects.zat_a1_tutorial_end_give</function_on_stop>
        <grab_input>on</grab_input>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"14.3"}
            x={"500"}
            y={"910"}
            width={"910"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"zat_a1_phrase_8"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} color={"tut_gray"}>
              zat_a1_cutscene_phrase_8
            </text>
          </auto_static>
        </main_wnd>
      </item>

      <item>
        <length_sec>21.7</length_sec>
        <sound>characters_voice\scenario\zaton\zat_a1_cutscene_phrase_9</sound>
        <function_on_stop>xr_effects.zat_a1_tutorial_end_give</function_on_stop>
        <grab_input>on</grab_input>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"21.7"}
            x={"500"}
            y={"890"}
            width={"890"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"zat_a1_phrase_9"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} color={"tut_gray"}>
              zat_a1_cutscene_phrase_9
            </text>
          </auto_static>
        </main_wnd>
      </item>

      <item>
        <length_sec>24.1</length_sec>
        <sound>characters_voice\scenario\zaton\zat_a1_cutscene_phrase_10</sound>
        <function_on_stop>xr_effects.zat_a1_tutorial_end_give</function_on_stop>
        <grab_input>on</grab_input>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"24.1"}
            x={"500"}
            y={"870"}
            width={"870"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"zat_a1_phrase_10"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} color={"tut_gray"}>
              zat_a1_cutscene_phrase_10
            </text>
          </auto_static>
        </main_wnd>
      </item>

      <item>
        <length_sec>7.8</length_sec>
        <sound>characters_voice\scenario\zaton\zat_a1_cutscene_phrase_11</sound>
        <function_on_stop>xr_effects.zat_a1_tutorial_end_give</function_on_stop>
        <grab_input>on</grab_input>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"7.8"}
            x={"500"}
            y={"920"}
            width={"920"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"zat_a1_phrase_11"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} color={"tut_gray"}>
              zat_a1_cutscene_phrase_11
            </text>
          </auto_static>
        </main_wnd>
      </item>

      <item>
        <length_sec>11.7</length_sec>
        <sound>characters_voice\scenario\zaton\zat_a1_cutscene_phrase_12</sound>
        <function_on_stop>xr_effects.zat_a1_tutorial_end_give</function_on_stop>
        <grab_input>on</grab_input>
        <main_wnd>
          <auto_static
            start_time={"0"}
            length_sec={"11"}
            x={"500"}
            y={"920"}
            width={"920"}
            height={"500"}
            alignment={"c"}
            stretch={"1"}
            light_anim={"zat_a1_phrase_12"}
            la_cyclic={"0"}
            la_texture={"1"}
            la_alpha={"1"}
          >
            <text align={"c"} font={"graffiti22"} color={"tut_gray"}>
              zat_a1_cutscene_phrase_12
            </text>
          </auto_static>
        </main_wnd>
      </item>
    </intro_game>
  );
}
