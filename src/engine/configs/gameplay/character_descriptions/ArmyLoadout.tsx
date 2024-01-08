import { Fragment, JSXNode, JSXXML } from "jsx-xml";

import {
  CharacterProfileCriticals,
  DefaultCharacterDialogs,
  loadoutAbakan,
  loadoutAk74,
  loadoutAk74u,
  loadoutCharacterDrugs,
  loadoutCharacterFood,
  loadoutCharacterItemsWithoutDetector,
  loadoutF1Grenades,
  loadoutFort,
  loadoutGroza,
  loadoutPm,
  loadoutRgd5Grenades,
  loadoutSvd,
  loadoutVal,
} from "@/engine/configs/gameplay/loadouts";
import { profileIcon } from "@/engine/configs/gameplay/loadouts/profile_presets";
import { SpecificCharacter } from "@/engine/configs/gameplay/utils";
import { communities } from "@/engine/lib/constants/communities";
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
          ...loadoutAk74u(),
          ...loadoutPm(),
          ...loadoutCharacterItemsWithoutDetector,
          ...loadoutCharacterDrugs,
          ...loadoutCharacterFood,
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_military_1_default"}
        class={"sim_default_military_1"}
        name={GENERATE_PRIVATE_NAME}
        community={communities.army}
        icon={profileIcon.ui_inGame2_Soldier_2}
        soundConfig={"characters_voice\\human_01\\military\\"}
        rank={35}
        supplies={[
          ...loadoutRgd5Grenades(),
          ...loadoutAk74(),
          ...loadoutPm(),
          ...loadoutCharacterItemsWithoutDetector,
          ...loadoutCharacterDrugs,
          ...loadoutCharacterFood,
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
          ...loadoutAk74(),
          ...loadoutFort(),
          ...loadoutCharacterItemsWithoutDetector,
          ...loadoutCharacterDrugs,
          ...loadoutCharacterFood,
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_military_2_default_1"}
        class={"sim_default_military_2"}
        name={GENERATE_SERGEANT_NAME}
        community={communities.army}
        icon={profileIcon.ui_inGame2_Soldier_2}
        soundConfig={"characters_voice\\human_02\\military\\"}
        rank={45}
        supplies={[
          ...loadoutAbakan(),
          ...loadoutFort(),
          ...loadoutRgd5Grenades(2),
          ...loadoutCharacterItemsWithoutDetector,
          ...loadoutCharacterDrugs,
          ...loadoutCharacterFood,
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
          ...loadoutCharacterItemsWithoutDetector,
          ...loadoutCharacterDrugs,
          ...loadoutCharacterFood,
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
          ...loadoutCharacterItemsWithoutDetector,
          ...loadoutCharacterDrugs,
          ...loadoutCharacterFood,
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_military_4_default_1"}
        class={"sim_default_military_4"}
        name={GENERATE_CAPTAIN_NAME}
        community={communities.army}
        icon={profileIcon.ui_inGame2_Soldier_4}
        soundConfig={"characters_voice\\human_03\\military\\"}
        rank={60}
        supplies={[
          ...loadoutVal({ ap: true }),
          ...loadoutFort(),
          ...loadoutF1Grenades(4),
          ...loadoutCharacterItemsWithoutDetector,
          ...loadoutCharacterDrugs,
          ...loadoutCharacterFood,
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_military_4_default_2"}
        class={"sim_default_military_4"}
        name={GENERATE_CAPTAIN_NAME}
        community={communities.army}
        icon={profileIcon.ui_inGame2_Soldier_4}
        soundConfig={"characters_voice\\human_03\\military\\"}
        rank={60}
        supplies={[
          ...loadoutAbakan({ scope: true, ap: true }),
          ...loadoutFort(),
          ...loadoutF1Grenades(4),
          ...loadoutCharacterItemsWithoutDetector,
          ...loadoutCharacterDrugs,
          ...loadoutCharacterFood,
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
          ...loadoutCharacterItemsWithoutDetector,
          ...loadoutCharacterDrugs,
          ...loadoutCharacterFood,
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>
    </Fragment>
  );
}
