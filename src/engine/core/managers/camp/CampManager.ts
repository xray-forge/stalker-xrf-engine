import { time_global } from "xray16";

import { IBaseSchemeState, IRegistryObjectState, registry } from "@/engine/core/database";
import { CAMP_ACTIVITIES } from "@/engine/core/managers/camp/camp_logic";
import { EObjectCampActivity, EObjectCampRole, ICampObjectState } from "@/engine/core/managers/camp/camp_types";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { soundsConfig } from "@/engine/core/managers/sounds/SoundsConfig";
import { StoryManager } from "@/engine/core/managers/sounds/stories";
import { WEAPON_POSTFIX } from "@/engine/core/objects/animation/types";
import {
  IAnimpointActionDescriptor,
  ISchemeAnimpointState,
} from "@/engine/core/schemes/stalker/animpoint/animpoint_types";
import { ISchemeMeetState } from "@/engine/core/schemes/stalker/meet";
import { MeetManager } from "@/engine/core/schemes/stalker/meet/MeetManager";
import { abort } from "@/engine/core/utils/assertion";
import { parseStringsList, readIniString } from "@/engine/core/utils/ini";
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
  /**
   * Linked camp zone client object.
   */
  public object: GameObject;
  /**
   * Ini file describing camp parameters / logic.
   */
  public ini: IniFile;

  /**
   * List of available stories in camp.
   */
  public storyTable: LuaArray<TName>;
  public guitarTable: LuaArray<TName>;
  public harmonicaTable: LuaArray<TName>;

  /**
   * List of objects registered in camp.
   */
  public objects: LuaTable<TNumberId, ICampObjectState> = new LuaTable();

  /**
   * ID of current story/action director.
   */
  public directorId: Optional<TNumberId> = null;
  public idleTalkerId: Optional<TNumberId> = null;

  public isSoundManagerStarted: boolean = true;
  public storyManager: StoryManager;

  public activity: EObjectCampActivity = EObjectCampActivity.IDLE;
  public activitySwitchAt: TTimestamp = 0;
  public activityTimeout: TDuration = 0;

  public constructor(object: GameObject, ini: IniFile) {
    this.object = object;
    this.ini = ini;

    const stories: string = readIniString(ini, "camp", "stories", false, null, "test_story");
    const guitars: string = readIniString(ini, "camp", "guitar_themes", false, null, "test_guitar");
    const harmonicas: string = readIniString(ini, "camp", "harmonica_themes", false, null, "test_harmonica");

    this.storyTable = parseStringsList(stories);
    this.guitarTable = parseStringsList(guitars);
    this.harmonicaTable = parseStringsList(harmonicas);

    this.storyManager = StoryManager.getStoryManagerForId("camp" + this.object.id());

    // logger.info("Created for:", object.name(), stories, guitars, harmonicas);
  }

  /**
   * Handle client side update tick.
   */
  public update(): void {
    // Process story telling if not finished.
    if (!this.storyManager.isFinished()) {
      return this.storyManager.update();
    }

    // Nothing to process.
    if (!this.isSoundManagerStarted) {
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
      this.setNextState();

      if (this.getDirector() === false) {
        this.activity = EObjectCampActivity.IDLE;

        for (const [, it] of this.objects) {
          it.state = this.activity;
        }
      }

      this.isSoundManagerStarted = false;

      for (const [id] of this.objects) {
        const state: Optional<IRegistryObjectState> = registry.objects.get(id) as Optional<IRegistryObjectState>;

        if (state) {
          // Emit scheme logic update.
          emitSchemeEvent(state.object, state[state.activeScheme as EScheme] as IBaseSchemeState, ESchemeEvent.UPDATE);
        }

        const meetManager: Optional<MeetManager> = (state?.[EScheme.MEET] as ISchemeMeetState)?.meetManager;

        // Mark as director to prevent object from speaking with actor.
        if (meetManager !== null) {
          meetManager.isCampStoryDirector = this.directorId === id;
        }
      }
    }

    if (this.activityTimeout !== 0 && this.activityTimeout <= now) {
      this.setStory();
      this.activityTimeout = 0;
    }

    // Set one of object to do idle talk (complain, tell something). Pick random object.
    if (this.activity === EObjectCampActivity.IDLE) {
      let objectsCount: TCount = 0;
      const talkers: LuaArray<TNumberId> = new LuaTable();

      for (const [id] of this.objects) {
        objectsCount += 1;
        table.insert(talkers, id);
      }

      if (objectsCount !== 0) {
        this.idleTalkerId = talkers.get(math.random(talkers.length()));
        GlobalSoundManager.getInstance().playSound(this.idleTalkerId, "state");
      }
    }
  }

  /**
   * todo: Description.
   */
  public setNextState(): void {
    const transitions: LuaTable<EObjectCampActivity, TProbability> = CAMP_ACTIVITIES.get(this.activity).transitions;
    let probability: TProbability = math.random(100);

    for (const [activity, chance] of transitions) {
      if (probability < chance) {
        if (CAMP_ACTIVITIES.get(activity).precondition(this)) {
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
      now + math.random(CAMP_ACTIVITIES.get(this.activity).minTime, CAMP_ACTIVITIES.get(this.activity).maxTime);
    this.activityTimeout = now + CAMP_ACTIVITIES.get(this.activity).timeout;

    // logger.info("Set camp next state:", probability, this.activity, "| switch at:", this.activitySwitchAt);
  }

  /**
   * todo: Description.
   */
  public getDirector(): Optional<boolean> {
    if (this.activity === EObjectCampActivity.IDLE) {
      this.directorId = null;

      return null;
    }

    const directors = new LuaTable();
    let objectsCount: TCount = 0;

    for (const [id, info] of this.objects) {
      objectsCount = objectsCount + 1;

      const state: Optional<IRegistryObjectState> = registry.objects.get(id);

      if (state !== null) {
        const schemeState: Optional<ISchemeAnimpointState> =
          state.activeScheme && (state[state.activeScheme] as ISchemeAnimpointState);
        const object: Optional<GameObject> = state.object;

        if (
          info[this.activity] === EObjectCampRole.DIRECTOR &&
          schemeState !== null &&
          schemeState.actionNameBase === schemeState.description &&
          !isObjectMeeting(object)
        ) {
          table.insert(directors, id);
        }
      }
    }

    if (objectsCount === 0) {
      this.directorId = null;
    } else if (directors.length() < 1) {
      return false;
    } else if (directors.length() === 1) {
      this.directorId = directors.get(1);
    } else {
      this.directorId = directors.get(math.random(directors.length()));
    }

    return null;
  }

  /**
   * todo: Description.
   */
  public setStory(): void {
    if (this.activity === EObjectCampActivity.STORY) {
      this.storyManager.setStoryTeller(this.directorId);
      this.storyManager.setActiveId(this.storyTable.get(math.random(this.storyTable.length())));
      this.isSoundManagerStarted = true;
    } else if (this.activity === EObjectCampActivity.IDLE) {
      this.isSoundManagerStarted = true;
    }
  }

  /**
   * todo: Description.
   *
   * @param objectId - target object id to check and get action / state
   * @returns tuple with action name and whether object is director
   */
  public getCampAction(objectId: TNumberId): LuaMultiReturn<[Optional<EObjectCampActivity>, Optional<boolean>]> {
    if (this.objects.get(objectId) === null) {
      // Not participating in stories.
      return $multi(null, null);
    } else {
      return $multi(this.objects.get(objectId)!.state, this.directorId === objectId);
    }
  }

  /**
   * Register object in camp.
   *
   * @param objectId - target object id to register
   */
  public registerObject(objectId: TNumberId): void {
    logger.info("Register object in camp:", objectId);

    this.objects.set(objectId, { state: this.activity } as ICampObjectState);

    const state: IRegistryObjectState = registry.objects.get(objectId);

    state.camp = this.object.id();

    for (const [activity] of CAMP_ACTIVITIES) {
      const role: EObjectCampRole = this.getObjectRole(objectId, activity);

      if (role === EObjectCampRole.NONE) {
        abort("Wrong role for object '%d' in camp '['%s', activity '%s'.", "", objectId, this.object.name(), activity);
      }

      this.objects.get(objectId)[activity] = role;
    }

    this.storyManager.registerObject(objectId);

    emitSchemeEvent(state.object!, state[state.activeScheme!]!, ESchemeEvent.UPDATE);
  }

  /**
   * Unregister object from camp.
   *
   * @param objectId - target object id to unregister
   */
  public unregisterObject(objectId: TNumberId): void {
    logger.info("Unregister object from camp:", objectId);

    if (this.directorId === objectId) {
      this.isSoundManagerStarted = false;
      this.activitySwitchAt = 0;
      this.directorId = null;

      this.activity = EObjectCampActivity.IDLE;
      for (const [k, v] of this.objects) {
        v.state = this.activity;
      }
    }

    registry.objects.get(objectId).camp = null;
    this.objects.delete(objectId);
    this.storyManager.unregisterObject(objectId);
  }

  /**
   * Get object role based on id/state for current camp activity.
   *
   * @param objectId - target game object id
   * @param activity - camp activity name to check role for
   * @returns whether object animpoint state is correct and what role can be used for it
   */
  public getObjectRole(objectId: TNumberId, activity: EObjectCampActivity): EObjectCampRole {
    const schemeState: Optional<ISchemeAnimpointState> = registry.objects.get(objectId)[
      registry.objects.get(objectId).activeScheme!
    ] as ISchemeAnimpointState;

    // Object is not captured in animation state scheme (sitting / laying / telling etc).
    if (schemeState === null) {
      return EObjectCampRole.NONE;
    }

    const objectActions: LuaArray<IAnimpointActionDescriptor> = schemeState.approvedActions;
    let stalkerState: Optional<TName> = schemeState.description as TName;

    switch (activity) {
      case EObjectCampActivity.HARMONICA:
      case EObjectCampActivity.GUITAR:
        stalkerState = stalkerState + "_" + activity;

        for (const it of $range(1, objectActions.length())) {
          if (objectActions.get(it).name === stalkerState) {
            return EObjectCampRole.DIRECTOR;
          }
        }

        return EObjectCampRole.LISTENER;

      case EObjectCampActivity.STORY:
        for (const it of $range(1, objectActions.length())) {
          const actionName: TName = objectActions.get(it).name;

          if (actionName === stalkerState || actionName === stalkerState + WEAPON_POSTFIX) {
            return EObjectCampRole.DIRECTOR;
          }
        }

        return EObjectCampRole.LISTENER;

      case EObjectCampActivity.IDLE:
        return EObjectCampRole.LISTENER;

      default:
        return EObjectCampRole.NONE;
    }
  }
}
