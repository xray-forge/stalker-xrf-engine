import { TXR_snd_type, XR_game_object, XR_ini_file, XR_vector } from "xray16";

import { ESoundType } from "@/mod/globals/sound/sound_type";
import {
  EScheme,
  ESchemeType,
  LuaArray,
  Optional,
  TCount,
  TDistance,
  TName,
  TNumberId,
  TRate,
  TSection,
  TStringId,
} from "@/mod/lib/types";
import { IRegistryObjectState, registry } from "@/mod/scripts/core/database";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base";
import { IActionSchemeHearState } from "@/mod/scripts/core/schemes/hear/IActionSchemeHearState";
import { switchToSection } from "@/mod/scripts/core/schemes/switchToSection";
import { pickSectionFromCondList } from "@/mod/scripts/utils/configs";
import { getObjectStoryId } from "@/mod/scripts/utils/ids";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { parseConditionsList, parseParameters } from "@/mod/scripts/utils/parse";
import { mapSndTypeToSoundType } from "@/mod/scripts/utils/sound";

const logger: LuaLogger = new LuaLogger($filename);

// Todo: move to scheme.
export class ActionSchemeHear extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.HEAR;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER; // And monsters.

  /**
   * todo;
   */
  public static override resetScheme(
    object: XR_game_object,
    scheme: EScheme,
    state: IRegistryObjectState,
    section: TSection
  ): void {
    const ini: XR_ini_file = state.ini;

    if (!ini.section_exist(section)) {
      return;
    }

    const lineCount: TCount = ini.line_count(section);

    state.hearInfo = {} as IActionSchemeHearState;

    for (const it of $range(0, lineCount - 1)) {
      const [result, id, value] = ini.r_line(section, it, "", "");

      if (string.find(id, "^on_sound%d*$")[0] !== null) {
        const parameters: LuaArray<TName> = parseParameters(value);

        state.hearInfo[parameters.get(1)] = state.hearInfo[parameters.get(1)] || {};
        state.hearInfo[parameters.get(1)][parameters.get(2)] = {
          dist: tonumber(parameters.get(3)) as TDistance,
          power: tonumber(parameters.get(4)) as TRate,
          condlist: parseConditionsList(object, "hear_callback", "hear_callback", parameters.get(5)),
        };
      }
    }
  }

  /**
   * todo;
   */
  public static onObjectHearSound(
    object: XR_game_object,
    whoId: TNumberId,
    soundType: TXR_snd_type,
    soundPosition: XR_vector,
    soundPower: TRate
  ): void {
    const state: IRegistryObjectState = registry.objects.get(object.id());

    if (state.hearInfo === null) {
      return;
    }

    const storyId: TStringId = getObjectStoryId(whoId) || "any";
    const soundClassType: ESoundType = mapSndTypeToSoundType(soundType);
    const classTypeParameters = state.hearInfo[storyId] ? state.hearInfo[storyId][soundClassType] : null;

    if (classTypeParameters) {
      if (
        classTypeParameters.dist >= soundPosition.distance_to(object.position()) &&
        soundPower >= classTypeParameters.power
      ) {
        const nextSection: Optional<TSection> = pickSectionFromCondList(
          registry.actor,
          object,
          classTypeParameters.condlist
        );

        if (nextSection !== null && nextSection !== "") {
          switchToSection(object, state.ini!, nextSection);
        } else if (nextSection === "") {
          state.hearInfo[storyId][soundClassType] = null;
        }
      }
    }
  }
}
