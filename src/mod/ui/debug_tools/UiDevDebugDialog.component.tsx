import { JSXNode, JSXXML } from "jsx-xml";

import { captions } from "@/mod/globals/captions";
import { fonts } from "@/mod/globals/fonts";
import { textures } from "@/mod/globals/textures";
import { IRgbColor } from "@/mod/lib/types";
import { Xr3tButton, XrStatic, XrTab } from "@/mod/ui/components/base";
import { CustomTab } from "@/mod/ui/components/custom";

export const IS_XML: boolean = true;

export function create(): JSXNode {
  const BASE_WIDTH: number = 1024;
  const BASE_HEIGHT: number = 768;

  return (
    <w>
      <DebugToolBackground width={BASE_WIDTH} height={BASE_HEIGHT}/>

      <DebugDialogForm width={BASE_WIDTH} height={BASE_HEIGHT} />

      <file_item>
        <main width={490} height={18}/>
        <fn width={325} height={18}/>
        <fd width={110} height={18}/>
      </file_item>

      <DebugToolForm/>

      <DebugToolDialog/>
    </w>
  );
}

function DebugDialogForm({ width= 0, height= 0 }): JSXNode {
  const dialogWidth: number = width * 0.9;
  const dialogHeight: number = height * 0.9;
  const dialogWidthPadding: number = width * 0.05;
  const dialogHeightPadding: number = height * 0.05;

  const dialogButtonWidth: number = 108;
  const dialogButtonHeight: number = 26;

  const dialogTabsWidth: number = dialogWidth - 72;
  const dialogTabsHeight: number = 16;

  const textColorDarker: IRgbColor = { r: 170, g: 170, b: 170 };
  const textColorLighter: IRgbColor = { r: 200, g: 200, b: 200 };

  return (
    <main_dialog x={0} y={0} width={width} height={height}>
      <XrStatic
        tag={"dialog"}
        x={dialogWidthPadding}
        y={dialogHeightPadding}
        height={dialogHeight}
        width={dialogWidth}
        texture={textures.ui_inGame2_opt_main_window}
      />

      <Xr3tButton
        tag={"btn_cancel"}
        x={dialogWidth - dialogButtonWidth - 48}
        y={dialogHeight - dialogButtonHeight - 12}
        height={dialogButtonHeight}
        width={dialogButtonWidth}
        font={fonts.letterica18}
        label={captions.ui_mm_cancel}
        textColor={textColorDarker}
        texture={textures.ui_inGame2_Mp_bigbuttone}
      />

      <CustomTab
        x={(dialogWidth - dialogTabsWidth) / 2}
        y={dialogHeightPadding}
        width={dialogTabsWidth}
        height={dialogTabsHeight}
        font={fonts.letterica16}
        textColor={textColorLighter}
        tabs={[
          { id: "general", label: "General", texture: textures.ui_inGame2_opt_button_1_e },
          { id: "position", label: "Position", texture: textures.ui_inGame2_opt_button_1_e },
          { id: "spawn", label: "Spawn" , texture: textures.ui_inGame2_opt_button_1_e },
          { id: "sound", label: "Sound", texture: textures.ui_inGame2_opt_button_1_e },
          { id: "logics", label: "Logics", texture: textures.ui_inGame2_opt_button_1_e },
          { id: "ui", label: "UI", texture: textures.ui_inGame2_opt_button_1_e },
          { id: "other", label: "Other", texture: textures.ui_inGame2_opt_button_1_e }
        ]}/>
    </main_dialog>
  );
}

