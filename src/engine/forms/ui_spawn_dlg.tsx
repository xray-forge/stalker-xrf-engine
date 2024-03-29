import { JSXNode, JSXXML } from "jsx-xml";

/**
 * Create UI forms related to original in-game spawner dialog.
 */
export function create(): JSXNode {
  return (
    <w>
      <background width={"580"} height={"460"}>
        <texture>ui_icons_PDA_tooltips</texture>
        <auto_static x={"60"}>
          <text font={"graffiti32"} r={"210"} g={"210"} b={"210"}>
            Spawn item
          </text>
        </auto_static>
      </background>

      <list x={"30"} y={"60"} width={"530"} height={"350"} item_height={"22"} can_select={"1"}>
        <font font={"letterica16"} r={"210"} g={"210"} b={"210"} />
      </list>

      <check_own_to_actor x={"30"} y={"420"} width={"32"} height={"21"}>
        <texture>ui_inGame2_checkbox</texture>
        <text font={"letterica16"} r={"115"} g={"114"} b={"112"} vert_align={"c"}>
          ToActor
        </text>
      </check_own_to_actor>

      <btn_create x={"130"} y={"420"} width={"100"} height={"24"}>
        <texture>ui_inGame2_button</texture>
        <text align={"c"} font={"letterica16"}>
          Create
        </text>
        <text_color>
          <e r={"210"} g={"210"} b={"210"} />
        </text_color>
      </btn_create>

      <btn_close x={"235"} y={"420"} width={"100"} height={"24"}>
        <texture>ui_inGame2_button</texture>
        <text align={"c"} font={"letterica16"}>
          Close
        </text>
        <text_color>
          <e r={"210"} g={"210"} b={"210"} />
        </text_color>
      </btn_close>

      <btn_weapons x={"10"} y={"35"} width={"70"} height={"24"}>
        <texture>ui_inGame2_button</texture>
        <text align={"c"} font={"letterica16"}>
          weapons
        </text>
        <text_color>
          <e r={"210"} g={"210"} b={"210"} />
        </text_color>
      </btn_weapons>

      <btn_addons x={"80"} y={"35"} width={"70"} height={"24"}>
        <texture>ui_inGame2_button</texture>
        <text align={"c"} font={"letterica16"}>
          addons
        </text>
        <text_color>
          <e r={"210"} g={"210"} b={"210"} />
        </text_color>
      </btn_addons>

      <btn_outfits x={"150"} y={"35"} width={"70"} height={"24"}>
        <texture>ui_inGame2_button</texture>
        <text align={"c"} font={"letterica16"}>
          outfits
        </text>
        <text_color>
          <e r={"210"} g={"210"} b={"210"} />
        </text_color>
      </btn_outfits>

      <btn_devices x={"220"} y={"35"} width={"70"} height={"24"}>
        <texture>ui_inGame2_button</texture>
        <text align={"c"} font={"letterica16"}>
          devices
        </text>
        <text_color>
          <e r={"210"} g={"210"} b={"210"} />
        </text_color>
      </btn_devices>

      <btn_ammo x={"290"} y={"35"} width={"70"} height={"24"}>
        <texture>ui_inGame2_button</texture>
        <text align={"c"} font={"letterica16"}>
          ammo
        </text>
        <text_color>
          <e r={"210"} g={"210"} b={"210"} />
        </text_color>
      </btn_ammo>

      <btn_artefacts x={"360"} y={"35"} width={"70"} height={"24"}>
        <texture>ui_inGame2_button</texture>
        <text align={"c"} font={"letterica16"}>
          artefacts
        </text>
        <text_color>
          <e r={"210"} g={"210"} b={"210"} />
        </text_color>
      </btn_artefacts>

      <btn_food x={"430"} y={"35"} width={"70"} height={"24"}>
        <texture>ui_inGame2_button</texture>
        <text align={"c"} font={"letterica16"}>
          food
        </text>
        <text_color>
          <e r={"210"} g={"210"} b={"210"} />
        </text_color>
      </btn_food>

      <btn_info x={"500"} y={"35"} width={"70"} height={"24"}>
        <texture>ui_inGame2_button</texture>
        <text align={"c"} font={"letterica16"}>
          info
        </text>
        <text_color>
          <e r={"210"} g={"210"} b={"210"} />
        </text_color>
      </btn_info>
    </w>
  );
}
