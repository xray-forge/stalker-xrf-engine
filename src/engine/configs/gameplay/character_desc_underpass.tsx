import { JSXNode, JSXXML } from "jsx-xml";

import { defaultCharacterDialogs } from "@/engine/configs/gameplay/character_dialogs";
import { defaultCharacterCritical } from "@/engine/configs/gameplay/loadouts/character_criticals";
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
import { detectors } from "@/engine/lib/constants/items/detectors";
import { misc } from "@/engine/lib/constants/items/misc";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { GENERATE_STALKER_NAME } from "@/engine/lib/constants/names";

export function create(): JSXNode {
  return (
    <xml>
      <SpecificCharacter
        id={"pas_b400_vano"}
        className={"pas_b400_vano"}
        name={"jup_a10_stalker_vano"}
        icon={"ui_inGame2_neutral_nauchniy"}
        community={communities.stalker}
        terrainSection={"stalker_terrain"}
        soundConfig={"characters_voice\\human_03\\stalker\\"}
        visual={"actors\\stalker_neutral\\stalker_neutral_nauchniy"}
        rank={45}
        supplies={[
          { section: misc.device_torch },
          { section: detectors.detector_elite },
          { section: weapons.wpn_binoc },
          { section: weapons.wpn_wincheaster1300 },
          { section: weapons.wpn_beretta },
          { section: ammo.ammo_12x70_buck },
          { section: ammo.ammo_12x76_zhekan },
          { section: ammo.ammo_9x19_fmj },
          ...defaultCharacterFood,
          ...defaultCharacterDrugs4,
        ]}
      >
        {defaultCharacterCritical}
      </SpecificCharacter>

      <SpecificCharacter
        id={"pas_b400_sokolov"}
        className={"pas_b400_sokolov"}
        name={"pri_a15_sokolov_name"}
        icon={"ui_inGame2_ecolog_military"}
        community={communities.stalker}
        terrainSection={"stalker_terrain"}
        soundConfig={"characters_voice\\human_03\\stalker\\"}
        visual={"actors\\stalker_soldier\\stalker_ecolog_military"}
        rank={50}
        supplies={[
          { section: misc.device_torch },
          { section: detectors.detector_elite },
          { section: weapons.wpn_binoc },
          { section: weapons.wpn_fort },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_pmm },
          ...defaultCharacterFood,
          ...defaultCharacterDrugs2,
          ...defaultCharacterDrugsMilitary,
        ]}
      >
        {defaultCharacterCritical}
      </SpecificCharacter>

      <SpecificCharacter
        id={"pas_b400_zulus"}
        className={"pas_b400_zulus"}
        name={"jup_b15_zulus"}
        icon={"ui_inGame2_Dolg_1"}
        community={communities.stalker}
        terrainSection={"stalker_terrain"}
        soundConfig={"characters_voice\\human_03\\stalker\\"}
        visual={"actors\\stalker_dolg\\stalker_dolg_1"}
        rank={75}
        supplies={[
          { section: misc.device_torch },
          { section: weapons.wpn_pkm_zulus },
          { section: weapons.wpn_usp },
          { section: ammo.ammo_pkm_100 },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...defaultCharacterFood,
          ...defaultCharacterDrugs4,
          ...defaultCharacterDrugsMilitary,
        ]}
      >
        {defaultCharacterCritical}
      </SpecificCharacter>

      <SpecificCharacter
        id={"pas_b400_wanderer"}
        className={"pas_b400_wanderer"}
        name={"jup_b4_monolith_squad_leader_name"}
        icon={"ui_inGame2_monolit_1"}
        community={communities.stalker}
        terrainSection={"stalker_terrain"}
        soundConfig={"characters_voice\\human_03\\stalker\\"}
        visual={"actors\\stalker_monolith\\stalker_monolith_1"}
        rank={98}
        supplies={[
          { section: misc.device_torch },
          { section: weapons.wpn_binoc },
          { section: weapons.wpn_svu },
          { section: weapons.wpn_colt1911 },
          { section: ammo["ammo_7.62x54_7h1"] },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...defaultCharacterFood,
          ...defaultCharacterDrugs4,
        ]}
      >
        {defaultCharacterCritical}
      </SpecificCharacter>

      <SpecificCharacter
        id={"pas_b400_monolith_sniper_0"}
        className={"pas_b400_monolith_sniper"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_monolit_2"}
        community={communities.monolith}
        terrainSection={"stalker_terrain"}
        soundConfig={"characters_voice\\human_02\\monolith\\"}
        visual={"actors\\stalker_monolith\\stalker_monolith_2"}
        rank={80}
        supplies={[
          { section: weapons.wpn_svd },
          { section: weapons.wpn_usp },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_7.62x54_7h1"] },
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
        id={"pas_b400_monolith_sniper_1"}
        className={"pas_b400_monolith_sniper"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_monolit_1"}
        community={communities.monolith}
        terrainSection={"stalker_terrain"}
        soundConfig={"characters_voice\\human_02\\monolith\\"}
        visual={"actors\\stalker_monolith\\stalker_monolith_1"}
        rank={80}
        supplies={[
          { section: weapons.wpn_svu },
          { section: weapons.wpn_sig220 },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_7.62x54_7h1"] },
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
    </xml>
  );
}
