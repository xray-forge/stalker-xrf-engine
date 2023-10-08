import { Fragment, JSXNode, JSXXML } from "jsx-xml";

import { Xr3tButton, XrRoot, XrStatic } from "@/engine/forms/components/base";
import { XrComponent } from "@/engine/forms/components/base/XrComponent.component";
import { XrList } from "@/engine/forms/components/base/XrList.component";
import { WHITE } from "@/engine/lib/constants/colors";

/**
 * Create extensions dialog form.
 */
export function create(): JSXNode {
  return (
    <XrRoot>
      <ExtensionsBackground />
      <ExtensionsBody />
    </XrRoot>
  );
}

/**
 * Background frame.
 */
function ExtensionsBackground(): JSXNode {
  return (
    <background x="0" y="0" width="1024" height="768">
      <auto_static x="102" y="0" width="819" height="768" stretch="1">
        <texture>ui_inGame2_opt_background</texture>
      </auto_static>
      <auto_static x="253" y="250" width="269" height="176" stretch="1">
        <texture x="1" y="1" width="335" height="174">
          {"ui\\video_window"}
        </texture>
      </auto_static>
      <auto_static x="0" y="0" width="102" height="768" stretch="1">
        <texture>ui_inGame2_opt_left_widepanel</texture>
      </auto_static>
      <auto_static x="921" y="0" width="102" height="768" stretch="1">
        <texture>ui_inGame2_opt_right_widepanel</texture>
      </auto_static>
    </background>
  );
}

/**
 * Main body frame of extensions dialog.
 */
function ExtensionsBody(): JSXNode {
  return (
    <Fragment>
      <frame x="484" y="274" width="389" height="462" stretch="1">
        <texture>ui_inGame2_opt_main_window</texture>
      </frame>

      <XrStatic
        tag={"items_list_frame"}
        x={494}
        y={300}
        width={369}
        height={358}
        texture={"ui_inGame2_servers_list_frame"}
      />

      <XrList tag={"items_list"} x={494} y={300} width={369} height={358} itemHeight={18} canSelect={true} />

      <XrComponent tag={"extension_item"}>
        <XrComponent tag={"main"} width={369} height={18} />
        <XrComponent tag={"fn"} width={320} height={18} />
        <XrComponent tag={"fd"} width={49} height={18} />
      </XrComponent>

      <Xr3tButton
        tag={"toggle_button"}
        x={720}
        y={664}
        width={60}
        height={16}
        label={"ui_mm_toggle"}
        textColor={WHITE}
      />
      <Xr3tButton tag={"up_button"} x={800} y={664} width={28} height={16} label={"ui_mm_up"} textColor={WHITE} />
      <Xr3tButton tag={"down_button"} x={835} y={664} width={28} height={16} label={"ui_mm_down"} textColor={WHITE} />

      <Xr3tButton
        tag={"accept_button"}
        x={794}
        y={707}
        width={60}
        height={20}
        label={"ui_mm_apply"}
        textColor={WHITE}
      />
      <Xr3tButton
        tag={"cancel_button"}
        x={724}
        y={707}
        width={60}
        height={20}
        label={"ui_mm_cancel"}
        textColor={WHITE}
      />
    </Fragment>
  );
}
