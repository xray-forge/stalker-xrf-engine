import { TXR_snd_type, XR_game_object, XR_ini_file, XR_vector } from "xray16";

import { ESoundType } from "@/mod/globals/sound/sound_type";
import { AnyCallablesModule } from "@/mod/lib/types";
import { getActor, IStoredObject, storage } from "@/mod/scripts/core/db";
import { parseCondList, parseParams, pickSectionFromCondList } from "@/mod/scripts/utils/configs";
import { getObjectStoryId } from "@/mod/scripts/utils/ids";
import { mapSndTypeToSoundType } from "@/mod/scripts/utils/sound";

export class Hear {
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

  public static reset_hear_callback(state: IStoredObject, section: string): void {
    const ini: XR_ini_file = state.ini!;

    if (!ini.section_exist(section)) {
      return;
    }

    const n: number = ini.line_count(section);

    state.hear_sounds = {};

    for (const i of $range(0, n - 1)) {
      const [result, id, value] = ini.r_line(section, i, "", "");

      if (Hear.is_on_sound_line(id)) {
        Hear.add_parsed_data_to_storage(value, state);
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
    const state = storage.get(object.id());

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
        const new_section = pickSectionFromCondList(getActor(), object, hear_sound_params.condlist);

        if (new_section !== null && new_section !== "") {
          get_global<AnyCallablesModule>("xr_logic").switch_to_section(object, state.ini, new_section);
        } else if (new_section === "") {
          state.hear_sounds[story_id][s_type] = null;
        }
      }
    }
  }
}
