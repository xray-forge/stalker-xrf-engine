import { Fragment, JSXNode, JSXXML } from "jsx-xml";

import { defaultCharacterDialogs } from "@/engine/configs/gameplay/character_dialogs";
import { defaultCharacterCritical } from "@/engine/configs/gameplay/loadouts/character_criticals";
import { defaultCharacterDrugs } from "@/engine/configs/gameplay/loadouts/character_drugs";
import { defaultCharacterDrugs2 } from "@/engine/configs/gameplay/loadouts/character_drugs_2";
import { defaultCharacterDrugs3 } from "@/engine/configs/gameplay/loadouts/character_drugs_3";
import { defaultCharacterDrugs4 } from "@/engine/configs/gameplay/loadouts/character_drugs_4";
import { defaultCharacterDrugsMilitary } from "@/engine/configs/gameplay/loadouts/character_drugs_mil";
import { defaultCharacterDrugsScientific } from "@/engine/configs/gameplay/loadouts/character_drugs_sci";
import { defaultCharacterFood } from "@/engine/configs/gameplay/loadouts/character_food";
import { defaultCharacterItems } from "@/engine/configs/gameplay/loadouts/character_items";
import { defaultCharacterItemsMonolith } from "@/engine/configs/gameplay/loadouts/character_items_monolith";
import { SpecificCharacter } from "@/engine/configs/gameplay/utils";
import { communities } from "@/engine/lib/constants/communities";
import { ammo } from "@/engine/lib/constants/items/ammo";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { GENERATE_STALKER_NAME } from "@/engine/lib/constants/names";