function DebugToolForm({ width = 0, height = 0 }) {
  return (
    <form x={width * 0.05} y={height * 0.05} width={width * 0.9} height={width * 0.9} stretch={1}>
      <texture>{textures.ui_inGame2_main_window_small}</texture>
      <auto_static x={30} y={74} width={130} height={130} stretch={1}>
        <texture>{textures.ui_inGame2_picture_window}</texture>
      </auto_static>

      <file_caption x={60} y={395} width={440} height={20}>
        <text font={fonts.letterica18}/>
      </file_caption>
      <file_data x={170} y={-350} width={240} height={50} complex_mode={1}>
        <text font={fonts.letterica18}/>
      </file_data>

      <list_frame x={30} y={215} width={500} height={175}>
        <texture>ui_inGame2_servers_list_frame</texture>
      </list_frame>

      <list x={33} y={215} width={497} height={173} item_height={18} can_select={1}>
        <font font={fonts.letterica16}/>
      </list>

      <cap_rubel_coeff x={285} y={90} width={90} height={23}>
        <text vert_align={"c"} font={fonts.letterica16} r={115} g={114} b={112}/>
      </cap_rubel_coeff>

      <spin_rubel x={230} y={90} width={45} height={23}>
        <options_item entry={"spin_rubel"}/>
      </spin_rubel>

      <btn_moneyplus x={190} y={90} width={30} height={20}>
        <text align={"c"} font={fonts.letterica16} r={227} g={199} b={178}>+</text>
        <texture>{textures.ui_inGame2_Mp_bigbuttone}</texture>
      </btn_moneyplus>

      <btn_moneyminus x={160} y={90} width={30} height={20}>
        <text align={"c"} font={fonts.letterica16} r={227} g={199} b={178}>-</text>
        <texture>{textures.ui_inGame2_Mp_bigbuttone}</texture>
      </btn_moneyminus>

      {/* <!-- ������ -->*/}
      <check_wt x={415} y={330} width={44} height={29}>
        <texture>ui_inGame2_checkbox</texture>
        <text x={-5} font={"arial_14"} vert_align={"c"}>
          Disable weather change.
        </text>
      </check_wt>

      <btn_surge x={375} y={120} width={135} height={26}>
        <texture>{textures.ui_inGame2_Mp_bigbuttone}</texture>
        <text font={fonts.letterica18}>
          Enable Blowout
        </text>
      </btn_surge>

      {/* <!-- ����� -->*/}
      <cap_timefactor x={160} y={110} width={200} height={23}>
        <text font={fonts.letterica16} r={115} g={114} b={112} vert_align={"c"}>
          Speed of time:
        </text>
      </cap_timefactor>

      {/* <!-- ��������� -->*/}
      <cap_timefactor_currently x={160} y={110} width={200} height={23}>
        <text align={"r"} font={fonts.graffiti22} color={"ui_6"}/>
      </cap_timefactor_currently>

      <cap_timefactor_desc x={265} y={130} width={90} height={23}>
        <text align={"r"} font={fonts.graffiti22} color={"ui_6"}/>
      </cap_timefactor_desc>

      <btn_timeminus x={160} y={130} width={30} height={20}>
        <text align={"c"} font={fonts.letterica16} r={227} g={199} b={178}>-</text>
        <texture>{textures.ui_inGame2_Mp_bigbuttone}</texture>
      </btn_timeminus>

      <btn_timeplus x={190} y={130} width={30} height={20}>
        <text align={"c"} font={fonts.letterica16} r={227} g={199} b={178}>+</text>
        <texture>{textures.ui_inGame2_Mp_bigbuttone}</texture>
      </btn_timeplus>

      {/* <!-- ������ ����� -->*/}
      <list_renderer x={194} y={300} width={261} height={21} list_length={14}>
        {/* <!-- options_item entry={"renderer" group={"mm_opt_video"} depend="restart"}/ -->*/}
        <text_color>
          <e r={216} g={186} b={140}/>
          <d color={"ui_gray"}/>
        </text_color>
        <list_font_s r={240} g={217} b={182}/>
        <list_font r={216} g={186} b={140} font={fonts.letterica16}/>
      </list_renderer>

      <spin_spawn x={160} y={160} width={45} height={23}>
        <options_item entry={"spin_spawn"}/>
      </spin_spawn>

      <cap_spawn x={160} y={180} width={200} height={23}>
        <text font={fonts.letterica16} r={115} g={114} b={112} vert_align={"c"}>
          Distance to Spawn (If applicable)
        </text>
      </cap_spawn>

      {/* <!-- ��������� -->*/}
      <cap_loc x={-20} y={-25} width={100} height={23}>
        <text align={"l"} font={fonts.graffiti22} color={"ui_7"}/>
      </cap_loc>
    </form>
  );
}

