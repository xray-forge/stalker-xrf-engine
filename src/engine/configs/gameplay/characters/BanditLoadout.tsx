import { Fragment, JSXNode, JSXXML } from "jsx-xml";

import { defaultCharacterDialogs } from "@/engine/configs/gameplay/character_dialogs";
import { defaultCharacterCritical } from "@/engine/configs/gameplay/loadouts/character_criticals";
import { defaultCharacterDrugs } from "@/engine/configs/gameplay/loadouts/character_drugs";
import { defaultCharacterDrugs2 } from "@/engine/configs/gameplay/loadouts/character_drugs_2";
import { defaultCharacterFood } from "@/engine/configs/gameplay/loadouts/character_food";
import { defaultCharacterItems } from "@/engine/configs/gameplay/loadouts/character_items";
import { defaultCharacterItemsWithoutDetector } from "@/engine/configs/gameplay/loadouts/character_items_nd";
import { defaultCharacterSellWeapons } from "@/engine/configs/gameplay/loadouts/character_sell_weapons";
import { SpecificCharacter } from "@/engine/configs/gameplay/utils";
import { communities } from "@/engine/lib/constants/communities";
import { ammo } from "@/engine/lib/constants/items/ammo";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { GENERATE_BANDIT_NAME } from "@/engine/lib/constants/names";

