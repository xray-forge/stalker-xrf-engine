import { AbstractScheme } from "@/engine/core/ai/scheme";
import { getStoryIdByObjectId, IRegistryObjectState, registry } from "@/engine/core/database";
import { IActionSchemeHearState } from "@/engine/core/schemes/shared/hear/hear_types";
import { ISchemeDangerState } from "@/engine/core/schemes/stalker/danger";
import { parseConditionsList, parseParameters, pickSectionFromCondList } from "@/engine/core/utils/ini";
import { switchObjectSchemeToSection } from "@/engine/core/utils/scheme/scheme_switch";
import { mapSoundMaskToSoundType } from "@/engine/core/utils/sound";
import { ESoundType } from "@/engine/lib/constants/sound";
import {
  EScheme,
  ESchemeType,
  GameObject,
  IniFile,
  LuaArray,
  Optional,
  TCount,
  TDistance,
  TName,
  TNumberId,
  TRate,
  TSection,
  TSoundType,
  TStringId,
  Vector,
} from "@/engine/lib/types";

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

      if (string.find(id, "^on_sound%d*$")[0] !== null) {
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
   * todo: Description.
   */
  public static onObjectHearSound(
    object: GameObject,
    whoId: TNumberId,
    soundType: TSoundType,
    soundPosition: Vector,
    soundPower: TRate
  ): void {
    const state: IRegistryObjectState = registry.objects.get(object.id());
    const dangerState: Optional<ISchemeDangerState> = state[EScheme.DANGER] as Optional<ISchemeDangerState>;

    if (dangerState) {
      dangerState.dangerManager.onHear(object, whoId, soundType, soundPosition, soundPower);
    }

    if (state.hearInfo === null) {
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
        const nextSection: Optional<TSection> = pickSectionFromCondList(
          registry.actor,
          object,
          classTypeParameters.condlist
        );

        if (nextSection !== null && nextSection !== "") {
          switchObjectSchemeToSection(object, state.ini, nextSection);
        } else if (nextSection === "") {
          state.hearInfo[storyId][soundClassType] = null;
        }
      }
    }
  }
}
