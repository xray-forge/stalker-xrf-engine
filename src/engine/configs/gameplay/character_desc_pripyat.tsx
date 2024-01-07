import { JSXNode, JSXXML } from "jsx-xml";

import {
  characterProfileCriticals,
  defaultCharacterDialogs,
  defaultCharacterDialogsNoGuide,
  loadoutCharacterDrugs,
  loadoutCharacterDrugs2,
  loadoutCharacterDrugs3,
  loadoutCharacterDrugs4,
  loadoutCharacterDrugsMilitary,
  loadoutCharacterDrugsScientific,
  loadoutCharacterFood,
  loadoutCharacterFoodArmy,
  loadoutCharacterItems,
  loadoutCharacterItems3,
  loadoutCharacterItemsWithoutDetector,
  loadoutCharacterSellWeapons,
} from "@/engine/configs/gameplay/loadouts";
import { SpecificCharacter } from "@/engine/configs/gameplay/utils";
import { communities } from "@/engine/lib/constants/communities";
import { ammo } from "@/engine/lib/constants/items/ammo";
import { detectors } from "@/engine/lib/constants/items/detectors";
import { misc } from "@/engine/lib/constants/items/misc";
import { questItems } from "@/engine/lib/constants/items/quest_items";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { GENERATE_STALKER_NAME } from "@/engine/lib/constants/names";

