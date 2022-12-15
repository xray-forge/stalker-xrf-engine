import { JSXNode, JSXXML, Fragment } from "jsx-xml";

export function create(): JSXNode {
  return <Fragment>
    <w>
      <background width="1024" height="768">
        <auto_static x="500" y="130" width="432" height="160" stretch="1">
          <texture width="432" height="160">ui\video_voroni_crop</texture>
        </auto_static>
        <auto_static x="413" y="352" width="576" height="416" stretch="1">
          <texture width="576" height="416">ui\video_water_crop</texture>
        </auto_static>
        <auto_static width="1024" height="768">
          <texture>ui_inGame2_background</texture>
        </auto_static>
        <auto_static x="41" y="278" width="288" height="428">
          <texture>ui_save_load_back</texture>
        </auto_static>
      </background>
      <file_item>
        <main width="490" height="18"/>
        <fn width="325" height="18"/>
        <fd width="110" height="18"/>
      </file_item>
      <form x="50" y="252" width="560" height="460" stretch="1">
        <texture>ui_inGame2_main_window_small</texture>
        <caption x="0" y="20" width="560" height="30">
          <text font="graffiti32" align="c">GOTZ (v1.0) ENG Trans By Jamie1992 </text>
        </caption>
        <picture x="31" y="75" width="128" height="128">
          <texture width="128" height="128">ui\ui_noise</texture>
        </picture>
        <auto_static x="30" y="74" width="130" height="130" stretch="1">
          <texture>ui_inGame2_picture_window</texture>
        </auto_static>
        <file_caption x="60" y="395" width="440" height="20">
          <text font="letterica18"/>
        </file_caption>
        <file_data x="170" y="-350" width="240" height="50" complex_mode="1">
          <text font="letterica18"/>
        </file_data>
        <list_frame x="30" y="215" width="500" height="175">
          <texture>ui_inGame2_servers_list_frame</texture>
        </list_frame>
        <list x="33" y="215" width="497" height="173" item_height="18" can_select="1">
          <font font="letterica16"/>
        </list>
        <btn_load x="65" y="427" width="135" height="26">
          <texture>ui_inGame2_Mp_bigbuttone</texture>
          <text font="letterica18">Spawn it!</text>
        </btn_load>
        <btn_delete x="221" y="427" width="135" height="26">
          <texture>ui_inGame2_Mp_bigbuttone</texture>
          <text font="letterica18">Stop Music (If on)</text>
        </btn_delete>
        <btn_cancel x="377" y="427" width="135" height="26">
          <texture>ui_inGame2_Mp_bigbuttone</texture>
          <text font="letterica18">ui_mm_cancel</text>
        </btn_cancel>

        {/* <!-- ������ -->*/}
        <cap_rubel x="160" y="70" width="200" height="23">
          <text font="letterica16" r="115" g="114" b="112" vert_align="c">Money:</text>
        </cap_rubel>

        <cap_rubel_currently x="160" y="70" width="200" height="23">    {/* <!-- ��������� -->*/}
          <text align="r" font="graffiti22" color="ui_7"/>
        </cap_rubel_currently>

        <cap_rubel_coeff x="285" y="90" width="90" height="23">
          <text vert_align="c" font="letterica16" r="115" g="114" b="112"/>
        </cap_rubel_coeff>

        <spin_rubel x="230" y="90" width="45" height="23">
          <options_item entry="spin_rubel"/>
        </spin_rubel>

        <btn_moneyplus x="190" y="90" width="30" height="20">
          <text align="c" font="letterica16" r="227" g="199" b="178">+</text>
          <texture>ui_inGame2_Mp_bigbuttone</texture>
        </btn_moneyplus>

        <btn_moneyminus x="160" y="90" width="30" height="20">
          <text align="c" font="letterica16" r="227" g="199" b="178">-</text>
          <texture>ui_inGame2_Mp_bigbuttone</texture>
        </btn_moneyminus>

        {/* <!-- ������ -->*/}
        <check_wt x="415" y="330" width="44" height="29">
          <texture>ui_inGame2_checkbox</texture>
          <text x="-5" font="arial_14" vert_align="c">Disable weather change.</text>
        </check_wt>

        <btn_surge x="375" y="120" width="135" height="26">
          <texture>ui_inGame2_Mp_bigbuttone</texture>
          <text font="letterica18">Enable Blowout</text>
        </btn_surge>

        {/* <!-- ����� -->*/}
        <cap_timefactor x="160" y="110" width="200" height="23">
          <text font="letterica16" r="115" g="114" b="112" vert_align="c">Speed of time:</text>
        </cap_timefactor>

        <cap_timefactor_currently x="160" y="110" width="200" height="23">    {/* <!-- ��������� -->*/}
          <text align="r" font="graffiti22" color="ui_6"/>
        </cap_timefactor_currently>

        <cap_timefactor_desc x="265" y="130" width="90" height="23">
          <text align="r" font="graffiti22" color="ui_6"/>
        </cap_timefactor_desc>

        <btn_timeminus x="160" y="130" width="30" height="20">
          <text align="c" font="letterica16" r="227" g="199" b="178">-</text>
          <texture>ui_inGame2_Mp_bigbuttone</texture>
        </btn_timeminus>

        <btn_timeplus x="190" y="130" width="30" height="20">
          <text align="c" font="letterica16" r="227" g="199" b="178">+</text>
          <texture>ui_inGame2_Mp_bigbuttone</texture>
        </btn_timeplus>

        {/* <!-- ������ ����� -->*/}
        <list_renderer x="194" y="300" width="261" height="21" list_length="14">
          {/* <!-- options_item entry="renderer" group="mm_opt_video" depend="restart"/ -->*/}
          <text_color>
            <e r="216" g="186" b="140"/>
            <d color="ui_gray"/>
          </text_color>
          <list_font_s r="240" g="217" b="182"/>
          <list_font	 r="216" g="186" b="140" font="letterica16"/>
        </list_renderer>

        <spin_spawn x="160" y="160" width="45" height="23">
          <options_item entry="spin_spawn"/>
        </spin_spawn>

        <cap_spawn x="160" y="180" width="200" height="23">
          <text font="letterica16" r="115" g="114" b="112" vert_align="c">Distance to Spawn (If applicable)</text>
        </cap_spawn>

        <cap_loc x="-20" y="-25" width="100" height="23">    {/* <!-- ��������� -->*/}
          <text align="l" font="graffiti22" color="ui_7"/>
        </cap_loc>

      </form>

      {/* <!-- ����� ������������ -->*/}
      <dialog x="50" y="50" width="610" height="270">
        <texture>ui_frame_error</texture>

        <capt x="90" y="7" width="200" height="29">
          <text font="graffiti19" color="ui_6">Teleportation Menu</text>
        </capt>

        <msg3 x="400" y="130" width="200" height="30">
          <text font="letterica18" color="ui_6">Name?.</text>
        </msg3>

        <msg2 x="215" y="50" width="200" height="30">
          <text font="letterica18" color="ui_6">Enter coordinates: X, Y, Z</text>
        </msg2>

        <msg x="180" y="55" width="200" height="30">
          <text font="letterica18" color="ui_6"></text>
        </msg>

        <edit_box x="200" y="85" width="70" height="23">
          <texture>ui_linetext_e</texture>
          <text font="letterica18" r="240" g="217" b="182"/>
        </edit_box>

        <edit_box2 x="290" y="85" width="70" height="23">
          <texture>ui_linetext_e</texture>
          <text font="letterica18" r="240" g="217" b="182"/>
        </edit_box2>

        <edit_box3 x="380" y="85" width="70" height="23">
          <texture>ui_linetext_e</texture>
          <text font="letterica18" r="240" g="217" b="182"/>
        </edit_box3>

        <edit_box4 x="200" y="130" width="190" height="23">
          <texture>ui_linetext_e</texture>
          <text font="letterica18" r="240" g="217" b="182"/>
        </edit_box4>

        <btn_1 x="25" y="70" width="117" height="29">
          <texture_e>ui_button_ordinary_e</texture_e>
          <texture_t>ui_button_ordinary_t</texture_t>
          <texture_h>ui_button_ordinary_h</texture_h>
          <text font="letterica18">Take</text>
        </btn_1>

        <btn_2 x="25" y="125" width="117" height="29">
          <texture_e>ui_button_ordinary_e</texture_e>
          <texture_t>ui_button_ordinary_t</texture_t>
          <texture_h>ui_button_ordinary_h</texture_h>
          <text font="letterica18">Save</text>
        </btn_2>

        <btn_3 x="25" y="98" width="117" height="29">
          <texture_e>ui_button_ordinary_e</texture_e>
          <texture_t>ui_button_ordinary_t</texture_t>
          <texture_h>ui_button_ordinary_h</texture_h>
          <text font="letterica18">Get Curren Position</text>
        </btn_3>

        <btn_4 x="180" y="165" width="157" height="48">
          <texture>ui_button_main02</texture>
          <text font="graffiti22">Move To Coords</text>
          <text_color>
            <e r="227" g="199" b="178"/> <t r="180" g="153" b="155"/> <d r="106" g="95" b="91"/> <h r="0" g="0" b="0"/>
          </text_color>
        </btn_4>

        <btn_5 x="360" y="160" width="137" height="29">
          <texture_e>ui_button_ordinary_e</texture_e>
          <texture_t>ui_button_ordinary_t</texture_t>
          <texture_h>ui_button_ordinary_h</texture_h>
          <text font="letterica18">Jump 5M Forward.</text>
        </btn_5>

      </dialog>

    </w>

    {/* <!-- ������ -->*/}

    <god_intro_game>
      <global_wnd width="1024" height="768">
        <pause_state>on</pause_state>
        <sound>music\intro</sound>

        <auto_static width="1024" height="768" stretch="1">
          <texture>intro\intro_back</texture>
        </auto_static>
        <auto_static x="0" y="32" width="1024" height="576" stretch="1">
          <texture x="1" y="1" width="638" height="358">intro\cop_intro_movie</texture>
        </auto_static>
      </global_wnd>

      <global_wnd_16 width="1024" height="768">
        <sound>music\intro</sound>
        <auto_static width="1024" height="768" stretch="1">
          <texture x="1" y="1" width="638" height="358">intro\cop_intro_movie</texture>
        </auto_static>
      </global_wnd_16>

      <item>
        <length_sec>6</length_sec>
        <grab_input>on</grab_input>
        <main_wnd/>
      </item>

      <item>
        <length_sec>20.5</length_sec>
        <sound>characters_voice\scenario\zaton\zat_a1_cutscene_phrase_1</sound>
        <grab_input>on</grab_input>
        <main_wnd>
          <auto_static
            start_time="0" length_sec="20.5" x="500" y="890" width="890" height="500" alignment="c" stretch="1"
            light_anim="zat_a1_phrase_1" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" color="tut_gray">zat_a1_cutscene_phrase_1</text>
          </auto_static>
        </main_wnd>
      </item>

      <item>
        <length_sec>10</length_sec>
        <sound>characters_voice\scenario\zaton\zat_a1_cutscene_phrase_2</sound>
        <grab_input>on</grab_input>
        <main_wnd>
          <auto_static start_time="0" length_sec="10" x="500" y="920" width="920" height="500" alignment="c" stretch="1"
            light_anim="zat_a1_phrase_2" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" color="tut_gray">zat_a1_cutscene_phrase_2</text>
          </auto_static>
        </main_wnd>
      </item>

      <item>
        <length_sec>8.4</length_sec>
        <sound>characters_voice\scenario\zaton\zat_a1_cutscene_phrase_3</sound>
        <grab_input>on</grab_input>
        <main_wnd>
          <auto_static
            start_time="0" length_sec="8.4" x="500" y="920" width="920" height="500" alignment="c" stretch="1"
            light_anim="zat_a1_phrase_3" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" color="tut_gray">zat_a1_cutscene_phrase_3</text>
          </auto_static>
        </main_wnd>
      </item>

      <item>
        <length_sec>15.5</length_sec>
        <sound>characters_voice\scenario\zaton\zat_a1_cutscene_phrase_4</sound>
        <grab_input>on</grab_input>
        <main_wnd>
          <auto_static
            start_time="0" length_sec="15.5" x="500" y="910" width="910" height="500" alignment="c" stretch="1"
            light_anim="zat_a1_phrase_4" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" color="tut_gray">zat_a1_cutscene_phrase_4</text>
          </auto_static>
        </main_wnd>
      </item>

      <item>
        <length_sec>20.9</length_sec>
        <sound>characters_voice\scenario\zaton\zat_a1_cutscene_phrase_5</sound>
        <grab_input>on</grab_input>
        <main_wnd>
          <auto_static
            start_time="0" length_sec="20.9" x="500" y="890" width="890" height="500" alignment="c" stretch="1"
            light_anim="zat_a1_phrase_5" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" color="tut_gray">zat_a1_cutscene_phrase_5</text>
          </auto_static>
        </main_wnd>
      </item>

      <item>
        <length_sec>14.3</length_sec>
        <sound>characters_voice\scenario\zaton\zat_a1_cutscene_phrase_6</sound>
        <grab_input>on</grab_input>
        <main_wnd>
          <auto_static
            start_time="0" length_sec="14.3" x="500" y="910" width="910" height="500" alignment="c" stretch="1"
            light_anim="zat_a1_phrase_6" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" color="tut_gray">zat_a1_cutscene_phrase_6</text>
          </auto_static>
        </main_wnd>
      </item>

      <item>
        <length_sec>17.8</length_sec>
        <sound>characters_voice\scenario\zaton\zat_a1_cutscene_phrase_7</sound>
        <grab_input>on</grab_input>
        <main_wnd>
          <auto_static
            start_time="0" length_sec="17.8" x="500" y="890" width="890" height="500" alignment="c" stretch="1"
            light_anim="zat_a1_phrase_7" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" color="tut_gray">zat_a1_cutscene_phrase_7</text>
          </auto_static>
        </main_wnd>
      </item>

      <item>
        <length_sec>14.3</length_sec>
        <sound>characters_voice\scenario\zaton\zat_a1_cutscene_phrase_8</sound>
        <grab_input>on</grab_input>
        <main_wnd>
          <auto_static
            start_time="0" length_sec="14.3" x="500" y="910" width="910" height="500" alignment="c" stretch="1"
            light_anim="zat_a1_phrase_8" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" color="tut_gray">zat_a1_cutscene_phrase_8</text>
          </auto_static>
        </main_wnd>
      </item>

      <item>
        <length_sec>21.7</length_sec>
        <sound>characters_voice\scenario\zaton\zat_a1_cutscene_phrase_9</sound>
        <grab_input>on</grab_input>
        <main_wnd>
          <auto_static
            start_time="0" length_sec="21.7" x="500" y="890" width="890" height="500" alignment="c" stretch="1"
            light_anim="zat_a1_phrase_9" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" color="tut_gray">zat_a1_cutscene_phrase_9</text>
          </auto_static>
        </main_wnd>
      </item>

      <item>
        <length_sec>24.1</length_sec>
        <sound>characters_voice\scenario\zaton\zat_a1_cutscene_phrase_10</sound>
        <grab_input>on</grab_input>
        <main_wnd>
          <auto_static
            start_time="0" length_sec="24.1" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="zat_a1_phrase_10" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" color="tut_gray">zat_a1_cutscene_phrase_10</text>
          </auto_static>
        </main_wnd>
      </item>

      <item>
        <length_sec>7.8</length_sec>
        <sound>characters_voice\scenario\zaton\zat_a1_cutscene_phrase_11</sound>
        <grab_input>on</grab_input>
        <main_wnd>
          <auto_static
            start_time="0" length_sec="7.8" x="500" y="920" width="920" height="500" alignment="c" stretch="1"
            light_anim="zat_a1_phrase_11" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" color="tut_gray">zat_a1_cutscene_phrase_11</text>
          </auto_static>
        </main_wnd>
      </item>

      <item>
        <length_sec>11.7</length_sec>
        <sound>characters_voice\scenario\zaton\zat_a1_cutscene_phrase_12</sound>
        <grab_input>on</grab_input>
        <main_wnd>
          <auto_static start_time="0" length_sec="11" x="500" y="920" width="920" height="500" alignment="c" stretch="1"
            light_anim="zat_a1_phrase_12" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" color="tut_gray">zat_a1_cutscene_phrase_12</text>
          </auto_static>
        </main_wnd>
      </item>
    </god_intro_game>

    <god_talk_ssu_snd>
      <global_wnd width="1024" height="768">
        <pause_state>off</pause_state>
        <auto_static width="1024" height="768" stretch="1">
          <texture>intro\intro_back</texture>
        </auto_static>
      </global_wnd>
      <item>
        <length_sec>1.5</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_ssu_to_actor_1</sound>
        <main_wnd>
        </main_wnd>
      </item>

      <item>
        <length_sec>2.2</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_actor_to_ssu_1</sound>
        <main_wnd>
        </main_wnd>
      </item>

      <item>
        <length_sec>11.0</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_ssu_to_actor_2</sound>
        <main_wnd>
        </main_wnd>
      </item>

      <item>
        <length_sec>10.2</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_actor_to_ssu_2</sound>
        <main_wnd>
        </main_wnd>
      </item>

      <item>
        <length_sec>6.5</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_ssu_to_actor_3</sound>
        <main_wnd>
        </main_wnd>
      </item>

      <item>
        <length_sec>15.0</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_actor_to_ssu_with_heli_info</sound>
        <main_wnd>
        </main_wnd>
      </item>

      <item>
        <length_sec>15.5</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_ssu_to_actor_5</sound>
        <main_wnd>
        </main_wnd>
      </item>

    </god_talk_ssu_snd>

    <god_talk_ssu>
      <render_prio>5</render_prio>
      <global_wnd width="1024" height="768">
        <pause_state>off</pause_state>
        <auto_static width="1024" height="768" stretch="1">
          <texture>intro\intro_back</texture>
        </auto_static>
        <function_on_stop>xr_effects.pri_a28_talk_ssu_video_end</function_on_stop>
      </global_wnd>
      <item>
        <length_sec>60</length_sec>
        <disabled_key>quit</disabled_key>
        <main_wnd>
          <auto_static start_time="0" length_sec="61" x="0" y="96" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">intro\video_talk_with_ssu</texture>
          </auto_static>
        </main_wnd>
      </item>
    </god_talk_ssu>

    {/* <!-- FINAL OUTRO -->*/}
    <god_outro_game>
      <global_wnd width="1024" height="768">
        <auto_static width="1024" height="768" stretch="1">
          <texture>intro\intro_back</texture>
        </auto_static>
        <function_on_start>outro_cond.start_bk_sound_god</function_on_start>
        <function_on_stop>outro_cond.stop_bk_sound_god</function_on_stop>
      </global_wnd>
      {/* <!-- 0_pause -->*/}
      <item>
        <length_sec>8</length_sec>

        <main_wnd>
          <auto_static start_time="0" length_sec="8" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\0_pause</texture>
          </auto_static>
        </main_wnd>
      </item>

      {/* <!-- 1_medal -->*/}
      <item>
        <length_sec>15.6</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_1</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="15.6" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\1_medal</texture>
          </auto_static>
          <auto_static
            start_time="0" length_sec="15.6" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_1" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_1</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 2_top_secret -->*/}
      <item>
        <length_sec>22.4</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_2</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="22.4" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\2_top_secret</texture>
          </auto_static>
          <auto_static
            start_time="0" length_sec="22.4" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_2" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_2</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 3_product_62 -->*/}
      <item>
        <length_sec>22.9</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_3</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="22.9" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\3_product_62</texture>
          </auto_static>
          <auto_static
            start_time="0" length_sec="22.9" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_3" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_3</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 4a_skadovsk_good -->*/}
      <item>
        <length_sec>21.2</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_4_a</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="21.2" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\4a_skadovsk_good</texture>
          </auto_static>
          <auto_static
            start_time="0" length_sec="21.2" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_4a" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_4_a</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 4b_skadovsk_bad -->*/}
      <item>
        <length_sec>24.1</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_4_b</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="24.1" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\4b_skadovsk_bad</texture>
          </auto_static>
          <auto_static
            start_time="0" length_sec="24.1" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_4b" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_4_b</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 4c_skadovsk_neutral -->*/}
      <item>
        <length_sec>16.5</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_4_c</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="16.5" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\4c_skadovsk_neutral</texture>
          </auto_static>
          <auto_static
            start_time="0" length_sec="16.5" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_4c" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_4_c</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 5a_bloodsucker_live -->*/}
      <item>
        <length_sec>20.7</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_5_a</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="20.7" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\5a_bloodsucker_live</texture>
          </auto_static>
          <auto_static
            start_time="0" length_sec="20.7" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_5a" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_5_a</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 5b_bloodsucker_dead -->*/}
      <item>
        <length_sec>13.7</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_5_b</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="13.7" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\5b_bloodsucker_dead</texture>
          </auto_static>
          <auto_static
            start_time="0" length_sec="13.7" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_5b" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_5_b</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 6a_dolg_die -->*/}
      <item>
        <length_sec>19.2</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_6_a</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="19.2" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\6a_dolg_die</texture>
          </auto_static>
          <auto_static
            start_time="0" length_sec="19.2" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_6a" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_6_a</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 6b_freedom_die -->*/}
      <item>
        <length_sec>13.4</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_6_b</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="13.4" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\6b_freedom_die</texture>
          </auto_static>
          <auto_static
            start_time="0" length_sec="13.4" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_6b" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_6_b</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 6c_dolg_n_freedom -->*/}
      <item>
        <length_sec>14</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_6_c</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="14" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\6c_dolg_n_freedom</texture>
          </auto_static>
          <auto_static start_time="0" length_sec="14" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_6c" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_6_c</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 7a_scientist_good -->*/}
      <item>
        <length_sec>17.5</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_7_a</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="17.5" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\7a_scientist_good</texture>
          </auto_static>
          <auto_static
            start_time="0" length_sec="17.5" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_7a" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_7_a</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 7b_scientist_bad -->*/}
      <item>
        <length_sec>15.8</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_7_b</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="15.8" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\7b_scientist_bad</texture>
          </auto_static>
          <auto_static
            start_time="0" length_sec="15.8" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_7b" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_7_b</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 8a_garik_good -->*/}
      <item>
        <length_sec>22.9</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_8_a</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="22.9" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\8a_garik_good</texture>
          </auto_static>
          <auto_static
            start_time="0" length_sec="22.9" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_8a" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_8_a</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 8b_garik_bad -->*/}
      <item>
        <length_sec>17.2</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_8_b</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="17.2" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\8b_garik_bad</texture>
          </auto_static>
          <auto_static
            start_time="0" length_sec="17.2" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_8b" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_8_b</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 9_oasis -->*/}
      <item>
        <length_sec>24.8</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_9</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="24.8" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\9_oasis</texture>
          </auto_static>
          <auto_static
            start_time="0" length_sec="24.8" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_9" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_9</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 10_mercenarys -->*/}
      <item>
        <length_sec>16.4</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_10</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="16.4" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\10_mercenarys</texture>
          </auto_static>
          <auto_static
            start_time="0" length_sec="16.4" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_10" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_10</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 11a_yanov_good -->*/}
      <item>
        <length_sec>17.2</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_11_a</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="17.2" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\11a_yanov_good</texture>
          </auto_static>
          <auto_static
            start_time="0" length_sec="17.2" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_11a" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_11_a</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 11b_yanov_bad -->*/}
      <item>
        <length_sec>19.6</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_11_b</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="19.6" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\11b_yanov_bad</texture>
          </auto_static>
          <auto_static
            start_time="0" length_sec="19.6" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_11b" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_11_b</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 12a_zuluz_good -->*/}
      <item>
        <length_sec>14</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_12_a</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="14" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\12a_zuluz_good</texture>
          </auto_static>
          <auto_static start_time="0" length_sec="14" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_12a" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_12_a</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 12b_zuluz_bad -->*/}
      <item>
        <length_sec>14.1</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_12_b</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="14.1" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\12b_zuluz_bad</texture>
          </auto_static>
          <auto_static
            start_time="0" length_sec="14.1" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_12b" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_12_b</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 13a_vano_good -->*/}
      <item>
        <length_sec>15.1</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_13_a</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="15.1" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\13a_vano_good</texture>
          </auto_static>
          <auto_static
            start_time="0" length_sec="15.1" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_13a" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_13_a</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 13b_vano_bad -->*/}
      <item>
        <length_sec>14.6</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_13_b</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="14.6" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\13b_vano_bad</texture>
          </auto_static>
          <auto_static
            start_time="0" length_sec="14.6" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_13b" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_13_b</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 14a_brodyaga_good -->*/}
      <item>
        <length_sec>15.6</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_14_a</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="15.6" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\14a_brodyaga_good</texture>
          </auto_static>
          <auto_static
            start_time="0" length_sec="15.6" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_14a" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_14_a</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 14b_brodyaga_bad -->*/}
      <item>
        <length_sec>9.7</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_14_b</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="9.7" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\14b_brodyaga_bad</texture>
          </auto_static>
          <auto_static
            start_time="0" length_sec="9.7" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_14b" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_14_b</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 15a_sokolov_good -->*/}
      <item>
        <length_sec>19.6</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_15_a</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="19.6" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\15a_sokolov_good</texture>
          </auto_static>
          <auto_static
            start_time="0" length_sec="19.6" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_15a" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_15_a</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 15b_sokolov_bad -->*/}
      <item>
        <length_sec>14</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_15_b</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="14" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\15b_sokolov_bad</texture>
          </auto_static>
          <auto_static start_time="0" length_sec="14" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_15b" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_15_b</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 16_sich -->*/}
      <item>
        <length_sec>10.6</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_16</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="10.6" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\16_sich</texture>
          </auto_static>
          <auto_static
            start_time="0" length_sec="10.6" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_16" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_16</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 17_noahs_ark -->*/}
      <item>
        <length_sec>23.1</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_17</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="23.1" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\17_noahs_ark</texture>
          </auto_static>
          <auto_static
            start_time="0" length_sec="23.1" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_17" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_17</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 18a_kardan_good -->*/}
      <item>
        <length_sec>23.2</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_18_a</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="23.2" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\18a_kardan_good</texture>
          </auto_static>
          <auto_static
            start_time="0" length_sec="23.2" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_18a" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_18_a</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 18b_kardan_bad -->*/}
      <item>
        <length_sec>18.4</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_18_b</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="18.4" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\18b_kardan_bad</texture>
          </auto_static>
          <auto_static
            start_time="0" length_sec="18.4" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_18b" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_18_b</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 19a_strelok_live -->*/}
      <item>
        <length_sec>17</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_19_a</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="17" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\19a_strelok_live</texture>
          </auto_static>
          <auto_static start_time="0" length_sec="17" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_19a" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_19_a</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 19b_strelok_die -->*/}
      <item>
        <length_sec>16.1</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_19_b</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="16.1" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\19b_strelok_die</texture>
          </auto_static>
          <auto_static
            start_time="0" length_sec="16.1" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_19b" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_19_b</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 20a_kovalski_live -->*/}
      <item>
        <length_sec>15.9</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_20_a</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="15.9" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\20a_kovalski_live</texture>
          </auto_static>
          <auto_static
            start_time="0" length_sec="15.9" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_20a" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_20_a</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 20b_kovalski_die -->*/}
      <item>
        <length_sec>17.4</length_sec>
        <sound>characters_voice\scenario\pripyat\pri_a28_outro_phrase_20_b</sound>
        <main_wnd>
          <auto_static start_time="0" length_sec="17.4" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\20b_kovalski_die</texture>
          </auto_static>
          <auto_static
            start_time="0" length_sec="17.4" x="500" y="870" width="870" height="500" alignment="c" stretch="1"
            light_anim="pri_a28_phrase_20b" la_cyclic="0" la_texture="1" la_alpha="1">
            <text align="c" font="graffiti22" r="100" g="100" b="100" a="255">pri_a28_outro_phrase_20_b</text>
          </auto_static>
        </main_wnd>
      </item>
      {/* <!-- 21_final_picture -->*/}
      <item>
        <length_sec>25</length_sec>
        <main_wnd>
          <auto_static start_time="0" length_sec="25" x="0" y="32" width="1024" height="576" stretch="1">
            <widescreen_rect width="1024" height="768"/>
            <texture width="638" height="358">outro\21_final_picture</texture>
          </auto_static>
        </main_wnd>
        <grab_input>0</grab_input>
      </item>
    </god_outro_game>
  </Fragment>;
}
