import { getStoryIdByObjectId, IRegistryObjectState, registry } from "@/engine/core/database";
import { AbstractScheme } from "@/engine/core/schemes";
import { ISchemeDangerState } from "@/engine/core/schemes/danger";
import { IActionSchemeHearState } from "@/engine/core/schemes/hear/IActionSchemeHearState";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { parseConditionsList, parseParameters } from "@/engine/core/utils/ini/parse";
import { LuaLogger } from "@/engine/core/utils/logging";
import { switchObjectSchemeToSection } from "@/engine/core/utils/scheme/switch";
import { mapSoundMaskToSoundType } from "@/engine/core/utils/sound";
import { ESoundType } from "@/engine/lib/constants/sound/sound_type";
import {
  ClientObject,
  EScheme,
  ESchemeType,
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

const logger: LuaLogger = new LuaLogger($filename);

// Todo: move to scheme.
export class SchemeHear extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.HEAR;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER; // And monsters.

  /**
   * todo: Description.
   */
  public static override reset(
    object: ClientObject,
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
      const [result, id, value] = ini.r_line(section, it, "", "");

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
    object: ClientObject,
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
          switchObjectSchemeToSection(object, state.ini!, nextSection);
        } else if (nextSection === "") {
          state.hearInfo[storyId][soundClassType] = null;
        }
      }
    }
  }
}
