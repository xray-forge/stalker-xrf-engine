import { time_global } from "xray16";
import { GameObject, IniFile } from "xray16/alias";
import { assert, LuaArray, Nillable, TCount, TDuration, TName, TNumberId, TProbability, TTimestamp } from "xray16/lib";
import { $filename, $isNotNil } from "xray16/macros";

import { EObjectCampActivity, EObjectCampRole, ICampStateDescriptor } from "@/engine/core/ai/camp/camp_types";
import { getObjectCampActivityRole } from "@/engine/core/ai/camp/camp_utils";
import { campConfig } from "@/engine/core/ai/camp/CampConfig";
import { getManager, IRegistryObjectState, registry } from "@/engine/core/database";
import { readIniStringList } from "@/engine/core/ini";
import { getStoryManager, SoundManager, soundsConfig, StoryManager } from "@/engine/core/managers/sounds";
import { emitSchemeEvent } from "@/engine/core/schemes/runtime";
import { ISchemeAnimpointState } from "@/engine/core/schemes/stalker/animpoint/animpoint_types";
import { MeetManager } from "@/engine/core/schemes/stalker/meet/MeetManager";
import {
  getActiveSchemeState,
  getActiveSchemeStateOptimistic,
  getSchemeState,
  hasActiveScheme,
} from "@/engine/core/schemes/state";
import { EScheme, ESchemeEvent } from "@/engine/core/schemes/types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isObjectMeeting } from "@/engine/core/utils/planner";

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

  public ini: IniFile;
  public object: GameObject;
  public storyManager: StoryManager;

  // List of objects registered in camp.
  public objects: LuaMap<TNumberId, ICampStateDescriptor> = new LuaMap();
  public directorId: Nillable<TNumberId> = null;
  public idleTalkerId: Nillable<TNumberId> = null;

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
        this.storyManager.setActiveStory(table.random(this.availableSoundStories)[1]);

        return;

      case EObjectCampActivity.IDLE:
        this.isStoryStarted = true;

        return;
    }
  }

  /**
   * Get activity in camp for provided object.
   *
   * @param objectId - Target object id to check and get action / state.
   * @returns Tuple with action name and whether object is director.
   */
  public getObjectActivity(objectId: TNumberId): LuaMultiReturn<[Nillable<EObjectCampActivity>, Nillable<boolean>]> {
    const descriptor: Nillable<ICampStateDescriptor> = this.objects.get(objectId) as Nillable<ICampStateDescriptor>;

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

    // Prevent an actor from remaining in a playing animation after its instrumental story has finished.
    if (this.activity === EObjectCampActivity.GUITAR || this.activity === EObjectCampActivity.HARMONICA) {
      this.directorId = null;
      this.activitySwitchAt = 0;
      this.activityTimeout = 0;
    }

    // Check idle talker and reset if it is not speaking anymore.
    if (this.idleTalkerId) {
      if ($isNotNil(soundsConfig.playing.get(this.idleTalkerId))) {
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
        const state: Nillable<IRegistryObjectState> = registry.objects.get(id) as Nillable<IRegistryObjectState>;

        if ($isNotNil(state) && hasActiveScheme(state)) {
          emitSchemeEvent(getActiveSchemeStateOptimistic(state), ESchemeEvent.UPDATE);
        }

        const meetManager: Nillable<MeetManager> = $isNotNil(state)
          ? getSchemeState(state, EScheme.MEET)?.meetManager
          : null;

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
        this.idleTalkerId = table.random(talkers)[1];
        getManager(SoundManager).play(this.idleTalkerId, "state");
      }
    }
  }

  /**
   * Pick the next camp activity based on transition probabilities and preconditions, then apply it to all objects.
   *
   * Also schedules the next activity switch and timeout timestamps.
   */
  public updateNextState(forcedActivity: Nillable<EObjectCampActivity> = null): void {
    if ($isNotNil(forcedActivity)) {
      this.activity = forcedActivity;
    } else {
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
  }

  /**
   * Select the camp object that directs the current activity (such as a storyteller or guitar player).
   *
   * Falls back to idle activity when no eligible director is available.
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

      const state: Nillable<IRegistryObjectState> = registry.objects.get(id);

      if ($isNotNil(state) && hasActiveScheme(state)) {
        const schemeState: Nillable<ISchemeAnimpointState> = getActiveSchemeState(state);
        const object: Nillable<GameObject> = state.object;

        if (
          $isNotNil(schemeState) &&
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
      this.directorId = null;
      this.updateNextState(EObjectCampActivity.IDLE);
    } else {
      this.directorId = directors.length() === 1 ? directors.get(1) : table.random(directors)[1];
    }
  }

  /**
   * Register object in camp and check possible activities for it.
   *
   * @param objectId - Target object id to register.
   */
  public registerObject(objectId: TNumberId): void {
    logger.info("Register object in camp: %s", objectId);

    const campState: ICampStateDescriptor = { state: this.activity } as ICampStateDescriptor;
    const state: IRegistryObjectState = registry.objects.get(objectId);

    this.objects.set(objectId, campState);

    state.camp = this.object.id();

    for (const [activity] of campConfig.CAMP_ACTIVITIES) {
      const role: EObjectCampRole = getObjectCampActivityRole(objectId, activity);

      assert(
        role !== EObjectCampRole.NONE,
        "Wrong role for object '%s' in camp '%s', activity '%s'.",
        objectId,
        this.object.name(),
        activity
      );

      campState[activity] = role;
    }

    this.storyManager.registerObject(objectId);

    emitSchemeEvent(getActiveSchemeStateOptimistic(state), ESchemeEvent.UPDATE, -1);
  }

  /**
   * Unregister object from camp.
   *
   * @param objectId - Target object id to unregister.
   */
  public unregisterObject(objectId: TNumberId): void {
    logger.info("Unregister object from camp: %s", objectId);

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