export function BanditLoadout(): JSXNode {
  return (
    <Fragment>
      <SpecificCharacter
        id={"stalker_bandit_default"}
        className={"Stalker_bandit"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={"ui_inGame2_bandit_1"}
        terrainSection={"stalker_terrain"}
        soundConfig={"characters_voice\\human_01\\stalker\\"}
        visual={"actors\\stalker_bandit\\stalker_bandit_1"}
        rank={0}
        supplies={[
          { section: weapons.wpn_sig550 },
          { section: weapons.wpn_beretta },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_5.56x45_ss190"] },
          { section: ammo.ammo_9x19_fmj },
          ...defaultCharacterItems,
          ...defaultCharacterDrugs,
          ...defaultCharacterFood,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_0_default_0"}
        className={"sim_default_bandit_0"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={"ui_inGame2_bandit_1"}
        terrainSection={"stalker_terrain"}
        soundConfig={"characters_voice\\human_01\\bandit\\"}
        visual={"actors\\stalker_bandit\\stalker_bandit_1"}
        rank={20}
        moneyMin={250}
        moneyMax={1750}
        supplies={[
          { section: weapons.wpn_bm16 },
          { section: weapons.wpn_pm },
          { section: ammo["ammo_12x70_buck"] },
          { section: ammo.ammo_9x19_fmj },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterDrugs,
          ...defaultCharacterFood,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_0_default_1"}
        className={"sim_default_bandit_0"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={"ui_inGame2_bandit_1"}
        terrainSection={"stalker_terrain"}
        soundConfig={"characters_voice\\human_01\\bandit\\"}
        visual={"actors\\stalker_bandit\\stalker_bandit_1"}
        rank={20}
        moneyMin={250}
        moneyMax={1750}
        supplies={[
          { section: weapons.wpn_bm16 },
          { section: weapons.wpn_fort },
          { section: ammo["ammo_12x70_buck"] },
          { section: ammo.ammo_9x19_fmj },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterDrugs,
          ...defaultCharacterFood,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_0_default_2"}
        className={"sim_default_bandit_0"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={"ui_inGame2_bandit_1"}
        terrainSection={"stalker_terrain"}
        soundConfig={"characters_voice\\human_01\\bandit\\"}
        visual={"actors\\stalker_bandit\\stalker_bandit_1"}
        rank={20}
        moneyMin={250}
        moneyMax={1750}
        supplies={[
          { section: weapons.wpn_ak74u },
          { section: weapons.wpn_pm },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x19_fmj },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterDrugs,
          ...defaultCharacterFood,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_1_default_0"}
        className={"sim_default_bandit_1"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={"ui_inGame2_bandit_1"}
        terrainSection={"stalker_terrain"}
        soundConfig={"characters_voice\\human_01\\bandit\\"}
        visual={"actors\\stalker_bandit\\stalker_bandit_1"}
        rank={30}
        moneyMin={250}
        moneyMax={1750}
        supplies={[
          { section: weapons.wpn_ak74u },
          { section: weapons.wpn_hpsa },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x19_fmj },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterDrugs,
          ...defaultCharacterFood,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_1_default_1"}
        className={"sim_default_bandit_1"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={"ui_inGame2_bandit_3"}
        terrainSection={"stalker_terrain"}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        visual={"actors\\stalker_bandit\\stalker_bandit_3"}
        rank={30}
        moneyMin={250}
        moneyMax={1750}
        supplies={[
          { section: weapons.wpn_ak74u },
          { section: weapons.wpn_hpsa },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x19_fmj },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterDrugs,
          ...defaultCharacterFood,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_1_default_2"}
        className={"sim_default_bandit_1"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={"ui_inGame2_bandit_3_mask"}
        terrainSection={"stalker_terrain"}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        visual={"actors\\stalker_bandit\\stalker_bandit_3_mask"}
        rank={30}
        moneyMin={250}
        moneyMax={1750}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_pm },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterDrugs,
          ...defaultCharacterFood,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_1_default_3"}
        className={"sim_default_bandit_1"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={"ui_inGame2_bandit_3_mask"}
        terrainSection={"stalker_terrain"}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        visual={"actors\\stalker_bandit\\stalker_bandit_3_mask"}
        rank={30}
        moneyMin={250}
        moneyMax={1750}
        supplies={[
          { section: weapons.wpn_ak74u },
          { section: weapons.wpn_pm },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterDrugs,
          ...defaultCharacterFood,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_1_default_4"}
        className={"sim_default_bandit_1"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={"ui_inGame2_bandit_4"}
        terrainSection={"stalker_terrain"}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        visual={"actors\\stalker_bandit\\stalker_bandit_4"}
        rank={30}
        moneyMin={250}
        moneyMax={1750}
        supplies={[
          { section: weapons.wpn_ak74u },
          { section: weapons.wpn_hpsa },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x19_fmj },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterDrugs,
          ...defaultCharacterFood,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_1_default_5"}
        className={"sim_default_bandit_1"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={"ui_inGame2_bandit_1"}
        terrainSection={"stalker_terrain"}
        soundConfig={"characters_voice\\human_01\\bandit\\"}
        visual={"actors\\stalker_bandit\\stalker_bandit_1"}
        rank={30}
        moneyMin={250}
        moneyMax={1750}
        supplies={[
          { section: weapons.wpn_ak74u },
          { section: weapons.wpn_fort },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterDrugs,
          ...defaultCharacterFood,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_2_default_0"}
        className={"sim_default_bandit_2"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={"ui_inGame2_bandit_3"}
        terrainSection={"stalker_terrain"}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        visual={"actors\\stalker_bandit\\stalker_bandit_3"}
        rank={35}
        moneyMin={250}
        moneyMax={1750}
        supplies={[
          { section: weapons.wpn_wincheaster1300 },
          { section: weapons.wpn_hpsa },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_12x76_zhekan"] },
          { section: ammo.ammo_9x19_fmj },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterDrugs2,
          ...defaultCharacterFood,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_2_default_1"}
        className={"sim_default_bandit_2"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={"ui_inGame2_bandit_2"}
        terrainSection={"stalker_terrain"}
        soundConfig={"characters_voice\\human_01\\bandit\\"}
        visual={"actors\\stalker_bandit\\stalker_bandit_2"}
        rank={35}
        moneyMin={500}
        moneyMax={1750}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_beretta },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x19_fmj },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterDrugs2,
          ...defaultCharacterFood,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_2_default_2"}
        className={"sim_default_bandit_2"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={"ui_inGame2_bandit_2"}
        terrainSection={"stalker_terrain"}
        soundConfig={"characters_voice\\human_01\\bandit\\"}
        visual={"actors\\stalker_bandit\\stalker_bandit_2"}
        rank={35}
        moneyMin={500}
        moneyMax={1750}
        supplies={[
          { section: weapons.wpn_mp5 },
          { section: weapons.wpn_beretta },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo.ammo_9x19_pbp },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterDrugs2,
          ...defaultCharacterFood,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_2_default_3"}
        className={"sim_default_bandit_2"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={"ui_inGame2_bandit_3_mask"}
        terrainSection={"stalker_terrain"}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        visual={"actors\\stalker_bandit\\stalker_bandit_3_mask"}
        rank={35}
        moneyMin={500}
        moneyMax={1750}
        supplies={[
          { section: weapons.wpn_ak74u },
          { section: weapons.wpn_hpsa },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x19_pbp },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterDrugs2,
          ...defaultCharacterFood,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_2_default_4"}
        className={"sim_default_bandit_2"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={"ui_inGame2_bandit_2"}
        terrainSection={"stalker_terrain"}
        soundConfig={"characters_voice\\human_01\\bandit\\"}
        visual={"actors\\stalker_bandit\\stalker_bandit_2"}
        rank={35}
        moneyMin={500}
        moneyMax={1750}
        supplies={[
          { section: weapons.wpn_mp5 },
          { section: weapons.wpn_colt1911 },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo.ammo_9x19_pbp },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterDrugs2,
          ...defaultCharacterFood,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_2_default_5"}
        className={"sim_default_bandit_2"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={"ui_inGame2_bandit_4"}
        terrainSection={"stalker_terrain"}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        visual={"actors\\stalker_bandit\\stalker_bandit_4"}
        rank={35}
        moneyMin={500}
        moneyMax={1750}
        supplies={[
          { section: weapons.wpn_ak74u },
          { section: weapons.wpn_colt1911 },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x19_pbp },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterDrugs2,
          ...defaultCharacterFood,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_3_default_0"}
        className={"sim_default_bandit_3"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={"ui_inGame2_bandit_3"}
        terrainSection={"stalker_terrain"}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        visual={"actors\\stalker_bandit\\stalker_bandit_3"}
        rank={45}
        moneyMin={3000}
        moneyMax={4000}
        supplies={[
          { section: weapons.wpn_spas12 },
          { section: weapons.wpn_colt1911 },
          { section: weapons.grenade_f1, count: 3 },
          { section: ammo.ammo_12x76_zhekan },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterDrugs2,
          ...defaultCharacterFood,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_3_default_1"}
        className={"sim_default_bandit_3"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={"ui_inGame2_bandit_3_mask"}
        terrainSection={"stalker_terrain"}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        visual={"actors\\stalker_bandit\\stalker_bandit_3_mask"}
        rank={45}
        moneyMin={3000}
        moneyMax={4000}
        supplies={[
          { section: weapons.wpn_spas12 },
          { section: weapons.wpn_beretta },
          { section: weapons.grenade_f1, count: 3 },
          { section: ammo.ammo_12x70_buck },
          { section: ammo["ammo_9x19_pbp"] },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterDrugs2,
          ...defaultCharacterFood,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_3_default_2"}
        className={"sim_default_bandit_3"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={"ui_inGame2_bandit_4"}
        terrainSection={"stalker_terrain"}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        visual={"actors\\stalker_bandit\\stalker_bandit_4"}
        rank={45}
        moneyMin={3000}
        moneyMax={4000}
        supplies={[
          { section: weapons.wpn_spas12 },
          { section: weapons.wpn_beretta },
          { section: weapons.grenade_f1, count: 3 },
          { section: ammo.ammo_12x70_buck },
          { section: ammo["ammo_9x19_pbp"] },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterDrugs2,
          ...defaultCharacterFood,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_3_default_3"}
        className={"sim_default_bandit_3"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={"ui_inGame2_bandit_2"}
        terrainSection={"stalker_terrain"}
        soundConfig={"characters_voice\\human_01\\bandit\\"}
        visual={"actors\\stalker_bandit\\stalker_bandit_2"}
        rank={45}
        moneyMin={3000}
        moneyMax={4000}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_colt1911 },
          { section: weapons.grenade_f1, count: 3 },
          { section: ammo["ammo_5.45x39_ap"] },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterDrugs2,
          ...defaultCharacterFood,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_3_default_4"}
        className={"sim_default_bandit_3"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={"ui_inGame2_bandit_2"}
        terrainSection={"stalker_terrain"}
        soundConfig={"characters_voice\\human_01\\bandit\\"}
        visual={"actors\\stalker_bandit\\stalker_bandit_2"}
        rank={45}
        moneyMin={3000}
        moneyMax={4000}
        supplies={[
          { section: weapons.wpn_lr300 },
          { section: weapons.wpn_beretta },
          { section: weapons.grenade_f1, count: 3 },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo["ammo_9x19_pbp"] },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterDrugs2,
          ...defaultCharacterFood,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_4_default_0"}
        className={"sim_default_bandit_4"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={"ui_inGame2_bandit_4"}
        terrainSection={"stalker_terrain"}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        visual={"actors\\stalker_bandit\\stalker_bandit_4"}
        rank={55}
        moneyMin={3000}
        moneyMax={4000}
        supplies={[
          { section: weapons.wpn_sig550 },
          { section: weapons.wpn_desert_eagle },
          { section: weapons.grenade_f1, count: 4 },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterDrugs2,
          ...defaultCharacterFood,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_4_default_1"}
        className={"sim_default_bandit_4"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={"ui_inGame2_bandit_3"}
        terrainSection={"stalker_terrain"}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        visual={"actors\\stalker_bandit\\stalker_bandit_3"}
        rank={55}
        moneyMin={3000}
        moneyMax={8000}
        supplies={[
          { section: weapons.wpn_sig550 },
          { section: weapons.wpn_colt1911 },
          { section: weapons.grenade_f1, count: 4 },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterDrugs2,
          ...defaultCharacterFood,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_4_default_2"}
        className={"sim_default_bandit_4"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={"ui_inGame2_bandit_2"}
        terrainSection={"stalker_terrain"}
        soundConfig={"characters_voice\\human_01\\bandit\\"}
        visual={"actors\\stalker_bandit\\stalker_bandit_2"}
        rank={55}
        moneyMin={3000}
        moneyMax={8000}
        supplies={[
          { section: weapons.wpn_sig550 },
          { section: weapons.wpn_desert_eagle },
          { section: weapons.grenade_f1, count: 4 },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterDrugs2,
          ...defaultCharacterFood,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_4_default_3"}
        className={"sim_default_bandit_4"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={"ui_inGame2_bandit_2"}
        terrainSection={"stalker_terrain"}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        visual={"actors\\stalker_bandit\\stalker_bandit_4"}
        rank={55}
        moneyMin={3000}
        moneyMax={8000}
        supplies={[
          { section: weapons.wpn_protecta },
          { section: weapons.wpn_desert_eagle },
          { section: weapons.grenade_f1, count: 4 },
          { section: ammo["ammo_12x76_zhekan"] },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterDrugs2,
          ...defaultCharacterFood,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_4_default_4"}
        className={"sim_default_bandit_4"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={"ui_inGame2_bandit_3_mask"}
        terrainSection={"stalker_terrain"}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        visual={"actors\\stalker_bandit\\stalker_bandit_3_mask"}
        rank={55}
        moneyMin={3000}
        moneyMax={8000}
        supplies={[
          { section: weapons.wpn_protecta },
          { section: weapons.wpn_desert_eagle },
          { section: weapons.grenade_f1, count: 4 },
          { section: ammo["ammo_12x76_zhekan"] },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterDrugs2,
          ...defaultCharacterFood,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>
    </Fragment>
  );
}
