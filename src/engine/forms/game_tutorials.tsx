import { Fragment, JSXNode, JSXXML } from "jsx-xml";

import { includeXmlFile } from "#/utils";

import {
  GameCutScenes,
  GameEndOutro,
  GameQuestsObjectsInteractionTips,
  GameStartIntro,
  GameVendorsIntro,
} from "@/engine/forms/game_tutorials/index";

export const IS_XML: boolean = true;

export function create(): JSXNode {
  return (
    <window>
      <GameVendorsIntro />

      <GameStartIntro />

      <GameCutScenes />

      <GameEndOutro />

      <GameEndedChoicesModal />

      <GameDevelopersCredits />

      <GameLoadedPressAnyButton />

      <GameQuestsObjectsInteractionTips />

      <GameObjectInteractionOverlays />
    </window>
  );
}

/**
 * Default developers mentions scene + background.
 */
function GameDevelopersCredits(): JSXNode {
  return includeXmlFile("ui\\ui_credits.xml");
}

/**
 * Modal with choices when character is dead.
 * By default, it suggests last save or leave to main menu.
 */
function GameEndedChoicesModal(): JSXNode {
  return (
    <game_over>
      <global_wnd />

      <item>
        <length_sec>4</length_sec>
        <pause_state>off</pause_state>
        <guard_key>jump</guard_key>
        <function_on_stop>xr_effects.on_tutor_gameover_stop</function_on_stop>
        <action id="quick_load" finalize="1">
          xr_effects.on_tutor_gameover_quickload
        </action>
        <sound />
        <grab_input>1</grab_input>
        <main_wnd>
          <auto_static start_time="0" length_sec="10000" x="350" y="360" width="300" height="60">
            <text font="graffiti50" r="255" g="0" b="0" a="255" align="c">
              st_game_over
            </text>
          </auto_static>
          <auto_static
            start_time="3"
            length_sec="10000"
            x="350"
            y="660"
            width="300"
            height="60"
            light_anim="ui_pda_contacts"
            la_cyclic="1"
            la_text="1"
            la_alpha="1"
          >
            <text font="graffiti22" r="255" g="0" b="0" a="255" align="c">
              st_game_over_press_jump
            </text>
          </auto_static>
        </main_wnd>
      </item>
    </game_over>
  );
}

/**
 * When game loaded, it is paused and waits player input before start.
 */
function GameLoadedPressAnyButton(): JSXNode {
  return (
    <game_loaded>
      <global_wnd>
        <pause_state>on</pause_state>
      </global_wnd>

      <item>
        <length_sec>1</length_sec>
        <guard_key>any</guard_key>
        <grab_input>1</grab_input>
        <main_wnd>
          <auto_static
            start_time="0"
            length_sec="10000"
            alignment="c"
            x="512"
            y="545"
            width="600"
            height="30"
            light_anim="ui_slow_blinking_alpha"
            la_cyclic="1"
            la_text="1"
            la_alpha="1"
          >
            <text font="letterica18" r="180" g="180" b="180" a="255" align="c">
              st_press_any_key
            </text>
          </auto_static>
        </main_wnd>
      </item>
    </game_loaded>
  );
}

/**
 * UI elements for interaction with environment.
 * Example: sleep dialog.
 */
function GameObjectInteractionOverlays(): JSXNode {
  return (
    <Fragment>
      <tutorial_sleep>
        <global_wnd />

        <item>
          <disabled_key>quit</disabled_key>
          <length_sec />
          <action id="use" finalize="1">
            xr_effects.sleep
          </action>
          {/* <!--			<function_on_stop>xr_effects.sleep</function_on_stop> -->*/}
          <guard_key>use</guard_key>
          <disabled_key>quit</disabled_key>
          <grab_input>0</grab_input>
          <main_wnd>
            <auto_static
              start_time="0"
              length_sec="5000"
              x="512"
              y="660"
              width="300"
              height="60"
              alignment="c"
              stretch="1"
              la_cyclic="1"
              la_texture="1"
              la_alpha="1"
            >
              <text font="graffiti22" r="225" g="225" b="250" a="255" align="c">
                sleep_zone_tip
              </text>
            </auto_static>
          </main_wnd>
        </item>
      </tutorial_sleep>
    </Fragment>
  );
}
