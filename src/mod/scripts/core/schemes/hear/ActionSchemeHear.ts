import { TXR_snd_type, XR_game_object, XR_ini_file, XR_vector } from "xray16";

import { ESoundType } from "@/mod/globals/sound/sound_type";
import { EScheme, ESchemeType, TSection } from "@/mod/lib/types";
import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base";
import { switchToSection } from "@/mod/scripts/core/schemes/switchToSection";
import { parseCondList, parseParams, pickSectionFromCondList } from "@/mod/scripts/utils/configs";
import { getObjectStoryId } from "@/mod/scripts/utils/ids";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { mapSndTypeToSoundType } from "@/mod/scripts/utils/sound";

const logger: LuaLogger = new LuaLogger("ActionSchemeHear");

// Todo: move to scheme.
export class ActionSchemeHear extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.HEAR;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER; // And monsters.

  public static is_on_sound_line(candidate: string): boolean {
    const [idx] = string.find(candidate, "^on_sound%d*$");

    return idx !== null;
  }

  public static add_parsed_data_to_storage(value: string, state: IStoredObject): void {
    const object: XR_game_object = state.object!;
    const parsed_params: LuaTable<number, string> = parseParams(value);

    state.hear_sounds[parsed_params.get(1)] = state.hear_sounds[parsed_params.get(1)] || new LuaTable();

    state.hear_sounds[parsed_params.get(1)][parsed_params.get(2)] = {
      dist: tonumber(parsed_params.get(3)),
      power: tonumber(parsed_params.get(4)),
      condlist: parseCondList(object, "hear_callback", "hear_callback", parsed_params.get(5)),
    };
  }

  public static override resetScheme(
    object: XR_game_object,
    scheme: EScheme,
    state: IStoredObject,
    section: TSection
  ): void {
    const ini: XR_ini_file = state.ini!;

    if (!ini.section_exist(section)) {
      return;
    }

    const n: number = ini.line_count(section);

    state.hear_sounds = {};

    for (const i of $range(0, n - 1)) {
      const [result, id, value] = ini.r_line(section, i, "", "");

      if (ActionSchemeHear.is_on_sound_line(id)) {
        ActionSchemeHear.add_parsed_data_to_storage(value, state);
      }
    }
  }

  public static hear_callback(
    object: XR_game_object,
    who_id: number,
    sound_type: TXR_snd_type,
    sound_position: XR_vector,
    sound_power: number
  ): void {
    const state = registry.objects.get(object.id());

    if (state.hear_sounds === null) {
      return;
    }

    const s_type: ESoundType = mapSndTypeToSoundType(sound_type);
    const story_id: string = getObjectStoryId(who_id) || "any";

    if (state.hear_sounds[story_id] && state.hear_sounds[story_id][s_type]) {
      const hear_sound_params = state.hear_sounds[story_id][s_type];

      if (
        hear_sound_params.dist >= sound_position.distance_to(object.position()) &&
        sound_power >= hear_sound_params.power
      ) {
        const new_section = pickSectionFromCondList(registry.actor, object, hear_sound_params.condlist);

        if (new_section !== null && new_section !== "") {
          switchToSection(object, state.ini!, new_section);
        } else if (new_section === "") {
          state.hear_sounds[story_id][s_type] = null;
        }
      }
    }
  }
}
