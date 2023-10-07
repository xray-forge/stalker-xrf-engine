import { SOUND_STORIES_LTX } from "@/engine/core/database";
import { ESoundStoryParticipant, IReplicDescriptor } from "@/engine/core/managers/sounds/sounds_types";
import { abort } from "@/engine/core/utils/assertion";
import { parseStringsList } from "@/engine/core/utils/ini/ini_parse";
import { LuaLogger } from "@/engine/core/utils/logging";
import { LuaArray, TCount, TIndex, TStringId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo: Description.
 */
export class SoundStory {
  public id: TStringId;

  public maxPhrasesCount: TCount;
  public nextPhraseIndex: TIndex = 0;

  public replicas: LuaArray<IReplicDescriptor> = new LuaTable();

  public constructor(storyId: TStringId) {
    logger.info("New sound story:", storyId);

    if (!SOUND_STORIES_LTX.section_exist(storyId)) {
      abort("There is no story [%s] in 'sound_stories.ltx'.", tostring(storyId));
    }

    const storyLinesCount: TCount = SOUND_STORIES_LTX.line_count(storyId);

    this.id = tostring(storyId)!;
    this.maxPhrasesCount = storyLinesCount - 1;

    for (const it of $range(0, storyLinesCount - 1)) {
      const [result, id, value] = SOUND_STORIES_LTX.r_line(storyId, it, "", "");

      const params: LuaArray<string> = parseStringsList(value);
      const who: ESoundStoryParticipant = params.get(1) as ESoundStoryParticipant;

      if (
        who !== ESoundStoryParticipant.TELLER &&
        who !== ESoundStoryParticipant.REACTION &&
        who !== ESoundStoryParticipant.REACTION_ALL
      ) {
        abort("Wrong first field [%s] in story [%s]", tostring(who), tostring(storyId));
      }

      this.replicas.set(it, { who: who, theme: params.get(2), timeout: tonumber(params.get(3))! });
    }
  }

  /**
   * todo: Description.
   */
  public isFinished(): boolean {
    return this.nextPhraseIndex > this.maxPhrasesCount;
  }

  /**
   * todo: Description.
   */
  public reset(): void {
    this.nextPhraseIndex = 0;
  }

  /**
   * todo: Description.
   */
  public getNextPhraseDescriptor(): IReplicDescriptor {
    const phrase: IReplicDescriptor = this.replicas.get(this.nextPhraseIndex);

    this.nextPhraseIndex += 1;

    return phrase;
  }
}
