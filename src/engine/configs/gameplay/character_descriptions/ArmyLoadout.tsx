import { Fragment, JSXNode, JSXXML } from "jsx-xml";

import { SpecificCharacter } from "@/engine/configs/gameplay/components";
import {
  CharacterProfileCriticals,
  DefaultCharacterDialogs,
  loadoutCharacterDrugsBase,
  loadoutCharacterFood,
  loadoutCharacterItemsWithoutDetector,
  loadoutF1Grenades,
  loadoutFort,
  loadoutGroza,
  loadoutPm,
  loadoutRgd5Grenades,
  loadoutSvd,
  profileIcon,
} from "@/engine/configs/gameplay/loadouts";
import { communities } from "@/engine/lib/constants/communities";
import { weapons } from "@/engine/lib/constants/items/weapons";
import {
  GENERATE_CAPTAIN_NAME,
  GENERATE_LIEUTENANT_NAME,
  GENERATE_PRIVATE_NAME,
  GENERATE_SERGEANT_NAME,
} from "@/engine/lib/constants/names";

export function ArmyLoadout(): JSXNode {
  return (
    <Fragment>
      <SpecificCharacter
        id={"sim_default_military_0_default"}
        class={"sim_default_military_0"}
        name={GENERATE_PRIVATE_NAME}
        community={communities.army}
        icon={profileIcon.ui_inGame2_Soldier_2}
        soundConfig={"characters_voice\\human_01\\military\\"}
        rank={30}
        supplies={[
          ...loadoutPm(),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsBase(),
          ...loadoutCharacterFood(),
        ]}
        loadout={[
          { section: weapons.wpn_ak74u, ammoType: 1 },
          { section: weapons.wpn_ak74, ammoType: 1 },
          { section: weapons.wpn_ak74, ammoType: 2 },
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_military_1_default_0"}
        class={"sim_default_military_1"}
        name={GENERATE_SERGEANT_NAME}
        community={communities.army}
        icon={profileIcon.ui_inGame2_Soldier_1}
        soundConfig={"characters_voice\\human_02\\military\\"}
        rank={40}
        supplies={[
          ...loadoutRgd5Grenades(2),
          ...loadoutFort(),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsBase(),
          ...loadoutCharacterFood(),
        ]}
        loadout={[
          { section: weapons.wpn_ak74u, ammoType: 2 },
          { section: weapons.wpn_ak74, ammoType: 1 },
          { section: weapons.wpn_ak74, ammoType: 2 },
          { section: weapons.wpn_ak74, scope: true, ammoType: 2 },
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_military_2_default_0"}
        class={"sim_default_military_2"}
        name={GENERATE_SERGEANT_NAME}
        community={communities.army}
        icon={profileIcon.ui_inGame2_Soldier_2}
        soundConfig={"characters_voice\\human_02\\military\\"}
        rank={45}
        supplies={[
          ...loadoutRgd5Grenades(2),
          ...loadoutFort(),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsBase(),
          ...loadoutCharacterFood(),
        ]}
        loadout={[
          { section: weapons.wpn_abakan, ammoType: 1 },
          { section: weapons.wpn_abakan, ammoType: 2 },
          { section: weapons.wpn_ak74, ammoType: 1 },
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_military_3_default_0"}
        class={"sim_default_military_3"}
        name={GENERATE_LIEUTENANT_NAME}
        community={communities.army}
        icon={profileIcon.ui_inGame2_Soldier_3}
        soundConfig={"characters_voice\\human_03\\military\\"}
        rank={55}
        supplies={[
          ...loadoutFort(),
          ...loadoutF1Grenades(3),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsBase(),
          ...loadoutCharacterFood(),
        ]}
        loadout={[
          { section: weapons.wpn_abakan, ammoType: 1 },
          { section: weapons.wpn_abakan, ammoType: 2 },
          { section: weapons.wpn_abakan, scope: true, ammoType: 2 },
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_military_3_default_sniper"}
        class={"sim_default_military_3_sniper"}
        name={GENERATE_CAPTAIN_NAME}
        community={communities.army}
        icon={profileIcon.ui_inGame2_Soldier_2}
        soundConfig={"characters_voice\\human_02\\military\\"}
        rank={60}
        supplies={[
          ...loadoutSvd(),
          ...loadoutFort(),
          ...loadoutF1Grenades(4),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsBase(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_military_4_default_0"}
        class={"sim_default_military_4"}
        name={GENERATE_CAPTAIN_NAME}
        community={communities.army}
        icon={profileIcon.ui_inGame2_Soldier_4}
        soundConfig={"characters_voice\\human_03\\military\\"}
        rank={60}
        supplies={[
          ...loadoutGroza({ ap: true }),
          ...loadoutFort(),
          ...loadoutF1Grenades(4),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsBase(),
          ...loadoutCharacterFood(),
        ]}
        loadout={[
          { section: weapons.wpn_groza, ammoType: 2 },
          { section: weapons.wpn_groza, scope: true, ammoType: 2 },
          { section: weapons.wpn_abakan, ammoType: 2 },
          { section: weapons.wpn_abakan, scope: true, ammoType: 2 },
          { section: weapons.wpn_val, ammoType: 2 },
          { section: weapons.wpn_val, scope: true, ammoType: 2 },
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>
    </Fragment>
  );
}
