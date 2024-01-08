import { JSXNode, JSXXML } from "jsx-xml";

import {
  CharacterProfileCriticals,
  DefaultCharacterDialogs,
  loadoutCharacterDrugs2,
  loadoutCharacterDrugs3,
  loadoutCharacterDrugs4,
  loadoutCharacterDrugsMilitary,
  loadoutCharacterDrugsScientific,
  loadoutCharacterFood,
  loadoutCharacterItemsWithoutDetector,
  loadoutRgd5Grenades,
  loadoutSig220,
  loadoutSvd,
  loadoutSvu,
  loadoutUsp,
} from "@/engine/configs/gameplay/loadouts";
import { profileIcon } from "@/engine/configs/gameplay/loadouts/profile_presets";
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
        class={"pas_b400_vano"}
        name={"jup_a10_stalker_vano"}
        icon={profileIcon.ui_inGame2_neutral_nauchniy}
        community={communities.stalker}
        soundConfig={"characters_voice\\human_03\\stalker\\"}
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
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugs4(),
        ]}
      >
        <CharacterProfileCriticals />
      </SpecificCharacter>

      <SpecificCharacter
        id={"pas_b400_sokolov"}
        class={"pas_b400_sokolov"}
        name={"pri_a15_sokolov_name"}
        icon={"ui_inGame2_ecolog_military"}
        community={communities.stalker}
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
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugs2(),
          ...loadoutCharacterDrugsMilitary(),
        ]}
      >
        <CharacterProfileCriticals />
      </SpecificCharacter>

      <SpecificCharacter
        id={"pas_b400_zulus"}
        class={"pas_b400_zulus"}
        name={"jup_b15_zulus"}
        icon={profileIcon.ui_inGame2_Dolg_1}
        community={communities.stalker}
        soundConfig={"characters_voice\\human_03\\stalker\\"}
        rank={75}
        supplies={[
          { section: misc.device_torch },
          { section: weapons.wpn_pkm_zulus },
          { section: weapons.wpn_usp },
          { section: ammo.ammo_pkm_100 },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugs4(),
          ...loadoutCharacterDrugsMilitary(),
        ]}
      >
        <CharacterProfileCriticals />
      </SpecificCharacter>

      <SpecificCharacter
        id={"pas_b400_wanderer"}
        class={"pas_b400_wanderer"}
        name={"jup_b4_monolith_squad_leader_name"}
        icon={profileIcon.ui_inGame2_monolit_1}
        community={communities.stalker}
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
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugs4(),
        ]}
      >
        <CharacterProfileCriticals />
      </SpecificCharacter>

      <SpecificCharacter
        id={"pas_b400_monolith_sniper_0"}
        class={"pas_b400_monolith_sniper"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_2}
        community={communities.monolith}
        soundConfig={"characters_voice\\human_02\\monolith\\"}
        rank={80}
        supplies={[
          ...loadoutSvd(),
          ...loadoutUsp(),
          ...loadoutRgd5Grenades(),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugs3(),
          ...loadoutCharacterDrugsMilitary(),
          ...loadoutCharacterDrugsScientific(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"pas_b400_monolith_sniper_1"}
        class={"pas_b400_monolith_sniper"}
        name={GENERATE_STALKER_NAME}
        icon={profileIcon.ui_inGame2_monolit_1}
        community={communities.monolith}
        soundConfig={"characters_voice\\human_02\\monolith\\"}
        rank={80}
        supplies={[
          ...loadoutSvu(),
          ...loadoutSig220(),
          ...loadoutRgd5Grenades(),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugs3(),
          ...loadoutCharacterDrugsMilitary(),
          ...loadoutCharacterDrugsScientific(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>
    </xml>
  );
}
