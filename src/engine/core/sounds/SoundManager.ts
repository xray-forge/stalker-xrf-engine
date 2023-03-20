import { alife, time_global, XR_cse_alife_creature_abstract } from "xray16";

import { registry } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/GlobalSoundManager";
import { SoundStory } from "@/engine/core/sounds/SoundStory";
import { getObjectSquad } from "@/engine/core/utils/object";
import { STRINGIFIED_NIL } from "@/engine/lib/constants/words";
import { LuaArray, Optional, TDuration, TNumberId, TStringId, TTimestamp } from "@/engine/lib/types";

// todo: Move to db.
const sound_managers: LuaTable<TStringId, SoundManager> = new LuaTable();

/**
 * todo;
 */
export class SoundManager {
  public id: TStringId;
  public npc: LuaArray<{ npc_id: number }> = new LuaTable();
  public storyteller: Optional<TNumberId> = null;
  public story: Optional<SoundStory> = null;
  public last_playing_npc: Optional<number> = null;
  public phrase_timeout: Optional<TDuration> = null;
  public phrase_idle: TDuration = 0;

  public constructor(id: TStringId) {
    this.id = tostring(id);
  }

  /**
   * todo: Description.
   */
  public registerObject(objectId: TNumberId): void {
    table.insert(this.npc, { npc_id: objectId });
  }

  /**
   * todo: Description.
   */
  public unregister_npc(objectId: TNumberId): void {
    if (this.last_playing_npc === objectId && registry.sounds.generic.get(this.last_playing_npc)) {
      this.story = null;
      registry.sounds.generic.get(this.last_playing_npc).stop(objectId);
    }

    if (this.storyteller === objectId) {
      this.storyteller = null;
    }

    let remove_id: Optional<number> = null;

    for (const [k, v] of this.npc) {
      if (v.npc_id === objectId) {
        remove_id = k;
        break;
      }
    }

    if (remove_id !== null) {
      table.remove(this.npc, remove_id);
    }
  }

  /**
   * todo: Description.
   */
  public set_storyteller(objectId: Optional<TNumberId>): void {
    this.storyteller = objectId;
  }

  /**
   * todo: Description.
   */
  public update(): void {
    if (this.story === null) {
      return;
    }

    if (registry.sounds.generic.get(this.last_playing_npc!) !== null) {
      // --printf("wait sound")

      if (registry.objects.get(this.last_playing_npc!)?.object?.best_enemy() !== null) {
        this.story = null;
        registry.sounds.generic.get(this.last_playing_npc!).stop(this.last_playing_npc);
      }

      return;
    }

    const now: TTimestamp = time_global();

    if (this.phrase_timeout === null) {
      this.phrase_timeout = now;
    }

    if (now - this.phrase_timeout < this.phrase_idle) {
      return;
    }

    const next_phrase = this.story.getNextPhraseDescriptor();

    if (next_phrase === null) {
      return;
    }

    let npcId: Optional<TNumberId> = null;
    const tn: number = this.npc.length();

    if (tn === 0) {
      // --printf("no npc")
      return;
    }

    if (next_phrase.who === "teller") {
      if (this.storyteller === null) {
        this.choose_random_storyteller();
      }

      npcId = this.storyteller;
    } else if (next_phrase.who === "reaction") {
      let teller_id = 0;

      for (const [k, v] of this.npc) {
        if (v.npc_id === this.storyteller) {
          teller_id = k;
          break;
        }
      }

      if (tn >= 2) {
        let id: number = math.random(1, tn - 1);

        if (id >= teller_id) {
          id = id + 1;
        }

        npcId = this.npc.get(id).npc_id;
      } else {
        npcId = this.npc.get(1).npc_id;
      }
    } else if (next_phrase.who === "reaction_all") {
      let npc_id: Optional<number> = null;

      for (const [k, v] of this.npc) {
        if (v.npc_id !== this.storyteller) {
          GlobalSoundManager.getInstance().setSoundPlaying(v.npc_id, next_phrase.theme, null, null);
          npc_id = v.npc_id;
        }
      }

      this.last_playing_npc = npc_id;
      this.phrase_timeout = null;
      this.phrase_idle = next_phrase.timeout * 1000;

      return;
    } else {
      npcId = this.npc.get(math.random(1, this.npc.length())).npc_id;
    }

    if (npcId === null || registry.objects.get(npcId) === null) {
      return;
    }

    if (registry.objects.get(npcId).object!.best_enemy() !== null && registry.sounds.generic.get(npcId) !== null) {
      this.story = null;
      registry.sounds.generic.get(npcId).stop(npcId);

      return;
    }

    this.last_playing_npc = npcId;

    if (next_phrase.theme !== STRINGIFIED_NIL) {
      if (this.story && this.story.id === "squad_counter_attack") {
        const npc = alife().object<XR_cse_alife_creature_abstract>(npcId);

        if (npc !== null) {
          const our_squad = getObjectSquad(npc);

          if (our_squad !== null) {
            const our_smart = our_squad.smart_id;

            // todo: Never called, no implementation existing.
            const task = null as any; // get_task_manager().get_tasks_by_smart(our_smart);

            if (next_phrase.who !== "teller") {
              const enemy_faction = task.counter_attack_community;

              GlobalSoundManager.getInstance().setSoundPlaying(npc.id, next_phrase.theme, enemy_faction, null);
              this.phrase_timeout = null;
              this.phrase_idle = next_phrase.timeout * 1000;

              return;
            }

            GlobalSoundManager.getInstance().setSoundPlaying(npc.id, next_phrase.theme, our_squad.player_id, our_smart);
            this.phrase_timeout = null;
            this.phrase_idle = next_phrase.timeout * 1000;

            return;
          }
        }
      }

      GlobalSoundManager.getInstance().setSoundPlaying(npcId, next_phrase.theme, null, null);
    }

    this.phrase_timeout = null;
    this.phrase_idle = next_phrase.timeout * 1000;
  }

  /**
   * todo: Description.
   */
  public choose_random_storyteller(): void {
    this.storyteller = this.npc.get(math.random(1, this.npc.length())).npc_id;
  }

  /**
   * todo: Description.
   */
  public is_finished(): boolean {
    if (this.story === null) {
      return true;
    }

    return this.story.isFinished();
  }

  /**
   * todo: Description.
   */
  public set_story(storyId: TStringId): void {
    this.story = new SoundStory(storyId);
  }
}

export function get_sound_manager(id: TStringId) {
  if (sound_managers.get(id) === null) {
    sound_managers.set(id, new SoundManager(id));
  }

  return sound_managers.get(id);
}
