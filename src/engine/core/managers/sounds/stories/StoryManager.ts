import { time_global } from "xray16";

import { registry } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { ESoundStoryParticipant, IReplicDescriptor } from "@/engine/core/managers/sounds/sounds_types";
import { soundsConfig } from "@/engine/core/managers/sounds/SoundsConfig";
import { SoundStory } from "@/engine/core/managers/sounds/stories/SoundStory";
import { NIL } from "@/engine/lib/constants/words";
import { LuaArray, Optional, TCount, TDuration, TNumberId, TStringId, TTimestamp } from "@/engine/lib/types";

/**
 * Manager of object stories telling.
 * Used by objects when they are sitting or walking together.
 */
export class StoryManager {
  /**
   * Get manager singleton for provided object ID.
   */
  public static getStoryManagerForId(id: TStringId): StoryManager {
    if (soundsConfig.managers.get(id) === null) {
      soundsConfig.managers.set(id, new StoryManager(id));
    }

    return soundsConfig.managers.get(id);
  }

  public readonly id: TStringId;
  public readonly objects: LuaArray<{ objectId: TNumberId }> = new LuaTable();

  public storyteller: Optional<TNumberId> = null;
  public story: Optional<SoundStory> = null;

  public lastPlayingObjectId: Optional<TNumberId> = null;
  public phraseTimeout: Optional<TDuration> = null;
  public phraseIdle: TDuration = 0;

  public constructor(id: TStringId) {
    this.id = tostring(id);
  }

  /**
   * todo: Description.
   */
  public setStoryTeller(objectId: Optional<TNumberId>): void {
    this.storyteller = objectId;
  }

  /**
   * todo: Description.
   */
  public registerObject(objectId: TNumberId): void {
    table.insert(this.objects, { objectId: objectId });
  }

  /**
   * todo: Description.
   */
  public chooseRandomStoryteller(): void {
    this.storyteller = this.objects.get(math.random(1, this.objects.length())).objectId;
  }

  /**
   * @returns whether sound story is finished
   */
  public isFinished(): boolean {
    if (this.story === null) {
      return true;
    }

    return this.story.isFinished();
  }

  /**
   * Set active story sound to play.
   *
   * @param storyId - id of sound story to play
   */
  public setActiveId(storyId: TStringId): void {
    this.story = new SoundStory(storyId);
  }

  /**
   * todo: Description.
   */
  public unregisterObject(objectId: TNumberId): void {
    if (this.lastPlayingObjectId === objectId && soundsConfig.playing.get(this.lastPlayingObjectId)) {
      this.story = null;
      soundsConfig.playing.get(this.lastPlayingObjectId).stop(objectId);
    }

    if (this.storyteller === objectId) {
      this.storyteller = null;
    }

    let idToRemove: Optional<TNumberId> = null;

    for (const [id, descriptor] of this.objects) {
      if (descriptor.objectId === objectId) {
        idToRemove = id;
        break;
      }
    }

    if (idToRemove !== null) {
      table.remove(this.objects, idToRemove);
    }
  }

  /**
   * todo: Description.
   */
  public update(): void {
    if (this.story === null) {
      return;
    }

    if (soundsConfig.playing.get(this.lastPlayingObjectId!) !== null) {
      if (registry.objects.get(this.lastPlayingObjectId!)?.object?.best_enemy() !== null) {
        this.story = null;
        soundsConfig.playing.get(this.lastPlayingObjectId!).stop(this.lastPlayingObjectId);
      }

      return;
    }

    const now: TTimestamp = time_global();

    if (this.phraseTimeout === null) {
      this.phraseTimeout = now;
    }

    if (now - this.phraseTimeout < this.phraseIdle) {
      return;
    }

    const nextPhraseDescriptor: Optional<IReplicDescriptor> = this.story.getNextPhraseDescriptor();

    if (nextPhraseDescriptor === null) {
      return;
    }

    let nextSpeakerObjectId: Optional<TNumberId> = null;
    const participantsCount: TCount = this.objects.length();

    if (participantsCount === 0) {
      return;
    }

    if (nextPhraseDescriptor.who === ESoundStoryParticipant.TELLER) {
      if (this.storyteller === null) {
        this.chooseRandomStoryteller();
      }

      nextSpeakerObjectId = this.storyteller;
    } else if (nextPhraseDescriptor.who === ESoundStoryParticipant.REACTION) {
      let tellerId: TNumberId = 0;

      for (const [k, v] of this.objects) {
        if (v.objectId === this.storyteller) {
          tellerId = k;
          break;
        }
      }

      if (participantsCount >= 2) {
        let id: TNumberId = math.random(1, participantsCount - 1);

        if (id >= tellerId) {
          id = id + 1;
        }

        nextSpeakerObjectId = this.objects.get(id).objectId;
      } else {
        nextSpeakerObjectId = this.objects.get(1).objectId;
      }
    } else if (nextPhraseDescriptor.who === ESoundStoryParticipant.REACTION_ALL) {
      let objectId: Optional<TNumberId> = null;

      for (const [index, descriptor] of this.objects) {
        if (descriptor.objectId !== this.storyteller) {
          GlobalSoundManager.getInstance().playSound(descriptor.objectId, nextPhraseDescriptor.theme, null, null);
          objectId = descriptor.objectId;
        }
      }

      this.lastPlayingObjectId = objectId;
      this.phraseTimeout = null;
      this.phraseIdle = nextPhraseDescriptor.timeout * 1000;

      return;
    } else {
      nextSpeakerObjectId = this.objects.get(math.random(1, this.objects.length())).objectId;
    }

    if (nextSpeakerObjectId === null || registry.objects.get(nextSpeakerObjectId) === null) {
      return;
    }

    if (
      registry.objects.get(nextSpeakerObjectId).object!.best_enemy() !== null &&
      soundsConfig.playing.get(nextSpeakerObjectId) !== null
    ) {
      this.story = null;
      soundsConfig.playing.get(nextSpeakerObjectId).stop(nextSpeakerObjectId);

      return;
    }

    this.phraseTimeout = null;
    this.lastPlayingObjectId = nextSpeakerObjectId;
    this.phraseIdle = nextPhraseDescriptor.timeout * 1000;

    if (nextPhraseDescriptor.theme !== NIL) {
      GlobalSoundManager.getInstance().playSound(nextSpeakerObjectId, nextPhraseDescriptor.theme, null, null);
    }
  }
}
