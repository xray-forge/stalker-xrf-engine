import { time_global } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { StoryManager } from "@/engine/core/objects/sounds/stories/StoryManager";
import { ESchemeEvent } from "@/engine/core/schemes";
import { ISchemeAnimpointState } from "@/engine/core/schemes/animpoint/ISchemeAnimpointState";
import { IAnimpointAction } from "@/engine/core/schemes/animpoint/types";
import { ISchemeMeetState } from "@/engine/core/schemes/meet";
import { MeetManager } from "@/engine/core/schemes/meet/MeetManager";
import { abort } from "@/engine/core/utils/assertion";
import { isObjectMeeting } from "@/engine/core/utils/check/check";
import { parseStringsList } from "@/engine/core/utils/ini/parse";
import { readIniString } from "@/engine/core/utils/ini/read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { emitSchemeEvent } from "@/engine/core/utils/scheme";
import {
  ClientObject,
  EScheme,
  IniFile,
  LuaArray,
  Optional,
  TCount,
  TName,
  TNumberId,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
enum EObjectRole {
  noone = 0,
  listener = 1,
  director = 2,
}

// todo: Implement as scheme.
// todo: Rename to camp story?
// todo: Move?
export class CampStoryManager {
  /**
   * todo: Description.
   */
  public static getCurrentCamp(position: Optional<Vector>): Optional<CampStoryManager> {
    if (position === null) {
      return null;
    }

    // todo: Is it too big scope to check?
    for (const [k, v] of registry.campsStories) {
      if (v.object!.inside(position)) {
        return v;
      }
    }

    return null;
  }

  /**
   * todo: Description.
   */
  public static startPlayingGuitar(object: ClientObject): void {
    const campId: Optional<TNumberId> = registry.objects.get(object.id()).registred_camp;

    if (campId === null) {
      return;
    }

    const camp: CampStoryManager = registry.campsStories.get(campId);

    camp.soundManager.setStoryTeller(camp.director);
    camp.soundManager.setStory(camp.guitarTable.get(math.random(camp.guitarTable.length())));
    camp.soundManagerStarted = true;
    camp.soundManager.update();
  }

  /**
   * todo: Description.
   */
  public static start_harmonica(object: ClientObject): void {
    const campId: Optional<TNumberId> = registry.objects.get(object.id()).registred_camp;

    if (campId === null) {
      return;
    }

    const camp: CampStoryManager = registry.campsStories.get(campId);

    camp.soundManager.setStoryTeller(camp.director);
    camp.soundManager.setStory(camp.harmonicaTable.get(math.random(camp.harmonicaTable.length())));
    camp.soundManagerStarted = true;
    camp.soundManager.update();
  }

  public object: ClientObject;
  public ini: IniFile;

  public storyTable: LuaTable<number, string>;
  public guitarTable: LuaTable<number, string>;
  public harmonicaTable: LuaTable<number, string>;

  public npc: LuaTable<number, { [index: string]: number | string; state: string }> = new LuaTable();
  public schemes: LuaTable = new LuaTable();

  public director: Optional<number> = null;
  public idleTalker: Optional<number> = null;

  public soundManagerStarted: boolean = true;
  public soundManager: StoryManager;

  public activeState: string = "idle";
  public activeStateTime: number = 0;
  public timeout: number = 0;
  public states: LuaTable<
    string,
    {
      director_state: Optional<string>;
      general_state: string;
      min_time: number;
      max_time: number;
      timeout: number;
      transitions: LuaTable<string, number>;
      precondition: (this: void, camp: CampStoryManager) => boolean;
    }
  >;

  /**
   * todo: Description.
   */
  public constructor(object: ClientObject, ini: IniFile) {
    this.object = object;
    this.ini = ini;

    const stories = readIniString(ini, "camp", "stories", false, "", "test_story");
    const guitars = readIniString(ini, "camp", "guitar_themes", false, "", "test_guitar");
    const harmonicas = readIniString(ini, "camp", "harmonica_themes", false, "", "test_harmonica");

    this.storyTable = parseStringsList(stories);
    this.guitarTable = parseStringsList(guitars);
    this.harmonicaTable = parseStringsList(harmonicas);

    this.soundManager = StoryManager.getStoryManagerForId("camp" + this.object.id());

    this.states = {
      idle: {
        director_state: null,
        general_state: "idle",
        min_time: 30000,
        max_time: 40000,
        timeout: 0,
        transitions: { harmonica: 30, guitar: 30, story: 40 },
        precondition: srCampIdlePrecondition,
      },
      harmonica: {
        director_state: "play_harmonica",
        general_state: "listen",
        min_time: 10000,
        max_time: 11000,
        timeout: 3000,
        transitions: { idle: 100, harmonica: 0, guitar: 0, story: 0 },
        precondition: srCampHarmonicaPrecondition,
      },
      guitar: {
        director_state: "play_guitar",
        general_state: "listen",
        min_time: 10000,
        max_time: 11000,
        timeout: 4500,
        transitions: { idle: 100, harmonica: 0, guitar: 0, story: 0 },
        precondition: srCampGuitarPrecondition,
      },
      story: {
        director_state: "tell",
        general_state: "listen",
        min_time: 10000,
        max_time: 11000,
        timeout: 0,
        transitions: { idle: 100, harmonica: 0, guitar: 0, story: 0 },
        precondition: srCampStoryPrecondition,
      },
    } as any;
  }

  /**
   * todo: Description.
   */
  public update(): void {
    if (!this.soundManager.isFinished()) {
      this.soundManager.update();

      return;
    }

    if (!this.soundManagerStarted) {
      return;
    }

    if (this.idleTalker !== null) {
      if (registry.sounds.generic.get(this.idleTalker) !== null) {
        return;
      } else {
        this.idleTalker = null;
      }
    }

    if (this.activeStateTime < time_global()) {
      this.setNextState();
      if (this.getDirector() === false) {
        this.activeState = "idle";
        for (const [k, v] of this.npc) {
          v.state = this.activeState;
        }
      }

      this.soundManagerStarted = false;

      for (const [id, descriptor] of this.npc) {
        if (registry.objects.get(id) !== null) {
          // todo: Optimize call.
          emitSchemeEvent(
            registry.objects.get(id).object!,
            registry.objects.get(id)[registry.objects.get(id).activeScheme!]!,
            ESchemeEvent.UPDATE
          );
        }

        const meetManager: Optional<MeetManager> = (registry.objects.get(id)[EScheme.MEET] as ISchemeMeetState)
          ?.meetManager;

        if (meetManager !== null) {
          meetManager.isCampStoryDirector = this.director === id;
        }
      }
    }

    if (this.timeout !== 0 && this.timeout <= time_global()) {
      this.setStory();
      this.timeout = 0;
    }

    if (this.activeState === "idle") {
      let npcCount: TCount = 0;
      const talkers: LuaTable<number, number> = new LuaTable();

      for (const [k, v] of this.npc) {
        npcCount = npcCount + 1;
        table.insert(talkers, k);
      }

      if (npcCount !== 0) {
        this.idleTalker = talkers.get(math.random(talkers.length()));
        GlobalSoundManager.getInstance().playSound(this.idleTalker, "state", null, null);
      }
    }
  }

  /**
   * todo: Description.
   */
  public setNextState(): void {
    const transitions = this.states.get(this.activeState).transitions;
    let rnd: number = math.random(100);

    for (const [k, v] of transitions) {
      if (rnd < v) {
        if (this.states.get(k).precondition(this)) {
          this.activeState = k;
          break;
        }
      } else {
        rnd = rnd - v;
      }
    }

    for (const [k, v] of this.npc) {
      v.state = this.activeState;
    }

    this.activeStateTime =
      time_global() +
      math.random(this.states.get(this.activeState).min_time, this.states.get(this.activeState).max_time);
    this.timeout = time_global() + this.states.get(this.activeState).timeout;
  }

  /**
   * todo: Description.
   */
  public getDirector(): Optional<boolean> {
    if (this.activeState === "idle") {
      this.director = null;

      return null;
    }

    const directors = new LuaTable();
    let objectsCount: TCount = 0;

    for (const [id, info] of this.npc) {
      objectsCount = objectsCount + 1;

      const state: IRegistryObjectState = registry.objects.get(id);

      if (state !== null) {
        const schemeState: Optional<ISchemeAnimpointState> =
          state.activeScheme && (state[state.activeScheme] as ISchemeAnimpointState);
        const object: Optional<ClientObject> = state.object;

        if (
          info[this.activeState] === EObjectRole.director &&
          schemeState !== null &&
          schemeState.actionNameBase === schemeState.description &&
          !isObjectMeeting(object)
        ) {
          table.insert(directors, id);
        }
      }
    }

    if (objectsCount === 0) {
      this.director = null;
    } else if (directors.length() < 1) {
      return false;
    } else if (directors.length() === 1) {
      this.director = directors.get(1);
    } else {
      this.director = directors.get(math.random(directors.length()));
    }

    return null;
  }

  /**
   * todo: Description.
   */
  public setStory(): void {
    if (this.activeState === "story") {
      this.soundManager.setStoryTeller(this.director);
      this.soundManager.setStory(this.storyTable.get(math.random(this.storyTable.length())));
      this.soundManagerStarted = true;
    } else if (this.activeState === "idle") {
      this.soundManagerStarted = true;
    }
  }

  /**
   * todo: Description.
   */
  public getCampAction(objectId: TNumberId): LuaMultiReturn<[Optional<string>, Optional<boolean>]> {
    if (objectId === null) {
      abort("Trying to use destroyed object!");
    }

    if (this.npc.get(objectId) === null) {
      return $multi(null, null);
    }

    return $multi(this.npc.get(objectId)!.state, this.director === objectId);
  }

  /**
   * todo: Description.
   */
  public registerNpc(objectId: TNumberId): void {
    this.npc.set(objectId, { state: this.activeState });

    const state: IRegistryObjectState = registry.objects.get(objectId);

    state.registred_camp = this.object.id();

    for (const [k, v] of this.states) {
      const role = this.getNpcRole(objectId, k);

      if (role === EObjectRole.noone) {
        abort("Wrong role for npc[%s] with id[%d] in camp [%s]!!!", "", objectId, this.object.name());
      }

      this.npc.get(objectId)[k] = role;
    }

    this.soundManager.registerObject(objectId);

    emitSchemeEvent(state.object!, state[state.activeScheme!]!, ESchemeEvent.UPDATE);
  }

  /**
   * todo: Description.
   */
  public unregisterNpc(objectId: TNumberId): void {
    if (this.director === objectId) {
      this.soundManagerStarted = false;
      this.activeStateTime = 0;
      this.director = null;

      this.activeState = "idle";
      for (const [k, v] of this.npc) {
        v.state = this.activeState;
      }
    }

    registry.objects.get(objectId).registred_camp = null;
    this.npc.delete(objectId);
    this.soundManager.unregisterObject(objectId);
  }

  /**
   * todo: Description.
   */
  public getNpcRole(objectId: TNumberId, state: TName): number {
    const schemeState: Optional<ISchemeAnimpointState> = registry.objects.get(objectId)[
      registry.objects.get(objectId).activeScheme!
    ] as ISchemeAnimpointState;

    if (schemeState === null) {
      return EObjectRole.noone;
    }

    const objectActions: LuaArray<IAnimpointAction> = schemeState.approvedActions;
    let description: Optional<TName> = schemeState.description;

    if (state === "harmonica" || state === "guitar") {
      description = description + "_" + state;

      for (const i of $range(1, objectActions.length())) {
        if (objectActions.get(i).name === description) {
          return EObjectRole.director;
        }
      }

      return EObjectRole.listener;
    } else if (state === "story") {
      for (const i of $range(1, objectActions.length())) {
        if (objectActions.get(i).name === description || objectActions.get(i).name === description + "_weapon") {
          return EObjectRole.director;
        }
      }

      return EObjectRole.listener;
    } else if (state === "idle") {
      return EObjectRole.listener;
    }

    return EObjectRole.noone;
  }
}

/**
 * todo;
 */
function srCampIdlePrecondition(camp: CampStoryManager): boolean {
  return true;
}

/**
 * todo;
 */
function srCampGuitarPrecondition(campStoryManager: CampStoryManager): boolean {
  if (campStoryManager.guitarTable.length() > 0) {
    let count: TCount = 0;

    for (const [k, v] of campStoryManager.npc) {
      count = count + 1;
    }

    if (count > 1) {
      for (const [objectId, objectInfo] of campStoryManager.npc) {
        const state: Optional<IRegistryObjectState> = registry.objects.get(objectId);
        const schemeState: Optional<ISchemeAnimpointState> = state?.activeScheme
          ? (state[state.activeScheme] as ISchemeAnimpointState)
          : null;
        const object: Optional<ClientObject> = state?.object;

        if (
          objectInfo.guitar === EObjectRole.director &&
          schemeState !== null &&
          schemeState.actionNameBase === schemeState.description &&
          object !== null &&
          !isObjectMeeting(object)
        ) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * todo;
 */
function srCampStoryPrecondition(campStoryManager: CampStoryManager): boolean {
  if (campStoryManager.storyTable.length() > 0) {
    let count: TCount = 0;

    for (const [k, v] of campStoryManager.npc) {
      const object: Optional<ClientObject> = registry.objects.get(k)?.object;

      if (object !== null && !isObjectMeeting(object)) {
        count = count + 1;
      }
    }

    // todo: Probably just return instead of full FOR?
    if (count > 1) {
      return true;
    }
  }

  return false;
}

/**
 * todo;
 */
function srCampHarmonicaPrecondition(campStoryManager: CampStoryManager): boolean {
  if (campStoryManager.harmonicaTable.length() > 0) {
    let count: TCount = 0;

    // todo: Len util.
    for (const [k, v] of campStoryManager.npc) {
      count = count + 1;
    }

    if (count > 1) {
      for (const [id, info] of campStoryManager.npc) {
        const state: Optional<IRegistryObjectState> = registry.objects.get(id);
        const schemeState: Optional<ISchemeAnimpointState> = state?.activeScheme
          ? (state[state.activeScheme!] as ISchemeAnimpointState)
          : null;
        const object: Optional<ClientObject> = state?.object;

        if (
          info.harmonica === EObjectRole.director &&
          schemeState !== null &&
          schemeState.actionNameBase === schemeState.description &&
          object !== null &&
          !isObjectMeeting(object)
        ) {
          return true;
        }
      }
    }
  }

  return false;
}
