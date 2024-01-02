import { Fragment, JSXNode, JSXXML } from "jsx-xml";

/**
 * Game cut-scenes description.
 * Example: radio event in Pripyat.
 */
export function GameCutScenes(): JSXNode {
  return (
    <Fragment>
      <talk_ssu>
        <render_prio>5</render_prio>
        <global_wnd width={"1024"} height={"768"}>
          <pause_state>off</pause_state>
          <auto_static width={"1024"} height={"768"} stretch={"1"}>
            <texture>intro\intro_back</texture>
          </auto_static>
          <function_on_stop>xr_effects.pri_a28_talk_ssu_video_end</function_on_stop>
        </global_wnd>
        <item>
          <length_sec>60</length_sec>
          <disabled_key>quit</disabled_key>
          <main_wnd>
            <auto_static
              start_time={"0"}
              length_sec={"61"}
              x={"0"}
              y={"96"}
              width={"1024"}
              height={"576"}
              stretch={"1"}
            >
              <widescreen_rect width={"1024"} height={"768"} />
              <texture width={"638"} height={"358"}>
                intro\video_talk_with_ssu
              </texture>
            </auto_static>
          </main_wnd>
        </item>
      </talk_ssu>
    </Fragment>
  );
}