function DebugToolDialog(): JSXNode {
  return (
    <dialog x={50} y={50} width={610} height={270}>
      <texture>ui_frame_error</texture>

      <capt x={90} y={7} width={200} height={29}>
        <text font={"graffiti19"} color={"ui_6"}>
        Teleportation Menu
        </text>
      </capt>

      <msg3 x={400} y={130} width={200} height={30}>
        <text font={fonts.letterica18} color={"ui_6"}>
        Name?.
        </text>
      </msg3>

      <msg2 x={215} y={50} width={200} height={30}>
        <text font={fonts.letterica18} color={"ui_6"}>
        Enter coordinates: X, Y, Z
        </text>
      </msg2>

      <msg x={180} y={55} width={200} height={30}>
        <text font={fonts.letterica18} color={"ui_6"}></text>
      </msg>

      <edit_box x={200} y={85} width={70} height={23}>
        <texture>{textures.ui_linetext_e}</texture>
        <text font={fonts.letterica18} r={240} g={217} b={182}/>
      </edit_box>

      <edit_box2 x={290} y={85} width={70} height={23}>
        <texture>{textures.ui_linetext_e}</texture>
        <text font={fonts.letterica18} r={240} g={217} b={182}/>
      </edit_box2>

      <edit_box3 x={380} y={85} width={70} height={23}>
        <texture>{textures.ui_linetext_e}</texture>
        <text font={fonts.letterica18} r={240} g={217} b={182}/>
      </edit_box3>

      <edit_box4 x={200} y={130} width={190} height={23}>
        <texture>{textures.ui_linetext_e}</texture>
        <text font={fonts.letterica18} r={240} g={217} b={182}/>
      </edit_box4>

      <btn_1 x={25} y={70} width={117} height={29}>
        <texture_e>ui_button_ordinary_e</texture_e>
        <texture_t>ui_button_ordinary_t</texture_t>
        <texture_h>ui_button_ordinary_h</texture_h>
        <text font={fonts.letterica18}>Take</text>
      </btn_1>

      <btn_2 x={25} y={125} width={117} height={29}>
        <texture_e>ui_button_ordinary_e</texture_e>
        <texture_t>ui_button_ordinary_t</texture_t>
        <texture_h>ui_button_ordinary_h</texture_h>
        <text font={fonts.letterica18}>Save</text>
      </btn_2>

      <btn_3 x={25} y={98} width={117} height={29}>
        <texture_e>ui_button_ordinary_e</texture_e>
        <texture_t>ui_button_ordinary_t</texture_t>
        <texture_h>ui_button_ordinary_h</texture_h>
        <text font={fonts.letterica18}>
        Get Curren Position
        </text>
      </btn_3>

      <btn_4 x={180} y={165} width={157} height={48}>
        <texture>ui_button_main02</texture>
        <text font={fonts.graffiti22}>Move To Coords</text>
        <text_color>
          <e r={227} g={199} b={178}/> <t r={180} g={153} b={155}/> <d r={106} g={95} b={91}/> <h r={0} g={0} b={0}/>
        </text_color>
      </btn_4>

      <btn_5 x={360} y={160} width={137} height={29}>
        <texture_e>ui_button_ordinary_e</texture_e>
        <texture_t>ui_button_ordinary_t</texture_t>
        <texture_h>ui_button_ordinary_h</texture_h>
        <text font={fonts.letterica18}>
        Jump 5M Forward
        </text>
      </btn_5>

    </dialog>
  );
}

function DebugToolBackground({ width = 0, height = 0 }): JSXNode {
  return (
    <background width={width} height={height}>
      <auto_static x={500} y={130} width={432} height={160} stretch={1}>
        <texture width={432} height={160}>{textures.ui_video_voroni_crop}</texture>
      </auto_static>
      <auto_static x={413} y={352} width={576} height={416} stretch={1}>
        <texture width={576} height={416}>{textures.ui_video_water_crop}</texture>
      </auto_static>

      <auto_static width={width} height={height}>
        <texture>{textures.ui_inGame2_background}</texture>
      </auto_static>
      <auto_static x={41} y={278} width={288} height={428}>
        <texture>{textures.ui_save_load_back}</texture>
      </auto_static>
    </background>
  );
}