export function create(): JSXNode {
  return (
    <xml>
      <SpecificCharacter
        id={"pri_a17_military_captain_tarasov"}
        class={"pri_a17_military_captain_tarasov"}
        name={"pri_a17_military_captain_tarasov"}
        icon={"ui_inGame2_Soldier_2"}
        community={communities.army}
        rank={70}
        soundConfig={"characters_voice\\human_02\\military\\"}
        visual={"actors\\stalker_soldier\\stalker_soldier_2"}
        supplies={[
          { section: weapons.wpn_binoc },
          { section: weapons.wpn_val, scope: true },
          { section: weapons.wpn_pb },
          { section: weapons.grenade_f1, count: 3 },
          { section: ammo.ammo_9x39_ap },
          { section: ammo.ammo_9x18_pmm },
          ...loadoutCharacterFoodArmy,
          ...loadoutCharacterDrugs4,
          ...loadoutCharacterDrugsMilitary,
        ]}
      >
        {characterProfileCriticals}
        <actor_dialog>pri_a17_military_recon_squad_ambush_actor_ready</actor_dialog>
        <actor_dialog>actor_break_dialog</actor_dialog>
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_a17_military_prapor_valentyr"}
        class={"pri_a17_military_prapor_valentyr"}
        name={"pri_a17_military_prapor_valentyr"}
        icon={"ui_inGame2_Soldier_3"}
        community={communities.army}
        rank={40}
        soundConfig={"characters_voice\\human_03\\military\\"}
        visual={"actors\\stalker_soldier\\stalker_soldier_3"}
        supplies={[
          { section: weapons.wpn_binoc },
          { section: weapons.wpn_abakan, scope: true },
          { section: weapons.wpn_pb },
          { section: weapons.grenade_f1, count: 2 },
          { section: ammo["ammo_5.45x39_ap"] },
          { section: ammo.ammo_9x18_pmm },
          ...loadoutCharacterFoodArmy,
          ...loadoutCharacterDrugs4,
          ...loadoutCharacterDrugsMilitary,
        ]}
      >
        {characterProfileCriticals}
        <actor_dialog>actor_break_dialog</actor_dialog>
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_a17_military_sergeant_morozov"}
        class={"pri_a17_military_sergeant_morozov"}
        name={"pri_a17_military_sergeant_morozov"}
        icon={"ui_inGame2_Soldier_2"}
        community={communities.army}
        rank={80}
        soundConfig={"characters_voice\\human_01\\military\\"}
        visual={"actors\\stalker_soldier\\stalker_soldier_2"}
        supplies={[
          { section: weapons.wpn_binoc },
          { section: weapons.wpn_svu },
          { section: weapons.wpn_pb },
          { section: weapons.grenade_f1, count: 1 },
          { section: ammo["ammo_7.62x54_7h1"] },
          { section: ammo.ammo_9x18_pmm },
          ...loadoutCharacterFoodArmy,
          ...loadoutCharacterDrugs4,
          ...loadoutCharacterDrugsMilitary,
        ]}
      >
        {characterProfileCriticals}
        <actor_dialog>actor_break_dialog</actor_dialog>
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_a17_military_lieutenant_podorojniy"}
        class={"pri_a17_military_lieutenant_podorojniy"}
        name={"pri_a17_military_lieutenant_podorojniy"}
        icon={"ui_inGame2_Soldier_3"}
        community={communities.army}
        rank={50}
        soundConfig={"characters_voice\\human_03\\military\\"}
        visual={"actors\\stalker_soldier\\stalker_soldier_2"}
        supplies={[
          { section: weapons.wpn_binoc },
          { section: weapons.wpn_abakan, scope: true },
          { section: weapons.wpn_pb },
          { section: weapons.grenade_f1, count: 2 },
          { section: ammo["ammo_5.45x39_ap"] },
          { section: ammo.ammo_9x18_pmm },
          ...loadoutCharacterFoodArmy,
          ...loadoutCharacterDrugs4,
          ...loadoutCharacterDrugsMilitary,
        ]}
      >
        {characterProfileCriticals}
        <actor_dialog>actor_break_dialog</actor_dialog>
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_a17_military_colonel_kovalski"}
        class={"pri_a17_military_colonel_kovalski"}
        name={"pri_a17_military_colonel_kovalski_name"}
        icon={"ui_inGame2_Kovalskiy"}
        community={communities.army}
        rank={75}
        soundConfig={"characters_voice\\human_02\\military\\"}
        visual={"actors\\stalker_soldier\\stalker_soldier_3_face_1"}
        supplies={[
          { section: weapons.wpn_binoc },
          { section: misc.hand_radio },
          { section: weapons.wpn_groza, scope: true },
          { section: weapons.wpn_fort },
          { section: weapons.grenade_f1, count: 2 },
          { section: ammo.ammo_9x39_ap },
          { section: ammo.ammo_9x18_pmm },
          ...loadoutCharacterFoodArmy,
          ...loadoutCharacterDrugs2,
          ...loadoutCharacterDrugsMilitary,
        ]}
      >
        {characterProfileCriticals}
        <start_dialog>pri_a17_military_base_commander_start</start_dialog>
        <actor_dialog>pri_a17_military_base_commander_actor_dialog_1</actor_dialog>
        <actor_dialog>pri_a17_military_base_commander_actor_questions_dialog</actor_dialog>
        <actor_dialog>pri_a17_military_colonel_kovalski_a23_about_gauss_labx8</actor_dialog>
        <actor_dialog>pri_a16_colonel_a21_about_sentry_dialog</actor_dialog>
        <actor_dialog>pri_a16_colonel_a21_about_sentry_pass_task_dialog</actor_dialog>
        <actor_dialog>pri_a17_military_colonel_kovalski_b35_about_merc_start</actor_dialog>
        <actor_dialog>pri_a17_military_colonel_kovalski_b35_actor_know_about_merc</actor_dialog>
        <actor_dialog>pri_a17_military_colonel_kovalski_b35_reward</actor_dialog>
        <actor_dialog>pri_a17_military_colonel_kovalski_evacuation_ready</actor_dialog>
        <actor_dialog>actor_break_dialog</actor_dialog>
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_a17_monolith_preacher"}
        class={"pri_a17_monolith_preacher"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_monolit_3"}
        community={communities.monolith}
        rank={100}
        soundConfig={"characters_voice\\human_01\\monolith\\"}
        visual={"actors\\stalker_monolith\\stalker_monolith_3"}
        supplies={[
          { section: questItems.pri_a17_gauss_rifle },
          { section: weapons.wpn_colt1911 },
          { section: weapons.grenade_f1, count: 1 },
          { section: ammo.ammo_gauss },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...loadoutCharacterItemsWithoutDetector,
          ...loadoutCharacterFoodArmy,
          ...loadoutCharacterDrugs4,
          ...loadoutCharacterDrugsScientific,
        ]}
      >
        {characterProfileCriticals}
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_a15_sokolov"}
        class={"pri_a15_sokolov"}
        name={"pri_a15_sokolov_name"}
        icon={"ui_inGame2_Sokolov"}
        community={communities.army}
        rank={50}
        soundConfig={"characters_voice\\human_01\\military\\"}
        visual={"actors\\stalker_soldier\\stalker_soldier_1_face_1"}
        supplies={[
          { section: weapons.wpn_binoc },
          { section: weapons.wpn_ak74u },
          { section: weapons.wpn_fort },
          { section: weapons.grenade_f1, count: 1 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_pmm },
          ...loadoutCharacterFoodArmy,
          ...loadoutCharacterDrugs2,
          ...loadoutCharacterDrugsMilitary,
        ]}
      >
        {characterProfileCriticals}
        <start_dialog>pri_a15_sokolov_start_dialog</start_dialog>
        <actor_dialog>pri_a15_sokolov_where_from</actor_dialog>
        <actor_dialog>pri_a15_sokolov_jupiter</actor_dialog>
        <actor_dialog>pri_a15_sokolov_evacuation_point</actor_dialog>
        <actor_dialog>pri_a15_sokolov_evacuation_note</actor_dialog>
        <actor_dialog>pri_a15_sokolov_occupation</actor_dialog>
        <actor_dialog>pri_a15_sokolov_pripyat_group</actor_dialog>
        <actor_dialog>pri_a15_sokolov_need_outfit</actor_dialog>
        <actor_dialog>pri_a15_sokolov_arranged_outfit</actor_dialog>
        <actor_dialog>pri_a15_sokolov_goto_zulus</actor_dialog>
        <actor_dialog>pri_a15_sokolov_acquaintance_after_jorney</actor_dialog>
        <actor_dialog>pri_a15_sokolov_about_journey</actor_dialog>
        <actor_dialog>pri_a15_sokolov_helicopter</actor_dialog>
        <actor_dialog>actor_break_dialog</actor_dialog>
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_a15_sokolov_sci"}
        class={"pri_a15_sokolov_sci"}
        name={"pri_a15_sokolov_name"}
        icon={"ui_inGame2_Sokolov_ecolog"}
        community={communities.army}
        rank={50}
        soundConfig={"characters_voice\\human_01\\military\\"}
        visual={"actors\\stalker_soldier\\stalker_soldier_ecolog_face_1"}
        supplies={[
          { section: weapons.wpn_binoc },
          { section: weapons.wpn_ak74u },
          { section: weapons.wpn_fort },
          { section: weapons.grenade_f1, count: 1 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_pmm },
          ...loadoutCharacterFoodArmy,
          ...loadoutCharacterDrugs2,
          ...loadoutCharacterDrugsMilitary,
        ]}
      >
        {characterProfileCriticals}
        <start_dialog>pri_a15_sokolov_start_dialog</start_dialog>
        <actor_dialog>pri_a15_sokolov_pripyat_ready</actor_dialog>
        <actor_dialog>pri_a15_sokolov_evacuation_point</actor_dialog>
        <actor_dialog>pri_a15_sokolov_evacuation_note</actor_dialog>
        <actor_dialog>actor_break_dialog</actor_dialog>
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_a15_sokolov_sci_head"}
        class={"pri_a15_sokolov_sci_head"}
        name={"pri_a15_sokolov_name"}
        icon={"ui_inGame2_Sokolov"}
        community={communities.army}
        rank={50}
        soundConfig={"characters_voice\\human_01\\military\\"}
        visual={"actors\\stalker_soldier\\stalker_soldier_1_face_1"}
        supplies={[
          { section: weapons.wpn_binoc },
          { section: weapons.wpn_ak74u },
          { section: weapons.wpn_fort },
          { section: weapons.grenade_f1, count: 1 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_pmm },
          ...loadoutCharacterFoodArmy,
          ...loadoutCharacterDrugs2,
          ...loadoutCharacterDrugsMilitary,
        ]}
      >
        {characterProfileCriticals}
        <start_dialog>pri_a15_sokolov_start_dialog</start_dialog>
        <actor_dialog>pri_a15_sokolov_pripyat_ready</actor_dialog>
        <actor_dialog>pri_a15_sokolov_evacuation_point</actor_dialog>
        <actor_dialog>pri_a15_sokolov_evacuation_note</actor_dialog>
        <actor_dialog>pri_a15_sokolov_acquaintance_after_jorney</actor_dialog>
        <actor_dialog>pri_a15_sokolov_about_journey</actor_dialog>
        <actor_dialog>pri_a15_sokolov_helicopter</actor_dialog>
        <actor_dialog>actor_break_dialog</actor_dialog>
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_a22_military_merkulov"}
        class={"pri_a22_military_merkulov"}
        name={"pri_a18_vano_in_suit_reserve_name"}
        icon={"ui_inGame2_Soldier_4"}
        community={communities.army}
        rank={40}
        soundConfig={"characters_voice\\human_03\\military\\"}
        visual={"actors\\stalker_soldier\\stalker_soldier_4"}
        supplies={[
          { section: weapons.wpn_binoc },
          { section: weapons.wpn_val },
          { section: weapons.wpn_fort },
          { section: weapons.grenade_f1, count: 1 },
          { section: ammo.ammo_9x39_ap },
          { section: ammo.ammo_9x18_pmm },
          ...loadoutCharacterFoodArmy,
          ...loadoutCharacterDrugs2,
          ...loadoutCharacterDrugsMilitary,
        ]}
      >
        {characterProfileCriticals}
        <actor_dialog>actor_break_dialog</actor_dialog>
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_a22_military_skelja"}
        class={"pri_a22_military_skelja"}
        name={"pri_a18_skorlupko_in_suit_name"}
        icon={"ui_inGame2_Soldier_4"}
        community={communities.army}
        rank={40}
        soundConfig={"characters_voice\\human_03\\military\\"}
        visual={"actors\\stalker_soldier\\stalker_soldier_4"}
        supplies={[
          { section: weapons.wpn_binoc },
          { section: weapons.wpn_abakan, scope: true },
          { section: weapons.wpn_fort },
          { section: weapons.grenade_f1, count: 1 },
          { section: ammo["ammo_5.45x39_ap"] },
          { section: ammo.ammo_9x18_pmm },
          ...loadoutCharacterFoodArmy,
          ...loadoutCharacterDrugs2,
          ...loadoutCharacterDrugsMilitary,
        ]}
      >
        {characterProfileCriticals}
        <actor_dialog>actor_break_dialog</actor_dialog>
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_a22_military_yarmoshuk"}
        class={"pri_a22_military_yarmoshuk"}
        name={"pri_a22_military_yarmoshuk_name"}
        icon={"ui_inGame2_Soldier_3"}
        community={communities.army}
        rank={30}
        soundConfig={"characters_voice\\human_03\\military\\"}
        visual={"actors\\stalker_soldier\\stalker_soldier_3"}
        supplies={[
          { section: weapons.wpn_binoc },
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_fort },
          { section: weapons.grenade_f1, count: 1 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_pmm },
          { section: questItems.pri_a25_explosive_charge_item },
          ...loadoutCharacterFoodArmy,
          ...loadoutCharacterDrugs2,
          ...loadoutCharacterDrugsMilitary,
        ]}
      >
        {characterProfileCriticals}
        <actor_dialog>actor_break_dialog</actor_dialog>
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_a15_military_recon_leader"}
        class={"pri_a15_military_recon_leader"}
        name={"pri_a15_military_recon_leader_name"}
        icon={"ui_inGame2_Soldier_2"}
        community={communities.army}
        rank={40}
        soundConfig={"characters_voice\\human_02\\military\\"}
        visual={"actors\\stalker_soldier\\stalker_soldier_2"}
        supplies={[
          { section: weapons.wpn_binoc },
          { section: weapons.wpn_abakan, scope: true },
          { section: weapons.wpn_fort },
          { section: weapons.grenade_f1, count: 1 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_pmm },
          ...loadoutCharacterFoodArmy,
          ...loadoutCharacterDrugs2,
          ...loadoutCharacterDrugsMilitary,
        ]}
      >
        {characterProfileCriticals}
        <actor_dialog>actor_break_dialog</actor_dialog>
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_a15_military_recon_1"}
        class={"pri_a15_military_recon_1"}
        name={"pri_a15_military_recon_1_name"}
        icon={"ui_inGame2_Soldier_2"}
        community={communities.army}
        rank={40}
        soundConfig={"characters_voice\\human_01\\military\\"}
        visual={"actors\\stalker_soldier\\stalker_soldier_2"}
        supplies={[
          { section: weapons.wpn_ak74, launcher: true },
          { section: weapons.wpn_fort },
          { section: weapons.grenade_f1, count: 1 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_pmm },
          ...loadoutCharacterFoodArmy,
          ...loadoutCharacterDrugs2,
          ...loadoutCharacterDrugsMilitary,
        ]}
      >
        {characterProfileCriticals}
        <actor_dialog>actor_break_dialog</actor_dialog>
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_a15_military_recon_2"}
        class={"pri_a15_military_recon_2"}
        name={"pri_a15_military_recon_2_name"}
        icon={"ui_inGame2_Soldier_4"}
        community={communities.army}
        rank={40}
        soundConfig={"characters_voice\\human_03\\military\\"}
        visual={"actors\\stalker_soldier\\stalker_soldier_4"}
        supplies={[
          { section: weapons.wpn_val },
          { section: weapons.wpn_fort },
          { section: weapons.grenade_f1, count: 2 },
          { section: ammo.ammo_9x39_pab9 },
          { section: ammo.ammo_9x18_pmm },
          ...loadoutCharacterFoodArmy,
          ...loadoutCharacterDrugs2,
          ...loadoutCharacterDrugsMilitary,
        ]}
      >
        {characterProfileCriticals}
        <actor_dialog>actor_break_dialog</actor_dialog>
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_a15_military_recon_3"}
        class={"pri_a15_military_recon_3"}
        name={"pri_a15_military_recon_3_name"}
        icon={"ui_inGame2_Soldier_4"}
        community={communities.army}
        rank={40}
        soundConfig={"characters_voice\\human_03\\military\\"}
        visual={"actors\\stalker_soldier\\stalker_soldier_4"}
        supplies={[
          { section: weapons.wpn_vintorez },
          { section: weapons.wpn_fort },
          { section: weapons.grenade_f1, count: 2 },
          { section: ammo.ammo_9x39_pab9 },
          { section: ammo.ammo_9x18_pmm },
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs,
        ]}
      >
        {characterProfileCriticals}
        <actor_dialog>actor_break_dialog</actor_dialog>
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_a21_sentry_lieutenant_stecenko"}
        class={"pri_a21_sentry_lieutenant_stecenko"}
        name={"pri_a21_sentry_lieutenant_stecenko_name"}
        icon={"ui_inGame2_Soldier_2"}
        community={communities.army}
        rank={40}
        soundConfig={"characters_voice\\human_02\\military\\"}
        visual={"actors\\stalker_soldier\\stalker_soldier_2"}
        supplies={[
          { section: misc.device_torch },
          { section: weapons.wpn_binoc },
          { section: weapons.wpn_ak74u },
          { section: weapons.grenade_f1, count: 2 },
          { section: ammo["ammo_5.45x39_fmj"] },
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs,
          ...loadoutCharacterDrugsMilitary,
        ]}
      >
        {characterProfileCriticals}
        <actor_dialog>actor_break_dialog</actor_dialog>
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_a25_army_medic"}
        class={"pri_a25_army_medic"}
        name={"pri_a25_army_medic_name"}
        icon={"ui_inGame2_Rogovets"}
        community={communities.army}
        rank={40}
        soundConfig={"characters_voice\\human_02\\military\\"}
        visual={"actors\\stalker_soldier\\stalker_soldier_2_face_1"}
        supplies={[
          { section: weapons.wpn_binoc },
          { section: weapons.wpn_abakan, scope: true },
          { section: weapons.wpn_fort },
          { section: weapons.grenade_f1, count: 2 },
          { section: ammo["ammo_5.45x39_ap"] },
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs4,
          ...loadoutCharacterDrugsMilitary,
          ...loadoutCharacterDrugsScientific,
        ]}
      >
        {characterProfileCriticals}
        <start_dialog>pri_a25_army_medic_start_dialog</start_dialog>
        <actor_dialog>pri_a25_army_medic_rescued</actor_dialog>
        <actor_dialog>pri_a25_army_medic_supply_medicine</actor_dialog>
        <actor_dialog>pri_a25_army_medic_need_health_care</actor_dialog>
        <actor_dialog>actor_break_dialog</actor_dialog>
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_b306_envoy"}
        class={"pri_b306_envoy"}
        name={"pri_b306_envoy_name"}
        icon={"ui_inGame2_ecolog_military"}
        community={communities.killer}
        rank={60}
        soundConfig={"characters_voice\\human_03\\military\\"}
        visual={"actors\\stalker_soldier\\stalker_ecolog_military"}
        supplies={[
          { section: questItems.pri_b306_envoy_pda },
          ...loadoutCharacterItemsWithoutDetector,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs4,
          ...loadoutCharacterDrugsScientific,
        ]}
      >
        {characterProfileCriticals}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_a15_actor"}
        class={"pri_a15_actor"}
        name={"st_actor_name"}
        icon={"ui_inGame2_Hero"}
        community={communities.stalker}
        soundConfig={"characters_voice\\human_02\\stalker\\"}
        visual={"actors\\stalker_hero\\stalker_hero_1"}
        supplies={[
          { section: misc.device_torch },
          { section: questItems.pri_a15_wpn_ak74 },
          { section: questItems.pri_a15_documents },
          ...loadoutCharacterItems,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs,
        ]}
      >
        {characterProfileCriticals}
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_a15_vano"}
        class={"pri_a15_vano"}
        name={"jup_a10_stalker_vano"}
        icon={"ui_npc_u_soldier_1"}
        community={communities.stalker}
        rank={20}
        soundConfig={"characters_voice\\human_01\\stalker\\"}
        visual={"actors\\stalker_neutral\\stalker_neutral_nauchniy_face_1"}
        supplies={[
          { section: misc.device_torch },
          { section: questItems.pri_a15_wpn_wincheaster1300 },
          ...loadoutCharacterItems,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs,
        ]}
      >
        {characterProfileCriticals}
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_a15_sokolov_scene"}
        class={"pri_a15_sokolov_scene"}
        name={"pri_a15_sokolov_name"}
        icon={"ui_inGame2_Sokolov_ecolog"}
        community={communities.army}
        rank={30}
        soundConfig={"characters_voice\\human_01\\military\\"}
        visual={"actors\\stalker_soldier\\stalker_soldier_ecolog_face_1"}
        supplies={[
          { section: misc.device_torch },
          { section: questItems.pri_a15_wpn_ak74u },
          ...loadoutCharacterItems,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs,
        ]}
      >
        {characterProfileCriticals}
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_a15_zulus"}
        class={"pri_a15_zulus"}
        name={"jup_b15_zulus"}
        icon={"ui_inGame2_Zulus"}
        community={communities.stalker}
        rank={50}
        soundConfig={"characters_voice\\human_02\\dolg\\"}
        visual={"actors\\stalker_soldier\\stalker_dolg_1_face_1"}
        supplies={[
          { section: misc.device_torch },
          { section: weapons.wpn_pkm_zulus },
          { section: ammo.ammo_pkm_100 },
          ...loadoutCharacterItems,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs,
        ]}
      >
        {characterProfileCriticals}
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_a15_wanderer"}
        class={"pri_a15_wanderer"}
        name={"jup_b4_monolith_squad_leader_name"}
        icon={"ui_inGame2_Brodyaga_monolit"}
        community={communities.stalker}
        rank={100}
        soundConfig={"characters_voice\\human_02\\dolg\\"}
        visual={"actors\\stalker_monolith\\stalker_monolith_1_face_1"}
        supplies={[
          { section: misc.device_torch },
          { section: questItems.pri_a15_wpn_svu },
          { section: ammo.ammo_pkm_100 },
          ...loadoutCharacterItems,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs,
        ]}
      >
        {characterProfileCriticals}
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_a15_military_tarasov"}
        class={"pri_a15_military_tarasov"}
        name={"pri_a17_military_captain_tarasov"}
        icon={"ui_inGame2_Soldier_2"}
        community={communities.army}
        rank={30}
        soundConfig={"characters_voice\\human_02\\military\\"}
        visual={"actors\\stalker_soldier\\stalker_soldier_2"}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: ammo["ammo_5.45x39_fmj"] },
          ...loadoutCharacterItems,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs,
        ]}
      >
        {characterProfileCriticals}
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_a15_military_2"}
        class={"pri_a15_military_2"}
        name={"pri_a17_military_prapor_valentyr"}
        icon={"ui_inGame2_Soldier_4"}
        community={communities.army}
        rank={40}
        soundConfig={"characters_voice\\human_03\\military\\"}
        visual={"actors\\stalker_soldier\\stalker_soldier_4"}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: ammo["ammo_5.45x39_fmj"] },
          ...loadoutCharacterItems,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs,
        ]}
      >
        {characterProfileCriticals}
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_a15_military_3"}
        class={"pri_a15_military_3"}
        name={"pri_a17_military_sergeant_morozov"}
        icon={"ui_inGame2_Soldier_2"}
        community={communities.army}
        rank={40}
        soundConfig={"characters_voice\\human_01\\military\\"}
        visual={"actors\\stalker_soldier\\stalker_soldier_2"}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: ammo["ammo_5.45x39_fmj"] },
          ...loadoutCharacterItems,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs,
        ]}
      >
        {characterProfileCriticals}
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_a15_military_4"}
        class={"pri_a15_military_4"}
        name={"pri_a17_military_lieutenant_podorojniy"}
        icon={"ui_inGame2_Soldier_3"}
        community={communities.army}
        rank={40}
        soundConfig={"characters_voice\\human_03\\military\\"}
        visual={"actors\\stalker_soldier\\stalker_soldier_3"}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: ammo["ammo_5.45x39_fmj"] },
          ...loadoutCharacterItems,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs,
        ]}
      >
        {characterProfileCriticals}
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_a22_army_signaller"}
        class={"pri_a22_army_signaller"}
        name={"st_pri_a22_army_signaller"}
        icon={"ui_inGame2_Soldier_2"}
        community={communities.army}
        mechanicMode={true}
        rank={40}
        moneyMin={1000}
        moneyMax={5000}
        soundConfig={"characters_voice\\human_01\\military\\"}
        visual={"actors\\stalker_soldier\\stalker_soldier_2"}
        supplies={[
          { section: misc.hand_radio },
          { section: weapons.wpn_binoc },
          { section: weapons.wpn_groza },
          { section: weapons.wpn_fort },
          { section: weapons.grenade_f1 },
          { section: ammo.ammo_9x39_ap },
          { section: ammo.ammo_9x18_pmm },
          ...loadoutCharacterFoodArmy,
          ...loadoutCharacterDrugs2,
          ...loadoutCharacterDrugsMilitary,
        ]}
      >
        {characterProfileCriticals}
        <start_dialog>pri_a22_army_signaller_start_dialog</start_dialog>
        <actor_dialog>pri_a22_army_signaller_about_rfi_source</actor_dialog>
        <actor_dialog>pri_a22_army_signaller_about_signal</actor_dialog>
        <actor_dialog>pri_a22_army_signaller_supply_outfit</actor_dialog>
        <actor_dialog>pri_a22_army_signaller_supply_ammo</actor_dialog>
        <actor_dialog>pri_a22_army_signaller_supply_grenade</actor_dialog>
        <actor_dialog>actor_break_dialog</actor_dialog>
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_b35_merc_leader"}
        class={"pri_b35_merc_leader"}
        name={"st_pri_b35_merc_leader"}
        icon={"ui_inGame2_merc_4"}
        community={communities.killer}
        mechanicMode={true}
        rank={50}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        visual={"actors\\stalker_merc\\stalker_merc_4"}
        supplies={[
          { section: weapons.wpn_g36 },
          { section: weapons.wpn_usp },
          { section: weapons.grenade_f1 },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...loadoutCharacterItemsWithoutDetector,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs4,
          ...loadoutCharacterDrugsScientific,
        ]}
      >
        {characterProfileCriticals}
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_b35_merc_grenade_launcher_1"}
        class={"pri_b35_merc_grenade_launcher_1"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_merc_2"}
        community={communities.killer}
        mechanicMode={true}
        rank={50}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        visual={"actors\\stalker_merc\\stalker_merc_2"}
        supplies={[
          { section: weapons.wpn_rpg7 },
          { section: weapons.wpn_usp },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...loadoutCharacterItemsWithoutDetector,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs3,
          ...loadoutCharacterDrugsScientific,
        ]}
      >
        {characterProfileCriticals}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_b35_merc_grenade_launcher_2"}
        class={"pri_b35_merc_grenade_launcher_2"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_merc_2"}
        community={communities.killer}
        mechanicMode={true}
        rank={50}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        visual={"actors\\stalker_merc\\stalker_merc_2"}
        supplies={[
          { section: weapons.wpn_rpg7 },
          { section: weapons.wpn_usp },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...loadoutCharacterItemsWithoutDetector,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs3,
          ...loadoutCharacterDrugsScientific,
        ]}
      >
        {characterProfileCriticals}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_b35_envoy"}
        class={"pri_b35_envoy"}
        name={"st_pri_b35_envoy"}
        icon={"ui_inGame2_ecolog_military"}
        community={communities.killer}
        mechanicMode={true}
        rank={30}
        soundConfig={"characters_voice\\human_03\\stalker\\"}
        visual={"actors\\stalker_soldier\\stalker_ecolog_military"}
        supplies={[
          { section: questItems.pri_b35_lab_x8_key },
          { section: weapons.wpn_usp },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...loadoutCharacterItemsWithoutDetector,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs4,
          ...loadoutCharacterDrugsScientific,
        ]}
      >
        {characterProfileCriticals}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_b35_guard_envoy_1"}
        class={"pri_b35_guard_envoy_1"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_ecolog_military"}
        community={communities.killer}
        mechanicMode={true}
        rank={50}
        soundConfig={"characters_voice\\human_03\\stalker\\"}
        visual={"actors\\stalker_soldier\\stalker_ecolog_military"}
        supplies={[
          { section: weapons.wpn_lr300, scope: true },
          { section: weapons.wpn_usp },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...loadoutCharacterItemsWithoutDetector,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs4,
          ...loadoutCharacterDrugsScientific,
        ]}
      >
        {characterProfileCriticals}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_b35_guard_envoy_2"}
        class={"pri_b35_guard_envoy_2"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_ecolog_military"}
        community={communities.killer}
        mechanicMode={true}
        rank={50}
        soundConfig={"characters_voice\\human_03\\stalker\\"}
        visual={"actors\\stalker_soldier\\stalker_ecolog_military"}
        supplies={[
          { section: weapons.wpn_lr300, scope: true },
          { section: weapons.wpn_usp },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...loadoutCharacterItemsWithoutDetector,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs4,
          ...loadoutCharacterDrugsScientific,
        ]}
      >
        {characterProfileCriticals}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_b36_monolith_sniper"}
        class={"pri_b36_monolith_sniper"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_monolit_2"}
        community={communities.monolith}
        mechanicMode={true}
        rank={80}
        soundConfig={"characters_voice\\human_02\\monolith\\"}
        visual={"actors\\stalker_monolith\\stalker_monolith_2"}
        supplies={[
          { section: weapons.wpn_svd },
          { section: weapons.wpn_colt1911 },
          { section: weapons.grenade_f1 },
          { section: ammo["ammo_7.62x54_7h1"] },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...loadoutCharacterItemsWithoutDetector,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs2,
        ]}
      >
        {characterProfileCriticals}
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_b36_monolith_master_hiding_place"}
        class={"pri_b36_monolith_master_hiding_place"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_monolit_3"}
        community={communities.monolith}
        mechanicMode={true}
        rank={60}
        soundConfig={"characters_voice\\human_02\\monolith\\"}
        visual={"actors\\stalker_monolith\\stalker_monolith_3"}
        supplies={[
          { section: questItems.pri_b36_monolith_hiding_place_pda },
          { section: weapons.wpn_protecta },
          { section: weapons.wpn_desert_eagle },
          { section: weapons.grenade_f1 },
          { section: ammo.ammo_12x76_zhekan },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...loadoutCharacterItemsWithoutDetector,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs3,
        ]}
      >
        {characterProfileCriticals}
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_b36_monolith_marine_sniper"}
        class={"pri_b36_monolith_marine_sniper"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_monolit_3"}
        community={communities.monolith}
        mechanicMode={true}
        rank={80}
        soundConfig={"characters_voice\\human_02\\monolith\\"}
        visual={"actors\\stalker_monolith\\stalker_monolith_3"}
        supplies={[
          { section: weapons.wpn_vintorez },
          { section: weapons.wpn_colt1911 },
          { section: weapons.grenade_f1 },
          { section: ammo.ammo_9x39_ap },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...loadoutCharacterItemsWithoutDetector,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs3,
        ]}
      >
        {characterProfileCriticals}
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_b305_strelok"}
        class={"pri_b305_strelok"}
        name={"pri_b305_strelok_name"}
        icon={"ui_inGame2_Strelok"}
        community={communities.stalker}
        mechanicMode={true}
        rank={100}
        soundConfig={"characters_voice\\human_02\\stalker\\"}
        visual={"actors\\stalker_neutral\\stalker_neutral_nauchniy_face_2"}
        supplies={[
          { section: misc.device_torch },
          { section: detectors.detector_elite },
          { section: weapons.wpn_binoc },
          { section: weapons.wpn_ak74u },
          { section: weapons.wpn_colt1911 },
          { section: weapons.grenade_f1 },
          { section: ammo["ammo_5.45x39_ap"] },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...loadoutCharacterFoodArmy,
          ...loadoutCharacterDrugs4,
          ...loadoutCharacterDrugsScientific,
          ...loadoutCharacterDrugsMilitary,
        ]}
      >
        {characterProfileCriticals}
        <start_dialog>pri_b305_strelok_dialog</start_dialog>
        <actor_dialog>pri_b305_strelok_about_information</actor_dialog>
        <actor_dialog>pri_b305_strelok_about_station</actor_dialog>
        <actor_dialog>pri_b305_strelok_about_base</actor_dialog>
        <actor_dialog>pri_b305_strelok_note</actor_dialog>
        <actor_dialog>actor_break_dialog</actor_dialog>
      </SpecificCharacter>

      <SpecificCharacter
        id={"pri_a28_evac_com"}
        class={"pri_a28_evac_com"}
        name={"pri_a28_evac_com_name"}
        icon={"ui_inGame2_Soldier_2"}
        community={communities.army}
        mechanicMode={true}
        rank={50}
        soundConfig={"characters_voice\\human_02\\military\\"}
        visual={"actors\\stalker_soldier\\stalker_soldier_2"}
        supplies={[
          { section: weapons.wpn_abakan, scope: true },
          { section: weapons.wpn_fort },
          { section: weapons.grenade_f1 },
          { section: ammo["ammo_5.45x39_ap"] },
          { section: ammo.ammo_9x18_pmm },
          ...loadoutCharacterItemsWithoutDetector,
          ...loadoutCharacterFoodArmy,
          ...loadoutCharacterDrugs4,
          ...loadoutCharacterDrugsMilitary,
        ]}
      >
        {characterProfileCriticals}
        <actor_dialog>actor_break_dialog</actor_dialog>
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_stalker_pri_a16"}
        class={"sim_default_stalker_pri_a16"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_neutral_nauchniy"}
        community={communities.stalker}
        mechanicMode={true}
        rank={60}
        moneyMin={5000}
        moneyMax={10000}
        soundConfig={"characters_voice\\human_03\\stalker\\"}
        visual={"actors\\stalker_neutral\\stalker_neutral_nauchniy"}
        supplies={[
          { section: weapons.wpn_vintorez },
          { section: weapons.wpn_sig220 },
          { section: weapons.wpn_spas12 },
          { section: weapons.grenade_f1, count: 4 },
          { section: ammo.ammo_9x39_ap },
          { section: ammo.ammo_12x76_zhekan },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...loadoutCharacterItems3,
          ...loadoutCharacterFood,
          ...loadoutCharacterDrugs4,
          ...loadoutCharacterDrugsScientific,
          ...loadoutCharacterSellWeapons,
        ]}
      >
        {characterProfileCriticals}
        {defaultCharacterDialogsNoGuide}
      </SpecificCharacter>
    </xml>
  );
}
