import { ESoundStoryParticipant, IReplicDescriptor } from "@/engine/core/managers/sounds/sounds_types";
import { SOUND_STORIES_LTX } from "@/engine/core/managers/sounds/SoundsConfig";
import { abort } from "@/engine/core/utils/assertion";
import { parseStringsList } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { LuaArray, TCount, TDuration, TIndex, TPath, TStringId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Object containing list of sounds for single story.
 */
export class SoundStory {
  public id: TStringId;

  public maxPhrasesCount: TCount;
  public nextPhraseIndex: TIndex;

  public replicas: LuaArray<IReplicDescriptor> = new LuaTable();

  public constructor(storyId: TStringId) {
    logger.info("New sound story: %s", storyId);

    if (!SOUND_STORIES_LTX.section_exist(storyId)) {
      abort("There is no story '%s' in 'sound_stories.ltx'.", storyId);
    }

    const storyLinesCount: TCount = SOUND_STORIES_LTX.line_count(storyId);

    this.id = storyId;
    this.maxPhrasesCount = storyLinesCount - 1;
    this.nextPhraseIndex = 0;

    for (const it of $range(0, storyLinesCount - 1)) {
      const [, , value] = SOUND_STORIES_LTX.r_line(storyId, it, "", "");

      const params: LuaArray<string> = parseStringsList(value);
      const timeout: TDuration = tonumber(params.get(3)) as TDuration;
      const theme: TPath = params.get(2);
      const who: ESoundStoryParticipant = params.get(1) as ESoundStoryParticipant;

      if (
        who !== ESoundStoryParticipant.TELLER &&
        who !== ESoundStoryParticipant.REACTION &&
        who !== ESoundStoryParticipant.REACTION_ALL
      ) {
        abort("Wrong first field '%s' in story '%s', line '%s'", who, storyId, it);
      }

      this.replicas.set(it, { who, theme, timeout });
    }
  }

  /**
   * @returns whether story is finished
   */
  public isFinished(): boolean {
    return this.nextPhraseIndex > this.maxPhrasesCount;
  }

  /**
   * Reset current sound story instance.
   */
  public reset(): void {
    this.nextPhraseIndex = 0;
  }

  /**
   * @returns descriptor of next phrase
   */
  public getNextPhraseDescriptor(): IReplicDescriptor {
    const phrase: IReplicDescriptor = this.replicas.get(this.nextPhraseIndex);

    this.nextPhraseIndex += 1;

    return phrase;
  }
}
