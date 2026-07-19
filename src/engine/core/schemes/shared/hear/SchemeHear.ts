import { GameObject, IniFile, TSoundType, Vector } from "xray16/alias";
import { LuaArray, Nillable, TCount, TDistance, TName, TNumberId, TRate, TSection, TStringId } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { ESoundType } from "@/engine/constants/sound";
import { getStoryIdByObjectId, IRegistryObjectState, registry } from "@/engine/core/database";
import { AbstractScheme } from "@/engine/core/schemes/base";
import { switchObjectSchemeToSection } from "@/engine/core/schemes/runtime/scheme_switch";
import { IActionSchemeHearState } from "@/engine/core/schemes/shared/hear/hear_types";
import { ISchemeDangerState } from "@/engine/core/schemes/stalker/danger";
import { getSchemeState } from "@/engine/core/schemes/state";
import { EScheme, ESchemeType } from "@/engine/core/schemes/types";
import { parseConditionsList, parseParameters, pickSectionFromCondList } from "@/engine/core/utils/ini";
import { mapSoundMaskToSoundType } from "@/engine/core/utils/sound";

// Todo: move to scheme.
export class SchemeHear extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.HEAR;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER; // And monsters.

  public static override reset(
    object: GameObject,
    scheme: EScheme,
    state: IRegistryObjectState,
    section: TSection
  ): void {
    const ini: IniFile = state.ini;

    if (!ini.section_exist(section)) {
      return;
    }

    const lineCount: TCount = ini.line_count(section);

    state.hearInfo = {} as IActionSchemeHearState;

    for (const it of $range(0, lineCount - 1)) {
      const [, id, value] = ini.r_line(section, it, "", "");

      if ($isNotNil(string.find(id, "^on_sound%d*$")[0])) {
        const parameters: LuaArray<TName> = parseParameters(value);

        state.hearInfo[parameters.get(1)] = state.hearInfo[parameters.get(1)] || {};
        state.hearInfo[parameters.get(1)][parameters.get(2)] = {
          dist: tonumber(parameters.get(3)) as TDistance,
          power: tonumber(parameters.get(4)) as TRate,
          condlist: parseConditionsList(parameters.get(5)),
        };
      }
    }
  }

  /**
   * Handle a heard sound by notifying the danger manager and switching the object scheme on a matching hear rule.
   *
   * @param object - Object that heard the sound.
   * @param whoId - Identifier of the object that produced the sound.
   * @param soundType - Type mask of the heard sound.
   * @param soundPosition - World position where the sound originated.
   * @param soundPower - Power of the heard sound.
   */
  public static onObjectHearSound(
    object: GameObject,
    whoId: TNumberId,
    soundType: TSoundType,
    soundPosition: Vector,
    soundPower: TRate
  ): void {
    const state: IRegistryObjectState = registry.objects.get(object.id());
    const dangerState: Nillable<ISchemeDangerState> = getSchemeState(state, EScheme.DANGER);

    if (dangerState) {
      dangerState.dangerManager.onHear(object, whoId, soundType, soundPosition, soundPower);
    }

    if (!state.hearInfo) {
      return;
    }

    const storyId: TStringId = getStoryIdByObjectId(whoId) || "any";
    const soundClassType: ESoundType = mapSoundMaskToSoundType(soundType);
    const classTypeParameters = state.hearInfo[storyId] ? state.hearInfo[storyId][soundClassType] : null;

    if (classTypeParameters) {
      if (
        classTypeParameters.dist >= soundPosition.distance_to(object.position()) &&
        soundPower >= classTypeParameters.power
      ) {
        const nextSection: Nillable<TSection> = pickSectionFromCondList(
          registry.actor,
          object,
          classTypeParameters.condlist
        );

        if ($isNotNil(nextSection) && nextSection !== "") {
          switchObjectSchemeToSection(object, state.ini, nextSection);
        } else if (nextSection === "") {
          state.hearInfo[storyId][soundClassType] = null;
        }
      }
    }
  }
}
