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
import { defaultCharacterItemsWithoutDetector } from "@/engine/configs/gameplay/loadouts/character_items_nd";
import { SpecificCharacter } from "@/engine/configs/gameplay/utils";
import { communities } from "@/engine/lib/constants/communities";
import { ammo } from "@/engine/lib/constants/items/ammo";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { GENERATE_STALKER_NAME } from "@/engine/lib/constants/names";

export function MercenaryLoadout(): JSXNode {
  return (
    <Fragment>
      <SpecificCharacter
        id={"sim_default_killer_0_default_0"}
        class={"sim_default_killer_0"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_merc_2"}
        rank={35}
        moneyMin={250}
        moneyMax={1750}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        visual={"actors\\stalker_merc\\stalker_merc_2"}
        community={communities.killer}
        supplies={[
          { section: weapons.wpn_mp5 },
          { section: weapons.wpn_hpsa },
          { section: ammo.ammo_9x19_fmj },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_killer_0_default_1"}
        class={"sim_default_killer_0"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_merc_2"}
        rank={35}
        moneyMin={250}
        moneyMax={1750}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        visual={"actors\\stalker_merc\\stalker_merc_2"}
        community={communities.killer}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_hpsa },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x19_fmj },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_killer_1_default_0"}
        class={"sim_default_killer_1"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_merc_2"}
        rank={40}
        moneyMin={500}
        moneyMax={1750}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        visual={"actors\\stalker_merc\\stalker_merc_2"}
        community={communities.killer}
        supplies={[
          { section: weapons.wpn_mp5 },
          { section: weapons.wpn_hpsa },
          { section: weapons.grenade_rgd5 },
          { section: ammo.ammo_9x19_pbp },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs2,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_killer_1_default_1"}
        class={"sim_default_killer_1"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_merc_2"}
        rank={40}
        moneyMin={500}
        moneyMax={1750}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        visual={"actors\\stalker_merc\\stalker_merc_2"}
        community={communities.killer}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_hpsa },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x19_pbp },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs2,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_killer_1_default_2"}
        class={"sim_default_killer_1"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_merc_2"}
        rank={40}
        moneyMin={500}
        moneyMax={1750}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        visual={"actors\\stalker_merc\\stalker_merc_2"}
        community={communities.killer}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_beretta },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x19_pbp },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs2,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_killer_2_default_0"}
        class={"sim_default_killer_2"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_merc_2"}
        rank={45}
        moneyMin={1500}
        moneyMax={2500}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        visual={"actors\\stalker_merc\\stalker_merc_2"}
        community={communities.killer}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_colt1911 },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs3,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_killer_2_default_1"}
        class={"sim_default_killer_2"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_merc_2"}
        rank={45}
        moneyMin={1500}
        moneyMax={2500}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        visual={"actors\\stalker_merc\\stalker_merc_2"}
        community={communities.killer}
        supplies={[
          { section: weapons.wpn_wincheaster1300 },
          { section: weapons.wpn_hpsa },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo.ammo_12x76_zhekan },
          { section: ammo.ammo_9x19_pbp },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs3,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_killer_2_default_2"}
        class={"sim_default_killer_2"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_merc_2"}
        rank={45}
        moneyMin={1500}
        moneyMax={2500}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        visual={"actors\\stalker_merc\\stalker_merc_2"}
        community={communities.killer}
        supplies={[
          { section: weapons.wpn_l85 },
          { section: weapons.wpn_beretta },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.56x45_ss190"] },
          { section: ammo.ammo_9x19_pbp },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs3,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_killer_2_default_3"}
        class={"sim_default_killer_2"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_merc_2"}
        rank={45}
        moneyMin={1500}
        moneyMax={2500}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        visual={"actors\\stalker_merc\\stalker_merc_2"}
        community={communities.killer}
        supplies={[
          { section: weapons.wpn_lr300 },
          { section: weapons.wpn_colt1911 },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.56x45_ss190"] },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs3,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_killer_2_default_4"}
        class={"sim_default_killer_2"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_merc_2"}
        rank={45}
        moneyMin={1500}
        moneyMax={2500}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        visual={"actors\\stalker_merc\\stalker_merc_2"}
        community={communities.killer}
        supplies={[
          { section: weapons.wpn_lr300 },
          { section: weapons.wpn_sig220 },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.56x45_ss190"] },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs3,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_killer_2_default_5"}
        class={"sim_default_killer_2"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_merc_2"}
        rank={45}
        moneyMin={1500}
        moneyMax={2500}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        visual={"actors\\stalker_merc\\stalker_merc_2"}
        community={communities.killer}
        supplies={[
          { section: weapons.wpn_l85 },
          { section: weapons.wpn_usp },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.56x45_ss190"] },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...defaultCharacterItemsWithoutDetector,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs3,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_killer_3_default_0"}
        class={"sim_default_killer_3"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_merc_2"}
        rank={55}
        moneyMin={2500}
        moneyMax={5000}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        visual={"actors\\stalker_merc\\stalker_merc_2"}
        community={communities.killer}
        supplies={[
          { section: weapons.wpn_g36 },
          { section: weapons.wpn_sig220 },
          { section: weapons.grenade_f1, count: 3 },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...defaultCharacterItemsWithoutDetector,
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
        id={"sim_default_killer_3_default_1"}
        class={"sim_default_killer_3"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_merc_2"}
        rank={55}
        moneyMin={2500}
        moneyMax={5000}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        visual={"actors\\stalker_merc\\stalker_merc_2"}
        community={communities.killer}
        supplies={[
          { section: weapons.wpn_sig550 },
          { section: weapons.wpn_usp },
          { section: weapons.grenade_f1, count: 3 },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...defaultCharacterItemsWithoutDetector,
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
        id={"sim_default_killer_3_default_2"}
        class={"sim_default_killer_3"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_merc_4"}
        rank={55}
        moneyMin={2500}
        moneyMax={5000}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        visual={"actors\\stalker_merc\\stalker_merc_4"}
        community={communities.killer}
        supplies={[
          { section: weapons.wpn_sig550 },
          { section: weapons.wpn_usp },
          { section: weapons.grenade_f1, count: 3 },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...defaultCharacterItemsWithoutDetector,
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
        id={"sim_default_killer_3_default_3"}
        class={"sim_default_killer_3"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_merc_4"}
        rank={55}
        moneyMin={2500}
        moneyMax={5000}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        visual={"actors\\stalker_merc\\stalker_merc_4"}
        community={communities.killer}
        supplies={[
          { section: weapons.wpn_g36 },
          { section: weapons.wpn_sig220 },
          { section: weapons.grenade_f1, count: 3 },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...defaultCharacterItemsWithoutDetector,
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
        id={"sim_default_killer_3_default_4"}
        class={"sim_default_killer_3"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_merc_4"}
        rank={55}
        moneyMin={2500}
        moneyMax={5000}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        visual={"actors\\stalker_merc\\stalker_merc_4"}
        community={communities.killer}
        supplies={[
          { section: weapons.wpn_protecta },
          { section: weapons.wpn_usp },
          { section: weapons.grenade_f1, count: 3 },
          { section: ammo.ammo_12x76_zhekan },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...defaultCharacterItemsWithoutDetector,
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
        id={"sim_default_killer_4_default_5"}
        class={"sim_default_killer_3"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_merc_4"}
        rank={55}
        moneyMin={2500}
        moneyMax={5000}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        visual={"actors\\stalker_merc\\stalker_merc_4"}
        community={communities.killer}
        supplies={[
          { section: weapons.wpn_protecta },
          { section: weapons.wpn_sig220 },
          { section: weapons.grenade_f1, count: 3 },
          { section: ammo.ammo_12x76_zhekan },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...defaultCharacterItemsWithoutDetector,
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
        id={"sim_default_killer_4_default_0"}
        class={"sim_default_killer_4"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_merc_4"}
        rank={60}
        moneyMin={5000}
        moneyMax={10000}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        visual={"actors\\stalker_merc\\stalker_merc_4"}
        community={communities.killer}
        supplies={[
          { section: weapons.wpn_fn2000 },
          { section: weapons.wpn_usp },
          { section: weapons.grenade_f1, count: 4 },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...defaultCharacterItemsWithoutDetector,
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
        id={"sim_default_killer_4_default_1"}
        class={"sim_default_killer_4"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_merc_4"}
        rank={60}
        moneyMin={5000}
        moneyMax={10000}
        soundConfig={"characters_voice\\human_03\\killer\\"}
        visual={"actors\\stalker_merc\\stalker_merc_4"}
        community={communities.killer}
        supplies={[
          { section: weapons.wpn_fn2000 },
          { section: weapons.wpn_sig220 },
          { section: weapons.grenade_f1, count: 4 },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...defaultCharacterItemsWithoutDetector,
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
