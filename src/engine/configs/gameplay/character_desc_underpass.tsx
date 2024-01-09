import { JSXNode, JSXXML } from "jsx-xml";

import { SpecificCharacter } from "@/engine/configs/gameplay/components";
import {
  CharacterProfileCriticals,
  DefaultCharacterDialogs,
  loadoutAk74u,
  loadoutBeretta,
  loadoutBinocular,
  loadoutCharacterDrugsAdvanced,
  loadoutCharacterDrugsElite,
  loadoutCharacterDrugsExtended,
  loadoutCharacterDrugsMilitary,
  loadoutCharacterDrugsScientific,
  loadoutCharacterFood,
  loadoutCharacterItemsWithoutDetector,
  loadoutColt1911,
  loadoutDetectorElite,
  loadoutFort,
  loadoutRgd5Grenades,
  loadoutSig220,
  loadoutSvd,
  loadoutSvu,
  loadoutTorch,
  loadoutUsp,
  loadoutWincheaster1300,
} from "@/engine/configs/gameplay/loadouts";
import { profileIcon } from "@/engine/configs/gameplay/loadouts/profile_presets";
import { communities } from "@/engine/lib/constants/communities";
import { ammo } from "@/engine/lib/constants/items/ammo";
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
          ...loadoutTorch(),
          ...loadoutBinocular(),
          ...loadoutDetectorElite(),
          ...loadoutWincheaster1300(true),
          ...loadoutBeretta(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsElite(),
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
          ...loadoutTorch(),
          ...loadoutDetectorElite(),
          ...loadoutAk74u(),
          ...loadoutFort(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsExtended(),
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
          { section: weapons.wpn_pkm_zulus },
          { section: ammo.ammo_pkm_100 },
          ...loadoutTorch(),
          ...loadoutUsp({ ap: true }),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsElite(),
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
          ...loadoutTorch(),
          ...loadoutBinocular(),
          ...loadoutSvu(),
          ...loadoutColt1911(true),
          ...loadoutCharacterFood(),
          ...loadoutCharacterDrugsElite(),
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
          ...loadoutCharacterDrugsAdvanced(),
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
          ...loadoutCharacterDrugsAdvanced(),
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
