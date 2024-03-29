import { JSXNode, JSXXML } from "jsx-xml";

/**
 * Generation of multiplayer skin selector UI forms.
 */
export function create(): JSXNode {
  return (
    <window>
      <skin_selector x={"144"} y={"115"} width={"724"} height={"526"}>
        <background x={"0"} y={"0"} width={"724"} height={"526"}>
          <texture>ui_inGame2_Mp_screen_main_window</texture>
        </background>
        <caption x={"200"} y={"4"} width={"330"} height={"32"}>
          <text font={"letterica18"} r={"200"} g={"200"} b={"200"} align={"c"} vert_align={"c"}>
            mp_skin_selection
          </text>
        </caption>
        <image_frames x={"16"} y={"41"} width={"692"} height={"273"}>
          <auto_static x={"0"} y={"0"} width={"111"} height={"232"}>
            <texture>ui_inGame2_Mp_screen_skin_window</texture>
          </auto_static>
          <auto_static x={"116"} y={"0"} width={"111"} height={"232"}>
            <texture>ui_inGame2_Mp_screen_skin_window</texture>
          </auto_static>
          <auto_static x={"232"} y={"0"} width={"111"} height={"232"}>
            <texture>ui_inGame2_Mp_screen_skin_window</texture>
          </auto_static>
          <auto_static x={"348"} y={"0"} width={"111"} height={"232"}>
            <texture>ui_inGame2_Mp_screen_skin_window</texture>
          </auto_static>
          <auto_static x={"463"} y={"0"} width={"111"} height={"232"}>
            <texture>ui_inGame2_Mp_screen_skin_window</texture>
          </auto_static>
          <auto_static x={"581"} y={"0"} width={"111"} height={"232"}>
            <texture>ui_inGame2_Mp_screen_skin_window</texture>
          </auto_static>
        </image_frames>

        <image_0 x={"29"} y={"54"} width={"81"} height={"207"} stretch={"1"}>
          <text font={"letterica18"} align={"r"} vert_align={"t"}>
            1{" "}
          </text>
          <auto_static x={"-5"} y={"-5"} width={"95"} height={"216"} stretch={"1"}>
            <texture>ui_inGame2_Mp_screen_skin_window_H</texture>
          </auto_static>
        </image_0>
        <image_1 x={"145"} y={"54"} width={"81"} height={"207"} stretch={"1"}>
          <text font={"letterica18"} align={"r"} vert_align={"t"}>
            2{" "}
          </text>
          <auto_static x={"-5"} y={"-5"} width={"95"} height={"216"} stretch={"1"}>
            <texture>ui_inGame2_Mp_screen_skin_window_H</texture>
          </auto_static>
        </image_1>
        <image_2 x={"261"} y={"54"} width={"81"} height={"207"} stretch={"1"}>
          <text font={"letterica18"} align={"r"} vert_align={"t"}>
            3{" "}
          </text>
          <auto_static x={"-5"} y={"-5"} width={"95"} height={"216"} stretch={"1"}>
            <texture>ui_inGame2_Mp_screen_skin_window_H</texture>
          </auto_static>
        </image_2>
        <image_3 x={"377"} y={"54"} width={"81"} height={"207"} stretch={"1"}>
          <text font={"letterica18"} align={"r"} vert_align={"t"}>
            4{" "}
          </text>
          <auto_static x={"-5"} y={"-5"} width={"95"} height={"216"} stretch={"1"}>
            <texture>ui_inGame2_Mp_screen_skin_window_H</texture>
          </auto_static>
        </image_3>
        <image_4 x={"493"} y={"54"} width={"81"} height={"207"} stretch={"1"}>
          <text font={"letterica18"} align={"r"} vert_align={"t"}>
            5{" "}
          </text>
          <auto_static x={"-5"} y={"-5"} width={"95"} height={"216"} stretch={"1"}>
            <texture>ui_inGame2_Mp_screen_skin_window_H</texture>
          </auto_static>
        </image_4>
        <image_5 x={"614"} y={"54"} width={"81"} height={"207"} stretch={"1"}>
          <text font={"letterica18"} align={"r"} vert_align={"t"}>
            6{" "}
          </text>
          <auto_static x={"-9"} y={"-5"} width={"95"} height={"216"} stretch={"1"}>
            <texture>ui_inGame2_Mp_screen_skin_window_H</texture>
          </auto_static>
        </image_5>

        <btn_back x={"155"} y={"482"} width={"137"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_Mp_bigbuttone</texture>
          <text font={"graffiti19"} align={"c"} a={"170"}>
            mp_back
          </text>
          <text_color>
            <e r={"227"} g={"199"} b={"178"} />
            <t r={"180"} g={"153"} b={"155"} />
            <d r={"106"} g={"95"} b={"91"} />
            <h r={"0"} g={"0"} b={"0"} />
          </text_color>
        </btn_back>
        <btn_autoselect x={"294"} y={"482"} width={"137"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_Mp_bigbuttone</texture>
          <text font={"graffiti19"} align={"c"} a={"170"}>
            mp_auto_select
          </text>
          <text_color>
            <e r={"227"} g={"199"} b={"178"} />
            <t r={"180"} g={"153"} b={"155"} />
            <d r={"106"} g={"95"} b={"91"} />
            <h r={"0"} g={"0"} b={"0"} />
          </text_color>
        </btn_autoselect>
        <btn_spectator x={"433"} y={"482"} width={"137"} height={"28"} stretch={"1"}>
          <texture>ui_inGame2_Mp_bigbuttone</texture>
          <text font={"graffiti19"} align={"c"} a={"170"}>
            mp_spectator
          </text>
          <text_color>
            <e r={"227"} g={"199"} b={"178"} />
            <t r={"180"} g={"153"} b={"155"} />
            <d r={"106"} g={"95"} b={"91"} />
            <h r={"0"} g={"0"} b={"0"} />
          </text_color>
        </btn_spectator>
      </skin_selector>
    </window>
  );
}
