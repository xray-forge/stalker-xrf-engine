import { JSXNode, JSXXML } from "jsx-xml";

import { config as forgeConfig } from "@/engine/configs/forge";

/**
 * todo;
 */
export function GameVendorsIntro(): JSXNode {
  if (forgeConfig.config.intro_videos_enabled) {
    return (
      <intro_logo>
        <global_wnd width="1024" height="768">
          <auto_static width="1024" height="768" stretch="1">
            <texture>intro\intro_back</texture>
          </auto_static>
        </global_wnd>
        <play_each_item>1</play_each_item>
        {/* )<!-- GSC GAMEWORLD -->*/}
        <item type="video">
          <sound>video\intro_gsc</sound>
          <delay>1</delay>
          <pause_state>on</pause_state>
          <video_wnd x="0" y="0" width="1024" height="768" stretch="1" alignment="c">
            <texture x="1" y="1" width="795" height="355">
              intro\intro_gsc
            </texture>
          </video_wnd>
        </item>
        {/* <!-- GSC WORLD PUBLISHING - FOR RUSSIAN ONLY !!!-->*/}
        <item type="video">
          <delay>1</delay>
          <pause_state>on</pause_state>
          <sound>video\intro_gsc_wp</sound>
          <video_wnd x="0" y="0" width="1024" height="768" stretch="1">
            <texture x="0" y="1" width="800" height="358">
              intro\intro_gsc-wp
            </texture>
          </video_wnd>
        </item>
        {/*
        <!-- bitComposer - SCOP FOREIGN PUBLISHER --
      <item type="video">
        <delay>1</delay>
        <pause_state>on</pause_state>
        <sound>video\bitComposer</sound>
        <video_wnd x="0" y="0" width="1024" height="768" stretch="1">
          <texture x="0" y="1" width="640" height="368">intro\bitComposer</texture>
        </video_wnd>
      </item>
      -->
         */}
        {/* <!-- ATI --> */}
        <item type="video">
          <delay>1</delay>
          <pause_state>on</pause_state>
          <sound>video\ATI_Radeon_1920x1080</sound>
          <video_wnd x="0" y="0" width="1024" height="768" stretch="1">
            <texture x="0" y="1" width="640" height="368">
              intro\ATI_Radeon_1920x1080
            </texture>
          </video_wnd>
        </item>
        {/* <!-- AMD --> */}
        <item type="video">
          <delay>1</delay>
          <pause_state>on</pause_state>
          <sound>video\AMD_fusion_final_720</sound>
          <video_wnd x="0" y="0" width="1024" height="768" stretch="1">
            <texture x="0" y="1" width="640" height="368">
              intro\AMD_fusion_final_720
            </texture>
          </video_wnd>
        </item>
      </intro_logo>
    );
  } else {
    return (
      <intro_logo>
        <global_wnd>
          <auto_static></auto_static>
        </global_wnd>
        <item type="image">
          <main_wnd>
            <auto_static></auto_static>
          </main_wnd>
        </item>
      </intro_logo>
    );
  }
}
