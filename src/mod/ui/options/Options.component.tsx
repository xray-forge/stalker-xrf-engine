import { Fragment, JSXNode, JSXXML } from "jsx-xml";

import { OptionsControls } from "@/mod/ui/options/OptionsControls.part";
import { OptionsGameplay } from "@/mod/ui/options/OptionsGameplay.part";
import { OptionsSounds } from "@/mod/ui/options/OptionsSounds.part";
import { OptionsVideo } from "@/mod/ui/options/OptionsVideo.part";
import { OptionsVideoAdvanced } from "@/mod/ui/options/OptionsVideoAdvanced.part";

export const IS_XML: boolean = true;

export function create(): JSXNode {
  return (
    <w>
      <OptionsBackground />

      <OptionsBody />

      <tab_size x="22" y="63" width="354" height="344" />

      <OptionsVideo />

      <OptionsSounds />

      <OptionsVideoAdvanced />

      <OptionsGameplay />

      <OptionsControls />

      <OptionsPatchDownload />
    </w>
  );
}

function OptionsBody(): JSXNode {
  return (
    <main_dialog>
      <dialog x="484" y="274" width="389" height="462" stretch="1">
        <texture>ui_inGame2_opt_main_window</texture>
        <auto_static x="11" y="27" width="368" height="38" stretch="1">
          <texture>ui_inGame2_opt_buttons_frame</texture>
        </auto_static>
      </dialog>

      <btn_accept x="84" y="431" width="108" height="26" stretch="1">
        <text font="letterica18" align="c">
          ui_mm_apply
        </text>
        <texture>ui_inGame2_Mp_bigbuttone</texture>
        <text_color>
          <e r="170" g="170" b="170" />
        </text_color>
      </btn_accept>

      <btn_cancel x="196" y="431" width="108" height="26" stretch="1">
        <text font="letterica18" align="c">
          ui_mm_cancel
        </text>
        <texture>ui_inGame2_Mp_bigbuttone</texture>
        <text_color>
          <e r="170" g="170" b="170" />
        </text_color>
      </btn_cancel>

      <tab x="11" y="27" width="368" height="38">
        <button x="1" y="2" width="105" height="25" id="video" stretch="1">
          <texture>ui_inGame2_opt_button_1</texture>
          <text font="letterica18" align="c">
            ui_mm_video
          </text>
          <text_color>
            <e r="200" g="200" b="200" />
          </text_color>
        </button>

        <button x="89" y="2" width="104" height="25" id="sound" stretch="1">
          <texture>ui_inGame2_opt_button_1</texture>
          <text font="letterica18" align="c">
            ui_mm_sound
          </text>
          <text_color>
            <e r="200" g="200" b="200" />
          </text_color>
        </button>

        <button x="176" y="2" width="105" height="25" id="gameplay" stretch="1">
          <texture>ui_inGame2_opt_button_1</texture>
          <text font="letterica18" align="c">
            ui_mm_gameplay
          </text>
          <text_color>
            <e r="200" g="200" b="200" />
          </text_color>
        </button>

        <button x="264" y="2" width="103" height="25" id="controls" stretch="1">
          <texture>ui_inGame2_opt_button_2</texture>
          <text font="letterica18" align="c">
            ui_mm_controls
          </text>
          <text_color>
            <e r="200" g="200" b="200" />
          </text_color>
        </button>
      </tab>
    </main_dialog>
  );
}

function OptionsBackground(): JSXNode {
  return (
    <background x="0" y="0" width="1024" height="768">
      <auto_static x="102" y="0" width="819" height="768" stretch="1">
        <texture>ui_inGame2_opt_background</texture>
      </auto_static>
      <auto_static x="253" y="250" width="269" height="176" stretch="1">
        <texture x="1" y="1" width="335" height="174">
          ui\video_window
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

function OptionsPatchDownload(): JSXNode {
  return (
    <Fragment>
      <download_static x="251" y="717" width="482" height="51" stretch="1">
        <texture>ui_patch_back</texture>
      </download_static>

      <download_text x="262" y="730" width="384" height="30">
        <text r="170" g="170" b="170" align="c" font="letterica16" complex_mode="0">
          mm_mp_progress
        </text>
      </download_text>

      <progress_download x="280" y="754" width="322" height="10" horz="1" min="0" max="100">
        <progress>
          <texture>ui_patch_progress</texture>
        </progress>
      </progress_download>

      <btn_cancel_download x="624" y="732" width="88" height="29" stretch="1">
        <text align="c" font="letterica16">
          mm_mp_cancel
        </text>
        <text_color>
          <e r="170" g="170" b="170" />
        </text_color>
        <texture>ui_button_ordinary</texture>
      </btn_cancel_download>
    </Fragment>
  );
}
