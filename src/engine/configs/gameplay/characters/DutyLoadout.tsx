import { Fragment, JSXNode, JSXXML } from "jsx-xml";

import { defaultCharacterDialogs } from "@/engine/configs/gameplay/character_dialogs";
import { defaultCharacterCritical } from "@/engine/configs/gameplay/loadouts/character_criticals";
import { defaultCharacterDrugs } from "@/engine/configs/gameplay/loadouts/character_drugs";
import { defaultCharacterDrugs2 } from "@/engine/configs/gameplay/loadouts/character_drugs_2";
import { defaultCharacterDrugs3 } from "@/engine/configs/gameplay/loadouts/character_drugs_3";
import { defaultCharacterDrugs4 } from "@/engine/configs/gameplay/loadouts/character_drugs_4";
import { defaultCharacterDrugsMilitary } from "@/engine/configs/gameplay/loadouts/character_drugs_mil";
import { defaultCharacterFood } from "@/engine/configs/gameplay/loadouts/character_food";
import { defaultCharacterItems } from "@/engine/configs/gameplay/loadouts/character_items";
import { defaultCharacterItems2 } from "@/engine/configs/gameplay/loadouts/character_items_2";
import { defaultCharacterItems3 } from "@/engine/configs/gameplay/loadouts/character_items_3";
import { defaultCharacterSellWeapons } from "@/engine/configs/gameplay/loadouts/character_sell_weapons";
import { SpecificCharacter } from "@/engine/configs/gameplay/utils";
import { communities } from "@/engine/lib/constants/communities";
import { ammo } from "@/engine/lib/constants/items/ammo";
import { weapons } from "@/engine/lib/constants/items/weapons";
import {
  GENERATE_ARMY_CAPTAIN_NAME,
  GENERATE_ARMY_LIEUTENANT_NAME,
  GENERATE_ARMY_PRIVATE_NAME,
  GENERATE_ARMY_SERGEANT_NAME,
  GENERATE_STALKER_NAME,
} from "@/engine/lib/constants/names";

