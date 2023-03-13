import { ini_file, XR_ini_file } from "xray16";

import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { parseNames } from "@/mod/scripts/utils/parse";

const story_ltx: XR_ini_file = new ini_file("misc\\sound_stories.ltx");

const logger: LuaLogger = new LuaLogger($filename);

export interface IReplicDescriptor {
  who: string;
  theme: string;
  timeout: number;
}

export class SoundStory {
  public id: string;
  public max_phrase_count: number;
  public next_phrase: number;

  public replics: LuaTable<number, IReplicDescriptor> = new LuaTable();

  public constructor(story_id: string) {
    if (!story_ltx.section_exist(story_id)) {
      abort("There is no story [%s] in sound_stories.ltx", tostring(story_id));
    }

    const n = story_ltx.line_count(story_id);

    for (const i of $range(0, n - 1)) {
      const [result, id, value] = story_ltx.r_line(story_id, i, "", "");

      const t = parseNames(value);
      const firstField: string = t.get(1);

      if (firstField !== "teller" && firstField !== "reaction" && firstField !== "reaction_all") {
        abort("Wrong first field [%s] in story [%s]", tostring(firstField), tostring(story_id));
      }

      this.replics.set(i, { who: firstField, theme: t.get(2), timeout: tonumber(t.get(3))! });
    }

    this.id = tostring(story_id)!;
    this.max_phrase_count = n - 1;
    this.next_phrase = 0;
  }

  public is_finished(): boolean {
    return this.next_phrase > this.max_phrase_count;
  }

  public reset_story(): void {
    this.next_phrase = 0;
  }

  public get_next_phrase(): IReplicDescriptor {
    const phrase = this.replics.get(this.next_phrase);

    this.next_phrase = this.next_phrase + 1;

    return phrase;
  }
}