export function MonolithLoadout(): JSXNode {
  return (
    <Fragment>
      <SpecificCharacter
        id={"stalker_monolith_default"}
        className={"stalker_monolith_default"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_monolit_2"}
        terrainSection={"stalker_terrain"}
        community={communities.monolith}
        soundConfig={"characters_voice\\human_01\\monolith\\"}
        visual={"actors\\stalker_monolith\\stalker_monolith_2"}
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
        id={"sim_default_monolith_0_default_0"}
        className={"sim_default_monolith_0"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_monolit_2"}
        terrainSection={"stalker_terrain"}
        community={communities.monolith}
        rank={30}
        soundConfig={"characters_voice\\human_01\\monolith\\"}
        visual={"actors\\stalker_monolith\\stalker_monolith_2"}
        supplies={[
          { section: weapons.wpn_ak74u },
          { section: weapons.wpn_fort },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...defaultCharacterItemsMonolith,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_0_default_1"}
        className={"sim_default_monolith_0"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_monolit_2"}
        terrainSection={"stalker_terrain"}
        community={communities.monolith}
        rank={30}
        soundConfig={"characters_voice\\human_01\\monolith\\"}
        visual={"actors\\stalker_monolith\\stalker_monolith_2"}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_pm },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...defaultCharacterItemsMonolith,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_0_default_2"}
        className={"sim_default_monolith_0"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_monolit_2"}
        terrainSection={"stalker_terrain"}
        community={communities.monolith}
        rank={30}
        soundConfig={"characters_voice\\human_01\\monolith\\"}
        visual={"actors\\stalker_monolith\\stalker_monolith_2"}
        supplies={[
          { section: weapons.wpn_ak74u },
          { section: weapons.wpn_fort },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...defaultCharacterItemsMonolith,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_1_default_0"}
        className={"sim_default_monolith_1"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_monolit_2"}
        terrainSection={"stalker_terrain"}
        community={communities.monolith}
        rank={35}
        soundConfig={"characters_voice\\human_01\\monolith\\"}
        visual={"actors\\stalker_monolith\\stalker_monolith_2"}
        supplies={[
          { section: weapons.wpn_wincheaster1300 },
          { section: weapons.wpn_fort },
          { section: ammo.ammo_12x70_buck },
          { section: ammo.ammo_9x18_fmj },
          ...defaultCharacterItemsMonolith,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs2,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_1_default_1"}
        className={"sim_default_monolith_1"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_monolit_2"}
        terrainSection={"stalker_terrain"}
        community={communities.monolith}
        rank={35}
        soundConfig={"characters_voice\\human_01\\monolith\\"}
        visual={"actors\\stalker_monolith\\stalker_monolith_2"}
        supplies={[
          { section: weapons.wpn_l85 },
          { section: weapons.wpn_pm },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_5.56x45_ss190"] },
          { section: ammo.ammo_9x18_fmj },
          ...defaultCharacterItemsMonolith,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs2,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_1_default_2"}
        className={"sim_default_monolith_1"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_monolit_2"}
        terrainSection={"stalker_terrain"}
        community={communities.monolith}
        rank={35}
        soundConfig={"characters_voice\\human_01\\monolith\\"}
        visual={"actors\\stalker_monolith\\stalker_monolith_2"}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_pm },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...defaultCharacterItemsMonolith,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs2,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_1_default_3"}
        className={"sim_default_monolith_1"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_monolit_2"}
        terrainSection={"stalker_terrain"}
        community={communities.monolith}
        rank={35}
        soundConfig={"characters_voice\\human_01\\monolith\\"}
        visual={"actors\\stalker_monolith\\stalker_monolith_2"}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_fort },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...defaultCharacterItemsMonolith,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs2,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_2_default_0"}
        className={"sim_default_monolith_2"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_monolit_2"}
        terrainSection={"stalker_terrain"}
        community={communities.monolith}
        rank={45}
        soundConfig={"characters_voice\\human_01\\monolith\\"}
        visual={"actors\\stalker_monolith\\stalker_monolith_2"}
        supplies={[
          { section: weapons.wpn_l85 },
          { section: weapons.wpn_walther },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo.ammo_9x19_fmj },
          ...defaultCharacterItemsMonolith,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs3,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_2_default_1"}
        className={"sim_default_monolith_2"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_monolit_1"}
        terrainSection={"stalker_terrain"}
        community={communities.monolith}
        rank={45}
        soundConfig={"characters_voice\\human_01\\monolith\\"}
        visual={"actors\\stalker_monolith\\stalker_monolith_1"}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_pm },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.45x39_ap"] },
          { section: ammo.ammo_9x18_pmm },
          ...defaultCharacterItemsMonolith,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs3,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_2_default_2"}
        className={"sim_default_monolith_2"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_monolit_1"}
        terrainSection={"stalker_terrain"}
        community={communities.monolith}
        rank={45}
        soundConfig={"characters_voice\\human_01\\monolith\\"}
        visual={"actors\\stalker_monolith\\stalker_monolith_1"}
        supplies={[
          { section: weapons.wpn_lr300 },
          { section: weapons.wpn_fort },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.56x45_ss190"] },
          { section: ammo.ammo_9x18_pmm },
          ...defaultCharacterItemsMonolith,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs3,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_2_default_3"}
        className={"sim_default_monolith_2"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_monolit_1"}
        terrainSection={"stalker_terrain"}
        community={communities.monolith}
        rank={45}
        soundConfig={"characters_voice\\human_01\\monolith\\"}
        visual={"actors\\stalker_monolith\\stalker_monolith_1"}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_beretta },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x19_fmj },
          ...defaultCharacterItemsMonolith,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs3,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_2_default_4"}
        className={"sim_default_monolith_2"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_monolit_2"}
        terrainSection={"stalker_terrain"}
        community={communities.monolith}
        rank={45}
        soundConfig={"characters_voice\\human_01\\monolith\\"}
        visual={"actors\\stalker_monolith\\stalker_monolith_2"}
        supplies={[
          { section: weapons.wpn_lr300 },
          { section: weapons.wpn_hpsa },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.56x45_ss190"] },
          { section: ammo.ammo_9x19_fmj },
          ...defaultCharacterItemsMonolith,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs3,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_2_default_5"}
        className={"sim_default_monolith_2"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_monolit_2"}
        terrainSection={"stalker_terrain"}
        community={communities.monolith}
        rank={45}
        soundConfig={"characters_voice\\human_01\\monolith\\"}
        visual={"actors\\stalker_monolith\\stalker_monolith_2"}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_pm },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo.ammo_9x18_pmm },
          ...defaultCharacterItemsMonolith,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs3,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_2_default_6"}
        className={"sim_default_monolith_2"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_monolit_2"}
        terrainSection={"stalker_terrain"}
        community={communities.monolith}
        rank={45}
        soundConfig={"characters_voice\\human_01\\monolith\\"}
        visual={"actors\\stalker_monolith\\stalker_monolith_2"}
        supplies={[
          { section: weapons.wpn_l85 },
          { section: weapons.wpn_pm },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo.ammo_9x18_pmm },
          ...defaultCharacterItemsMonolith,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs3,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_2_default_7"}
        className={"sim_default_monolith_2"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_monolit_2"}
        terrainSection={"stalker_terrain"}
        community={communities.monolith}
        rank={45}
        soundConfig={"characters_voice\\human_01\\monolith\\"}
        visual={"actors\\stalker_monolith\\stalker_monolith_2"}
        supplies={[
          { section: weapons.wpn_abakan },
          { section: weapons.wpn_fort },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.45x39_ap"] },
          { section: ammo.ammo_9x18_pmm },
          ...defaultCharacterItemsMonolith,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs3,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_3_default_0"}
        className={"sim_default_monolith_3"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_monolit_2"}
        terrainSection={"stalker_terrain"}
        community={communities.monolith}
        rank={55}
        soundConfig={"characters_voice\\human_02\\monolith\\"}
        visual={"actors\\stalker_monolith\\stalker_monolith_2"}
        supplies={[
          { section: weapons.wpn_sig550 },
          { section: weapons.wpn_walther },
          { section: weapons.grenade_f1, count: 3 },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo.ammo_9x19_pbp },
          ...defaultCharacterItemsMonolith,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs3,
          ...defaultCharacterDrugsMilitary,
          ...defaultCharacterDrugsScientific,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_3_default_1"}
        className={"sim_default_monolith_3"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_monolit_2"}
        terrainSection={"stalker_terrain"}
        community={communities.monolith}
        rank={55}
        soundConfig={"characters_voice\\human_02\\monolith\\"}
        visual={"actors\\stalker_monolith\\stalker_monolith_2"}
        supplies={[
          { section: weapons.wpn_val },
          { section: weapons.wpn_sig220 },
          { section: weapons.grenade_f1, count: 3 },
          { section: ammo.ammo_9x39_ap },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...defaultCharacterItemsMonolith,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs3,
          ...defaultCharacterDrugsMilitary,
          ...defaultCharacterDrugsScientific,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_3_default_2"}
        className={"sim_default_monolith_3"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_monolit_3"}
        terrainSection={"stalker_terrain"}
        community={communities.monolith}
        rank={55}
        soundConfig={"characters_voice\\human_02\\monolith\\"}
        visual={"actors\\stalker_monolith\\stalker_monolith_3"}
        supplies={[
          { section: weapons.wpn_val, scope: true },
          { section: weapons.wpn_sig220, silencer: true },
          { section: weapons.grenade_f1, count: 3 },
          { section: ammo.ammo_9x39_ap },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...defaultCharacterItemsMonolith,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs3,
          ...defaultCharacterDrugsMilitary,
          ...defaultCharacterDrugsScientific,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_3_default_3"}
        className={"sim_default_monolith_3"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_monolit_1"}
        terrainSection={"stalker_terrain"}
        community={communities.monolith}
        rank={55}
        soundConfig={"characters_voice\\human_02\\monolith\\"}
        visual={"actors\\stalker_monolith\\stalker_monolith_1"}
        supplies={[
          { section: weapons.wpn_svd },
          { section: weapons.wpn_usp, silencer: true },
          { section: ammo["ammo_7.62x54_7h1"] },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...defaultCharacterItemsMonolith,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs3,
          ...defaultCharacterDrugsMilitary,
          ...defaultCharacterDrugsScientific,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_3_default_4"}
        className={"sim_default_monolith_3"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_monolit_3"}
        terrainSection={"stalker_terrain"}
        community={communities.monolith}
        rank={55}
        soundConfig={"characters_voice\\human_02\\monolith\\"}
        visual={"actors\\stalker_monolith\\stalker_monolith_3"}
        supplies={[
          { section: weapons.wpn_sig550 },
          { section: weapons.wpn_usp },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...defaultCharacterItemsMonolith,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs3,
          ...defaultCharacterDrugsMilitary,
          ...defaultCharacterDrugsScientific,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_4_default_0"}
        className={"sim_default_monolith_4"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_monolit_2"}
        terrainSection={"stalker_terrain"}
        community={communities.monolith}
        rank={60}
        soundConfig={"characters_voice\\human_02\\monolith\\"}
        visual={"actors\\stalker_monolith\\stalker_monolith_2"}
        supplies={[
          { section: weapons.wpn_vintorez },
          { section: weapons.wpn_sig220, silencer: true },
          { section: ammo.ammo_9x39_ap },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...defaultCharacterItemsMonolith,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs4,
          ...defaultCharacterDrugsMilitary,
          ...defaultCharacterDrugsScientific,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_4_default_1"}
        className={"sim_default_monolith_4"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_monolit_4"}
        terrainSection={"stalker_terrain"}
        community={communities.monolith}
        rank={60}
        soundConfig={"characters_voice\\human_02\\monolith\\"}
        visual={"actors\\stalker_monolith\\stalker_monolith_4"}
        supplies={[
          { section: weapons.wpn_groza },
          { section: weapons.wpn_sig220 },
          { section: weapons.grenade_f1, count: 4 },
          { section: ammo.ammo_9x39_ap },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...defaultCharacterItemsMonolith,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs4,
          ...defaultCharacterDrugsMilitary,
          ...defaultCharacterDrugsScientific,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_4_default_2"}
        className={"sim_default_monolith_4"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_monolit_4"}
        terrainSection={"stalker_terrain"}
        community={communities.monolith}
        rank={60}
        soundConfig={"characters_voice\\human_02\\monolith\\"}
        visual={"actors\\stalker_monolith\\stalker_monolith_4"}
        supplies={[
          { section: weapons.wpn_protecta },
          { section: weapons.wpn_usp },
          { section: weapons.grenade_f1, count: 4 },
          { section: ammo.ammo_12x76_zhekan },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...defaultCharacterItemsMonolith,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs4,
          ...defaultCharacterDrugsMilitary,
          ...defaultCharacterDrugsScientific,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_monolith_4_default_3"}
        className={"sim_default_monolith_4"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_monolit_4"}
        terrainSection={"stalker_terrain"}
        community={communities.monolith}
        rank={60}
        soundConfig={"characters_voice\\human_02\\monolith\\"}
        visual={"actors\\stalker_monolith\\stalker_monolith_4"}
        supplies={[
          { section: weapons.wpn_g36 },
          { section: weapons.wpn_usp },
          { section: weapons.grenade_f1, count: 4 },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...defaultCharacterItemsMonolith,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs4,
          ...defaultCharacterDrugsMilitary,
          ...defaultCharacterDrugsScientific,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>
    </Fragment>
  );
}
