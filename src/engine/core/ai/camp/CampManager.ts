import { time_global } from "xray16";

import { EObjectCampActivity, EObjectCampRole, ICampStateDescriptor } from "@/engine/core/ai/camp/camp_types";
import { getObjectCampActivityRole } from "@/engine/core/ai/camp/camp_utils";
import { campConfig } from "@/engine/core/ai/camp/CampConfig";
import { getManager, IBaseSchemeState, IRegistryObjectState, registry } from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import { soundsConfig } from "@/engine/core/managers/sounds/SoundsConfig";
import { StoryManager } from "@/engine/core/managers/sounds/stories";
import { getStoryManager } from "@/engine/core/managers/sounds/utils";
import { ISchemeAnimpointState } from "@/engine/core/schemes/stalker/animpoint/animpoint_types";
import { ISchemeMeetState } from "@/engine/core/schemes/stalker/meet";
import { MeetManager } from "@/engine/core/schemes/stalker/meet/MeetManager";
import { abort } from "@/engine/core/utils/assertion";
import { readIniStringList } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isObjectMeeting } from "@/engine/core/utils/planner";
import { emitSchemeEvent } from "@/engine/core/utils/scheme";
import {
  EScheme,
  ESchemeEvent,
  GameObject,
  IniFile,
  LuaArray,
  Optional,
  TCount,
  TDuration,
  TName,
  TNumberId,
  TProbability,
  TTimestamp,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manager controlling logic of game camp zone.
 * If any camp zone has [camp] section description, stalkers will handle it as place to sit and use.
 * In other cases checks are done with position verification.
 */
export class CampManager {
  public availableSoundStories: LuaArray<TName>;
  public availableGuitarStories: LuaArray<TName>;
  public availableHarmonicaStories: LuaArray<TName>;

  public storyManager: StoryManager;
  public ini: IniFile;
  public object: GameObject;

  // List of objects registered in camp.
  public objects: LuaTable<TNumberId, ICampStateDescriptor> = new LuaTable();
  public directorId: Optional<TNumberId> = null;
  public idleTalkerId: Optional<TNumberId> = null;

  public isStoryStarted: boolean = true;

  public activity: EObjectCampActivity = EObjectCampActivity.IDLE;
  public activitySwitchAt: TTimestamp = -1;
  public activityTimeout: TDuration = 0;

  public constructor(object: GameObject, ini: IniFile) {
    this.ini = ini;
    this.object = object;
    this.storyManager = getStoryManager(`camp_${this.object.id()}`);

    this.availableSoundStories = readIniStringList(ini, "camp", "stories", false, "test_story");
    this.availableGuitarStories = readIniStringList(ini, "camp", "guitar_themes", false, "test_guitar");
    this.availableHarmonicaStories = readIniStringList(ini, "camp", "harmonica_themes", false, "test_harmonica");
  }

  /**
   * Update current activity story.
   */
  public updateStory(): void {
    switch (this.activity) {
      case EObjectCampActivity.STORY:
        this.isStoryStarted = true;
        this.storyManager.setStoryTeller(this.directorId);
        this.storyManager.setActiveStory(
          this.availableSoundStories.get(math.random(this.availableSoundStories.length()))
        );

        return;

      case EObjectCampActivity.IDLE:
        this.isStoryStarted = true;

        return;
    }
  }

  /**
   * Get activity in camp for provided object.
   *
   * @param objectId - target object id to check and get action / state
   * @returns tuple with action name and whether object is director
   */
  public getObjectActivity(objectId: TNumberId): LuaMultiReturn<[Optional<EObjectCampActivity>, Optional<boolean>]> {
    const descriptor: Optional<ICampStateDescriptor> = this.objects.get(objectId) as Optional<ICampStateDescriptor>;

    if (descriptor) {
      return $multi(descriptor.state, this.directorId === objectId);
    } else {
      return $multi(null, null);
    }
  }

  /**
   * Handle client side update tick.
   */
  public update(delta: TDuration): void {
    // Process story telling if not finished.
    if (!this.storyManager.isFinished()) {
      return this.storyManager.update();
    }

    // Nothing to process.
    if (!this.isStoryStarted) {
      return;
    }

    // Check idle talker and reset if it is not speaking anymore.
    if (this.idleTalkerId) {
      if (soundsConfig.playing.get(this.idleTalkerId) !== null) {
        return;
      } else {
        this.idleTalkerId = null;
      }
    }

    const now: TTimestamp = time_global();

    if (this.activitySwitchAt < now) {
      this.updateNextState();
      this.updateActivityDirector();

      this.isStoryStarted = false;

      for (const [id] of this.objects) {
        const state: Optional<IRegistryObjectState> = registry.objects.get(id) as Optional<IRegistryObjectState>;

        if (state) {
          // Emit scheme logic update.
          emitSchemeEvent(state.object, state[state.activeScheme as EScheme] as IBaseSchemeState, ESchemeEvent.UPDATE);
        }

        const meetManager: Optional<MeetManager> = (state?.[EScheme.MEET] as ISchemeMeetState)
          ?.meetManager as Optional<MeetManager>;

        // Mark as director to prevent object from speaking with actor.
        if (meetManager) {
          meetManager.isCampStoryDirector = this.directorId === id;
        }
      }
    }

    if (this.activityTimeout !== 0 && this.activityTimeout <= now) {
      this.updateStory();
      this.activityTimeout = 0;
    }

    // Set one of object to do idle talk (complain, tell something). Pick random object.
    if (this.activity === EObjectCampActivity.IDLE) {
      const talkers: LuaArray<TNumberId> = new LuaTable();
      let objectsCount: TCount = 0;

      for (const [id] of this.objects) {
        objectsCount += 1;
        table.insert(talkers, id);
      }

      // todo: Simplify with table random.
      if (objectsCount !== 0) {
        this.idleTalkerId = talkers.get(math.random(talkers.length()));
        getManager(SoundManager).playSound(this.idleTalkerId, "state");
      }
    }
  }

  /**
   * todo: Description.
   */
  public updateNextState(): void {
    const transitions: LuaTable<EObjectCampActivity, TProbability> = campConfig.CAMP_ACTIVITIES.get(
      this.activity
    ).transitions;
    let probability: TProbability = math.random(100);

    for (const [activity, chance] of transitions) {
      if (probability < chance) {
        if (campConfig.CAMP_ACTIVITIES.get(activity).precondition(this)) {
          this.activity = activity;
          break;
        }
      } else {
        probability -= chance;
      }
    }

    for (const [, it] of this.objects) {
      it.state = this.activity;
    }

    const now: TTimestamp = time_global();

    this.activitySwitchAt =
      now +
      math.random(
        campConfig.CAMP_ACTIVITIES.get(this.activity).minTime,
        campConfig.CAMP_ACTIVITIES.get(this.activity).maxTime
      );
    this.activityTimeout = now + campConfig.CAMP_ACTIVITIES.get(this.activity).timeout;

    // logger.info("Set camp next state:", probability, this.activity, "| switch at:", this.activitySwitchAt);
  }

  /**
   * todo: Description.
   */
  public updateActivityDirector(): void {
    if (this.activity === EObjectCampActivity.IDLE) {
      this.directorId = null;

      return;
    }

    const directors: LuaArray<TNumberId> = new LuaTable();
    let objectsCount: TCount = 0;

    for (const [id, descriptor] of this.objects) {
      objectsCount += 1;

      const state: Optional<IRegistryObjectState> = registry.objects.get(id);

      if (state && state.activeScheme) {
        const schemeState: Optional<ISchemeAnimpointState> = state[state.activeScheme] as ISchemeAnimpointState;
        const object: Optional<GameObject> = state.object;

        if (
          schemeState !== null &&
          schemeState.actionNameBase === schemeState.description &&
          descriptor[this.activity] === EObjectCampRole.DIRECTOR &&
          !isObjectMeeting(object)
        ) {
          table.insert(directors, id);
        }
      }
    }

    if (objectsCount === 0) {
      this.directorId = null;
    } else if (directors.length() < 1) {
      this.activity = EObjectCampActivity.IDLE;

      for (const [, it] of this.objects) {
        it.state = this.activity;
      }
    } else {
      this.directorId = directors.length() === 1 ? directors.get(1) : table.random(directors)[1];
    }
  }

  /**
   * Register object in camp and check possible activities for it.
   *
   * @param objectId - target object id to register
   */
  public registerObject(objectId: TNumberId): void {
    logger.info("Register object in camp:", objectId);

    this.objects.set(objectId, { state: this.activity } as ICampStateDescriptor);

    const state: IRegistryObjectState = registry.objects.get(objectId);

    state.camp = this.object.id();

    for (const [activity] of campConfig.CAMP_ACTIVITIES) {
      const role: EObjectCampRole = getObjectCampActivityRole(objectId, activity);

      if (role === EObjectCampRole.NONE) {
        abort("Wrong role for object '%s' in camp '%s', activity '%s'.", objectId, this.object.name(), activity);
      }

      this.objects.get(objectId)[activity] = role;
    }

    this.storyManager.registerObject(objectId);

    emitSchemeEvent(state.object, state[state.activeScheme!]!, ESchemeEvent.UPDATE, -1);
  }

  /**
   * Unregister object from camp.
   *
   * @param objectId - target object id to unregister
   */
  public unregisterObject(objectId: TNumberId): void {
    logger.info("Unregister object from camp:", objectId);

    if (this.directorId === objectId) {
      this.isStoryStarted = false;
      this.activitySwitchAt = 0;
      this.directorId = null;
      this.activity = EObjectCampActivity.IDLE;

      for (const [, descriptor] of this.objects) {
        descriptor.state = this.activity;
      }
    }

    registry.objects.get(objectId).camp = null;

    this.objects.delete(objectId);
    this.storyManager.unregisterObject(objectId);
  }
}
