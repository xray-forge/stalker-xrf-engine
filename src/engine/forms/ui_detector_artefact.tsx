import { JSXNode, JSXXML } from "jsx-xml";

/**
 * Generation of ui forms related to detector artefact display.
 */
export function create(): JSXNode {
  return (
    <w>
      <elite x={"0"} y={"0"} width={"0.0576"} height={"0.029"}>
        <wrk_area width={"0.0576"} height={"0.029"}>
          <auto_static width={"0.0576"} height={"0.029"} stretch={"1"}>
            <texture shader={"hud\\p3d"}>ui_temp_ad3_radar_glow</texture>
          </auto_static>
        </wrk_area>

        <af_sign width={"0.0045"} height={"0.005"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_temp_ad3_artefact</texture>
        </af_sign>

        <palette id={"af_sign"} width={"0.0045"} height={"0.005"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_temp_ad3_artefact</texture>
        </palette>
      </elite>

      <scientific x={"0"} y={"0"} width={"0.0576"} height={"0.029"}>
        <wrk_area width={"0.0576"} height={"0.029"}>
          <auto_static width={"0.0576"} height={"0.029"} stretch={"1"}>
            <texture shader={"hud\\p3d"}>ui_temp_ad3_radar_glow</texture>
          </auto_static>
        </wrk_area>

        <palette id={"zone_mine_acidic_weak"} width={"0.004"} height={"0.004"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_acid_big</texture>
        </palette>
        <palette id={"zone_mine_acidic_average"} width={"0.004"} height={"0.004"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_acid_big</texture>
        </palette>
        <palette id={"zone_mine_acidic_strong"} width={"0.004"} height={"0.004"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_acid_big</texture>
        </palette>

        <palette id={"zone_mine_chemical_weak"} width={"0.004"} height={"0.004"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_acid_big</texture>
        </palette>
        <palette id={"zone_mine_chemical_average"} width={"0.004"} height={"0.004"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_acid_big</texture>
        </palette>
        <palette id={"zone_mine_chemical_strong"} width={"0.004"} height={"0.004"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_acid_big</texture>
        </palette>

        <palette id={"zone_buzz_weak"} width={"0.004"} height={"0.004"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_acid_big</texture>
        </palette>
        <palette id={"zone_buzz_average"} width={"0.004"} height={"0.004"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_acid_big</texture>
        </palette>
        <palette id={"zone_buzz_strong"} width={"0.004"} height={"0.004"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_acid_big</texture>
        </palette>
        <palette id={"zone_mine_electric_strong"} width={"0.004"} height={"0.004"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_electro_big</texture>
        </palette>
        <palette id={"zone_mine_electric_average"} width={"0.004"} height={"0.004"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_electro_big</texture>
        </palette>
        <palette id={"zone_mine_electric_weak"} width={"0.004"} height={"0.004"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_electro_big</texture>
        </palette>

        <palette id={"zone_mine_static_strong"} width={"0.004"} height={"0.004"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_electro_big</texture>
        </palette>
        <palette id={"zone_mine_static_average"} width={"0.004"} height={"0.004"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_electro_big</texture>
        </palette>
        <palette id={"zone_mine_static_weak"} width={"0.004"} height={"0.004"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_electro_big</texture>
        </palette>

        <palette id={"zone_witches_galantine_strong"} width={"0.004"} height={"0.004"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_electro_big</texture>
        </palette>
        <palette id={"zone_witches_galantine_average"} width={"0.004"} height={"0.004"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_electro_big</texture>
        </palette>
        <palette id={"zone_witches_galantine_weak"} width={"0.004"} height={"0.004"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_electro_big</texture>
        </palette>

        <palette id={"zone_mine_gravitational_strong"} width={"0.008"} height={"0.008"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_gravity_big</texture>
        </palette>
        <palette id={"zone_mine_gravitational_average"} width={"0.008"} height={"0.008"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_gravity_big</texture>
        </palette>
        <palette id={"zone_mine_gravitational_weak"} width={"0.006"} height={"0.006"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_gravity_big</texture>
        </palette>

        <palette id={"zone_gravi_zone"} width={"0.008"} height={"0.008"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_gravity_big</texture>
        </palette>

        <palette id={"zone_mine_thermal_strong"} width={"0.004"} height={"0.004"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_fire_big</texture>
        </palette>
        <palette id={"zone_mine_thermal_average"} width={"0.004"} height={"0.004"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_fire_big</texture>
        </palette>
        <palette id={"zone_mine_thermal_weak"} width={"0.004"} height={"0.004"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_fire_big</texture>
        </palette>

        <palette id={"zone_zharka_static_weak"} width={"0.004"} height={"0.004"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_fire_big</texture>
        </palette>
        <palette id={"zone_zharka_static_average"} width={"0.004"} height={"0.004"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_fire_big</texture>
        </palette>
        <palette id={"zone_zharka_static_strong"} width={"0.004"} height={"0.004"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_fire_big</texture>
        </palette>

        <palette id={"zone_mine_steam_strong"} width={"0.004"} height={"0.004"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_fire_big</texture>
        </palette>
        <palette id={"zone_mine_steam_average"} width={"0.004"} height={"0.004"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_fire_big</texture>
        </palette>
        <palette id={"zone_mine_steam_weak"} width={"0.004"} height={"0.004"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_fire_big</texture>
        </palette>

        <palette id={"af_blood"} width={"0.0011"} height={"0.0011"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_artefact</texture>
        </palette>
        <palette id={"af_mincer_meat"} width={"0.0011"} height={"0.0011"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_artefact</texture>
        </palette>
        <palette id={"af_soul"} width={"0.0015"} height={"0.0015"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_artefact</texture>
        </palette>
        <palette id={"af_fuzz_kolobok"} width={"0.0015"} height={"0.0015"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_artefact</texture>
        </palette>
        <palette id={"af_baloon"} width={"0.0022"} height={"0.0022"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_artefact</texture>
        </palette>
        <palette id={"af_glass"} width={"0.0022"} height={"0.0022"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_artefact</texture>
        </palette>

        <palette id={"af_electra_sparkler"} width={"0.0011"} height={"0.0011"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_artefact</texture>
        </palette>
        <palette id={"af_electra_flash"} width={"0.0011"} height={"0.0011"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_artefact</texture>
        </palette>
        <palette id={"af_electra_moonlight"} width={"0.0015"} height={"0.0015"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_artefact</texture>
        </palette>
        <palette id={"af_dummy_battery"} width={"0.0015"} height={"0.0015"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_artefact</texture>
        </palette>
        <palette id={"af_dummy_dummy"} width={"0.0022"} height={"0.0022"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_artefact</texture>
        </palette>
        <palette id={"af_ice"} width={"0.0022"} height={"0.0022"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_artefact</texture>
        </palette>

        <palette id={"af_medusa"} width={"0.0011"} height={"0.0011"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_artefact</texture>
        </palette>
        <palette id={"af_cristall_flower"} width={"0.0011"} height={"0.0011"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_artefact</texture>
        </palette>
        <palette id={"af_night_star"} width={"0.0015"} height={"0.0015"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_artefact</texture>
        </palette>
        <palette id={"af_vyvert"} width={"0.0015"} height={"0.0015"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_artefact</texture>
        </palette>
        <palette id={"af_gravi"} width={"0.0022"} height={"0.0022"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_artefact</texture>
        </palette>
        <palette id={"af_gold_fish"} width={"0.0022"} height={"0.0022"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_artefact</texture>
        </palette>

        <palette id={"af_cristall"} width={"0.0011"} height={"0.0011"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_artefact</texture>
        </palette>
        <palette id={"af_fireball"} width={"0.0011"} height={"0.0011"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_artefact</texture>
        </palette>
        <palette id={"af_dummy_glassbeads"} width={"0.0015"} height={"0.0015"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_artefact</texture>
        </palette>
        <palette id={"af_eye"} width={"0.0015"} height={"0.0015"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_artefact</texture>
        </palette>
        <palette id={"af_fire"} width={"0.0022"} height={"0.0022"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_artefact</texture>
        </palette>

        <palette id={"af_oasis_heart"} width={"0.003"} height={"0.003"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_artefact</texture>
        </palette>
        <palette id={"af_quest_b14_twisted"} width={"0.0011"} height={"0.0011"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_artefact</texture>
        </palette>
        <palette id={"jup_b1_half_artifact"} width={"0.0011"} height={"0.0011"} stretch={"1"} alignment={"c"}>
          <texture shader={"hud\\p3d"}>ui_inGame2_Detector_icon_artefact</texture>
        </palette>
      </scientific>
    </w>
  );
}