export function DutyLoadout(): JSXNode {
  return (
    <Fragment>
      <SpecificCharacter
        id={"stalker_dolg_default"}
        className={"Stalker_dolg"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Dolg_2"}
        terrainSection={"stalker_terrain"}
        community={communities.dolg}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        visual={"actors\\stalker_dolg\\stalker_dolg_2"}
        supplies={[
          { section: weapons.wpn_sig550 },
          { section: weapons.wpn_beretta },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_5.56x45_ss190"] },
          { section: ammo.ammo_9x19_fmj },
          ...defaultCharacterItems,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_0_default_0"}
        className={"sim_default_duty_0"}
        name={GENERATE_ARMY_PRIVATE_NAME}
        icon={"ui_inGame2_Dolg_2"}
        terrainSection={"stalker_terrain"}
        community={communities.dolg}
        moneyMin={500}
        moneyMax={1500}
        rank={30}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        visual={"actors\\stalker_dolg\\stalker_dolg_2"}
        supplies={[
          { section: weapons.wpn_ak74u },
          { section: weapons.wpn_fort },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...defaultCharacterItems,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_0_default_1"}
        className={"sim_default_duty_0"}
        name={GENERATE_ARMY_PRIVATE_NAME}
        icon={"ui_inGame2_Dolg_2"}
        terrainSection={"stalker_terrain"}
        community={communities.dolg}
        moneyMin={500}
        moneyMax={1500}
        rank={30}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        visual={"actors\\stalker_dolg\\stalker_dolg_2"}
        supplies={[
          { section: weapons.wpn_ak74u },
          { section: weapons.wpn_pm },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...defaultCharacterItems,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_0_default_2"}
        className={"sim_default_duty_0"}
        name={GENERATE_ARMY_PRIVATE_NAME}
        icon={"ui_inGame2_Dolg_2"}
        terrainSection={"stalker_terrain"}
        community={communities.dolg}
        moneyMin={500}
        moneyMax={1500}
        rank={30}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        visual={"actors\\stalker_dolg\\stalker_dolg_2"}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_fort },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...defaultCharacterItems,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_0_default_3"}
        className={"sim_default_duty_0"}
        name={GENERATE_ARMY_PRIVATE_NAME}
        icon={"ui_inGame2_Dolg_2"}
        terrainSection={"stalker_terrain"}
        community={communities.dolg}
        moneyMin={500}
        moneyMax={1500}
        rank={30}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        visual={"actors\\stalker_dolg\\stalker_dolg_2"}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_pm },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...defaultCharacterItems,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_1_default_0"}
        className={"sim_default_duty_1"}
        name={GENERATE_ARMY_PRIVATE_NAME}
        icon={"ui_inGame2_Dolg_2"}
        terrainSection={"stalker_terrain"}
        community={communities.dolg}
        moneyMin={1000}
        moneyMax={3000}
        rank={35}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        visual={"actors\\stalker_dolg\\stalker_dolg_2"}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_fort },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...defaultCharacterItems,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs2,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_1_default_1"}
        className={"sim_default_duty_1"}
        name={GENERATE_ARMY_PRIVATE_NAME}
        icon={"ui_inGame2_Dolg_2"}
        terrainSection={"stalker_terrain"}
        community={communities.dolg}
        moneyMin={1000}
        moneyMax={3000}
        rank={35}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        visual={"actors\\stalker_dolg\\stalker_dolg_2"}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_pm },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...defaultCharacterItems,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs2,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_1_default_2"}
        className={"sim_default_duty_1"}
        name={GENERATE_ARMY_SERGEANT_NAME}
        icon={"ui_inGame2_Dolg_2"}
        terrainSection={"stalker_terrain"}
        community={communities.dolg}
        moneyMin={1000}
        moneyMax={3000}
        rank={35}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        visual={"actors\\stalker_dolg\\stalker_dolg_2"}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_pm },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...defaultCharacterItems,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs2,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_1_default_3"}
        className={"sim_default_duty_1"}
        name={GENERATE_ARMY_SERGEANT_NAME}
        icon={"ui_inGame2_Dolg_2"}
        terrainSection={"stalker_terrain"}
        community={communities.dolg}
        moneyMin={1000}
        moneyMax={3000}
        rank={35}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        visual={"actors\\stalker_dolg\\stalker_dolg_2"}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_fort },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...defaultCharacterItems,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs2,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_2_default_0"}
        className={"sim_default_duty_2"}
        name={GENERATE_ARMY_SERGEANT_NAME}
        icon={"ui_inGame2_Dolg_2"}
        terrainSection={"stalker_terrain"}
        community={communities.dolg}
        moneyMin={1500}
        moneyMax={3500}
        rank={45}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        visual={"actors\\stalker_dolg\\stalker_dolg_2"}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_pm },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...defaultCharacterItems2,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs2,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_2_default_1"}
        className={"sim_default_duty_2"}
        name={GENERATE_ARMY_SERGEANT_NAME}
        icon={"ui_inGame2_Dolg_2"}
        terrainSection={"stalker_terrain"}
        community={communities.dolg}
        moneyMin={1500}
        moneyMax={3500}
        rank={45}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        visual={"actors\\stalker_dolg\\stalker_dolg_2"}
        supplies={[
          { section: weapons.wpn_abakan },
          { section: weapons.wpn_fort },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...defaultCharacterItems2,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs2,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_2_default_2"}
        className={"sim_default_duty_2"}
        name={GENERATE_ARMY_SERGEANT_NAME}
        icon={"ui_inGame2_Dolg_2"}
        terrainSection={"stalker_terrain"}
        community={communities.dolg}
        moneyMin={1500}
        moneyMax={3500}
        rank={45}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        visual={"actors\\stalker_dolg\\stalker_dolg_2"}
        supplies={[
          { section: weapons.wpn_spas12 },
          { section: weapons.wpn_fort },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo.ammo_12x70_buck },
          { section: ammo.ammo_9x18_fmj },
          ...defaultCharacterItems2,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs2,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_2_default_3"}
        className={"sim_default_duty_2"}
        name={GENERATE_ARMY_SERGEANT_NAME}
        icon={"ui_inGame2_Dolg_2"}
        terrainSection={"stalker_terrain"}
        community={communities.dolg}
        moneyMin={1500}
        moneyMax={3500}
        rank={45}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        visual={"actors\\stalker_dolg\\stalker_dolg_2"}
        supplies={[
          { section: weapons.wpn_spas12 },
          { section: weapons.wpn_walther },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo.ammo_12x70_buck },
          { section: ammo.ammo_9x19_fmj },
          ...defaultCharacterItems2,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs2,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_2_default_4"}
        className={"sim_default_duty_2"}
        name={GENERATE_ARMY_SERGEANT_NAME}
        icon={"ui_inGame2_Dolg_2"}
        terrainSection={"stalker_terrain"}
        community={communities.dolg}
        moneyMin={1500}
        moneyMax={3500}
        rank={45}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        visual={"actors\\stalker_dolg\\stalker_dolg_2"}
        supplies={[
          { section: weapons.wpn_abakan },
          { section: weapons.wpn_pm },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...defaultCharacterItems2,
          ...defaultCharacterDrugs2,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_2_default_5"}
        className={"sim_default_duty_2"}
        name={GENERATE_ARMY_SERGEANT_NAME}
        icon={"ui_inGame2_Dolg_2"}
        terrainSection={"stalker_terrain"}
        community={communities.dolg}
        moneyMin={1500}
        moneyMax={3500}
        rank={45}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        visual={"actors\\stalker_dolg\\stalker_dolg_2"}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_pm },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...defaultCharacterItems2,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs2,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_2_default_6"}
        className={"sim_default_duty_2"}
        name={GENERATE_ARMY_SERGEANT_NAME}
        icon={"ui_inGame2_Dolg_1"}
        terrainSection={"stalker_terrain"}
        community={communities.dolg}
        moneyMin={1500}
        moneyMax={3500}
        rank={45}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        visual={"actors\\stalker_dolg\\stalker_dolg_1"}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_walther },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x19_pbp },
          ...defaultCharacterItems2,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs2,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_2_default_7"}
        className={"sim_default_duty_2"}
        name={GENERATE_ARMY_SERGEANT_NAME}
        icon={"ui_inGame2_Dolg_1"}
        terrainSection={"stalker_terrain"}
        community={communities.dolg}
        moneyMin={1500}
        moneyMax={3500}
        rank={45}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        visual={"actors\\stalker_dolg\\stalker_dolg_1"}
        supplies={[
          { section: weapons.wpn_abakan },
          { section: weapons.wpn_walther },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x19_pbp },
          ...defaultCharacterItems2,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs2,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_3_default_0"}
        className={"sim_default_duty_3"}
        name={GENERATE_ARMY_LIEUTENANT_NAME}
        icon={"ui_inGame2_Dolg_3"}
        terrainSection={"stalker_terrain"}
        community={communities.dolg}
        moneyMin={2500}
        moneyMax={5000}
        rank={55}
        soundConfig={"characters_voice\\human_01\\dolg\\"}
        visual={"actors\\stalker_dolg\\stalker_dolg_3"}
        supplies={[
          { section: weapons.wpn_abakan, scope: true },
          { section: weapons.wpn_walther },
          { section: weapons.grenade_f1, count: 3 },
          { section: ammo["ammo_5.45x39_ap"] },
          { section: ammo.ammo_9x19_pbp },
          ...defaultCharacterItems2,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs3,
          ...defaultCharacterDrugsMilitary,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_3_default_1"}
        className={"sim_default_duty_3"}
        name={GENERATE_ARMY_LIEUTENANT_NAME}
        icon={"ui_inGame2_Dolg_3"}
        terrainSection={"stalker_terrain"}
        community={communities.dolg}
        moneyMin={2500}
        moneyMax={5000}
        rank={55}
        soundConfig={"characters_voice\\human_02\\dolg\\"}
        visual={"actors\\stalker_dolg\\stalker_dolg_3"}
        supplies={[
          { section: weapons.wpn_abakan },
          { section: weapons.wpn_sig220 },
          { section: weapons.grenade_f1, count: 3 },
          { section: ammo["ammo_5.45x39_ap"] },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...defaultCharacterItems2,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs3,
          ...defaultCharacterDrugsMilitary,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_3_default_2"}
        className={"sim_default_duty_3"}
        name={GENERATE_ARMY_LIEUTENANT_NAME}
        icon={"ui_inGame2_Dolg_3"}
        terrainSection={"stalker_terrain"}
        community={communities.dolg}
        moneyMin={2500}
        moneyMax={5000}
        rank={55}
        soundConfig={"characters_voice\\human_02\\dolg\\"}
        visual={"actors\\stalker_dolg\\stalker_dolg_3"}
        supplies={[
          { section: weapons.wpn_val },
          { section: weapons.wpn_walther },
          { section: weapons.grenade_f1, count: 3 },
          { section: ammo.ammo_9x39_pab9 },
          { section: ammo.ammo_9x19_pbp },
          ...defaultCharacterItems2,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs3,
          ...defaultCharacterDrugsMilitary,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_3_default_3"}
        className={"sim_default_duty_3"}
        name={GENERATE_ARMY_LIEUTENANT_NAME}
        icon={"ui_inGame2_Dolg_3"}
        terrainSection={"stalker_terrain"}
        community={communities.dolg}
        moneyMin={2500}
        moneyMax={5000}
        rank={55}
        soundConfig={"characters_voice\\human_02\\dolg\\"}
        visual={"actors\\stalker_dolg\\stalker_dolg_3"}
        supplies={[
          { section: weapons.wpn_protecta },
          { section: weapons.wpn_fort },
          { section: weapons.grenade_f1, count: 3 },
          { section: ammo.ammo_12x76_zhekan },
          { section: ammo.ammo_9x18_pmm },
          ...defaultCharacterItems2,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs3,
          ...defaultCharacterDrugsMilitary,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_3_default_4"}
        className={"sim_default_duty_3"}
        name={GENERATE_ARMY_LIEUTENANT_NAME}
        icon={"ui_inGame2_Dolg_3"}
        terrainSection={"stalker_terrain"}
        community={communities.dolg}
        moneyMin={2500}
        moneyMax={5000}
        rank={55}
        soundConfig={"characters_voice\\human_02\\dolg\\"}
        visual={"actors\\stalker_dolg\\stalker_dolg_3"}
        supplies={[
          { section: weapons.wpn_groza },
          { section: weapons.wpn_sig220 },
          { section: weapons.grenade_f1, count: 3 },
          { section: ammo.ammo_9x39_pab9 },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...defaultCharacterItems2,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs3,
          ...defaultCharacterDrugsMilitary,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_4_default_0"}
        className={"sim_default_duty_4"}
        name={GENERATE_ARMY_CAPTAIN_NAME}
        icon={"ui_inGame2_Dolg_4"}
        terrainSection={"stalker_terrain"}
        community={communities.dolg}
        moneyMin={5000}
        moneyMax={10000}
        rank={60}
        soundConfig={"characters_voice\\human_02\\dolg\\"}
        visual={"actors\\stalker_dolg\\stalker_dolg_4"}
        supplies={[
          { section: weapons.wpn_groza },
          { section: weapons.wpn_sig220 },
          { section: weapons.grenade_f1, count: 3 },
          { section: ammo.ammo_9x39_ap },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...defaultCharacterItems3,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs4,
          ...defaultCharacterDrugsMilitary,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_4_default_1"}
        className={"sim_default_duty_4"}
        name={GENERATE_ARMY_CAPTAIN_NAME}
        icon={"ui_inGame2_Dolg_4"}
        terrainSection={"stalker_terrain"}
        community={communities.dolg}
        moneyMin={5000}
        moneyMax={10000}
        rank={60}
        soundConfig={"characters_voice\\human_02\\dolg\\"}
        visual={"actors\\stalker_dolg\\stalker_dolg_4"}
        supplies={[
          { section: weapons.wpn_groza },
          { section: weapons.wpn_usp },
          { section: weapons.grenade_f1, count: 1 },
          { section: ammo.ammo_9x39_ap },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...defaultCharacterItems3,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs4,
          ...defaultCharacterDrugsMilitary,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_4_default_2"}
        className={"sim_default_duty_4"}
        name={GENERATE_ARMY_CAPTAIN_NAME}
        icon={"ui_inGame2_Dolg_4"}
        terrainSection={"stalker_terrain"}
        community={communities.dolg}
        moneyMin={5000}
        moneyMax={10000}
        rank={60}
        soundConfig={"characters_voice\\human_02\\dolg\\"}
        visual={"actors\\stalker_dolg\\stalker_dolg_4"}
        supplies={[
          { section: weapons.wpn_abakan },
          { section: weapons.wpn_sig220 },
          { section: weapons.grenade_f1, count: 1 },
          { section: ammo["ammo_5.45x39_ap"] },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...defaultCharacterItems3,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs4,
          ...defaultCharacterDrugsMilitary,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_4_default_3"}
        className={"sim_default_duty_4"}
        name={GENERATE_ARMY_CAPTAIN_NAME}
        icon={"ui_inGame2_Dolg_4"}
        terrainSection={"stalker_terrain"}
        community={communities.dolg}
        moneyMin={5000}
        moneyMax={10000}
        rank={60}
        soundConfig={"characters_voice\\human_02\\dolg\\"}
        visual={"actors\\stalker_dolg\\stalker_dolg_4"}
        supplies={[
          { section: weapons.wpn_pkm },
          { section: weapons.wpn_usp },
          { section: weapons.grenade_f1, count: 1 },
          { section: ammo.ammo_pkm_100 },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...defaultCharacterItems3,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs4,
          ...defaultCharacterDrugsMilitary,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_4_default_4"}
        className={"sim_default_duty_4"}
        name={GENERATE_ARMY_CAPTAIN_NAME}
        icon={"ui_inGame2_Dolg_4"}
        terrainSection={"stalker_terrain"}
        community={communities.dolg}
        moneyMin={5000}
        moneyMax={10000}
        rank={60}
        soundConfig={"characters_voice\\human_02\\dolg\\"}
        visual={"actors\\stalker_dolg\\stalker_dolg_4"}
        supplies={[
          { section: weapons.wpn_protecta },
          { section: weapons.wpn_usp },
          { section: weapons.grenade_f1, count: 1 },
          { section: ammo.ammo_12x76_zhekan },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...defaultCharacterItems3,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs4,
          ...defaultCharacterDrugsMilitary,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_duty_4_default_5"}
        className={"sim_default_duty_4"}
        name={GENERATE_ARMY_CAPTAIN_NAME}
        icon={"ui_inGame2_Dolg_4"}
        terrainSection={"stalker_terrain"}
        community={communities.dolg}
        moneyMin={5000}
        moneyMax={10000}
        rank={60}
        soundConfig={"characters_voice\\human_02\\dolg\\"}
        visual={"actors\\stalker_dolg\\stalker_dolg_4"}
        supplies={[
          { section: weapons.wpn_val },
          { section: weapons.wpn_usp },
          { section: weapons.grenade_f1, count: 1 },
          { section: ammo.ammo_9x39_ap },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...defaultCharacterItems3,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs4,
          ...defaultCharacterDrugsMilitary,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>
    </Fragment>
  );
}
