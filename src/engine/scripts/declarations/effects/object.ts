import { alife, hit, level, patrol } from "xray16";

import {
  getObjectByStoryId,
  getObjectIdByStoryId,
  getServerObjectByStoryId,
  IRegistryObjectState,
  registry,
  SYSTEM_INI,
  unregisterHelicopterObject,
} from "@/engine/core/database";
import { SimulationBoardManager } from "@/engine/core/managers/interaction/SimulationBoardManager";
import { SmartTerrain, Squad, updateStalkerLogic } from "@/engine/core/objects";
import { SchemeAbuse } from "@/engine/core/schemes/abuse";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/base/utils";
import { ISchemeCombatState } from "@/engine/core/schemes/combat";
import { ISchemeCombatIgnoreState } from "@/engine/core/schemes/combat_ignore";
import { ISchemeMobCombatState } from "@/engine/core/schemes/mob/combat";
import { initTarget } from "@/engine/core/schemes/remark/actions";
import { abort, assertDefined } from "@/engine/core/utils/assertion";
import { extern } from "@/engine/core/utils/binding";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { parseConditionsList } from "@/engine/core/utils/ini/parse";
import { readIniString } from "@/engine/core/utils/ini/read";
import { IConfigSwitchCondition } from "@/engine/core/utils/ini/types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectSmartTerrain } from "@/engine/core/utils/object/object_general";
import {
  releaseObject,
  spawnItemsForObject,
  spawnObject,
  spawnObjectInObject,
  spawnSquadInSmart,
} from "@/engine/core/utils/spawn";
import { createVector, subVectors } from "@/engine/core/utils/vector";
import { FALSE, TRUE } from "@/engine/lib/constants/words";
import {
  ActionPlanner,
  ClientObject,
  EScheme,
  Hit,
  LuaArray,
  Optional,
  Patrol,
  ServerCreatureObject,
  ServerHumanObject,
  TBloodsuckerVisibilityState,
  TCount,
  TIndex,
  TName,
  TNumberId,
  TRate,
  TSection,
  TStringId,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
extern("xr_effects.anim_obj_forward", (actor: ClientObject, npc: ClientObject, p: LuaArray<string>): void => {
  for (const [k, v] of p) {
    if (v !== null) {
      registry.doors.get(v).forwardAnimation();
    }
  }
});

/**
 * todo;
 */
extern("xr_effects.anim_obj_backward", (actor: ClientObject, npc: ClientObject, p: [string]): void => {
  if (p[0] !== null) {
    registry.doors.get(p[0]).backwardAnimation();
  }
});

/**
 * todo;
 */
extern("xr_effects.anim_obj_stop", (actor: ClientObject, npc: ClientObject, p: [string]): void => {
  if (p[0] !== null) {
    registry.doors.get(p[0]).stopAnimation();
  }
});

/**
 * todo;
 */
extern(
  "xr_effects.hit_obj",
  (actor: ClientObject, npc: ClientObject, params: [string, string, number, number, string, string]) => {
    logger.info("Hit obj");

    const h: hit = new hit();
    const object: Optional<ClientObject> = getObjectByStoryId(params[0]);

    if (!object) {
      return;
    }

    h.bone(params[1]);
    h.power = params[2];
    h.impulse = params[3];

    if (params[4]) {
      h.direction = subVectors(new patrol(params[4]).point(0), object.position());
    } else {
      h.direction = subVectors(npc.position(), object.position());
    }

    h.draftsman = npc;
    h.type = hit.wound;
    object.hit(h);
  }
);

/**
 * todo;
 */
extern("xr_effects.hit_npc_from_actor", (actor: ClientObject, npc: ClientObject, p: [Optional<TStringId>]): void => {
  const h: hit = new hit();
  let storyObject: Optional<ClientObject> = null;

  h.draftsman = actor;
  h.type = hit.wound;

  if (p[0]) {
    storyObject = getObjectByStoryId(p[0]);

    if (storyObject) {
      h.direction = actor.position().sub(storyObject.position());
    }

    if (!storyObject) {
      h.direction = actor.position().sub(npc.position());
    }
  } else {
    h.direction = actor.position().sub(npc.position());
    storyObject = npc;
  }

  h.bone("bip01_spine");
  h.power = 0.001;
  h.impulse = 0.001;

  storyObject!.hit(h);
});

/**
 * todo;
 */
extern("xr_effects.make_enemy", (actor: ClientObject, npc: ClientObject, p: [string, string]) => {
  if (p === null) {
    abort("Invalid parameter in function 'hit_npc_from_npc'!!!!");
  }

  const h: Hit = new hit();
  let objectToHit: ClientObject = npc;

  h.draftsman = getObjectByStoryId(p[0]);

  if (p[1] !== null) {
    objectToHit = getObjectByStoryId(p[1])!;
  }

  h.type = hit.wound;
  h.direction = h.draftsman!.position().sub(objectToHit.position());
  h.bone("bip01_spine");
  h.power = 0.03;
  h.impulse = 0.03;
  objectToHit.hit(h);
});

/**
 * todo;
 */
extern("xr_effects.sniper_fire_mode", (actor: ClientObject, npc: ClientObject, p: [string]): void => {
  if (p[0] === TRUE) {
    npc.sniper_fire_mode(true);
  } else {
    npc.sniper_fire_mode(false);
  }
});

/**
 * todo;
 */
extern("xr_effects.kill_npc", (actor: ClientObject, npc: Optional<ClientObject>, p: [Optional<TStringId>]) => {
  if (p && p[0]) {
    npc = getObjectByStoryId(p[0]);
  }

  if (npc !== null && npc.alive()) {
    npc.kill(npc);
  }
});

/**
 * todo;
 */
extern("xr_effects.remove_npc", (actor: ClientObject, npc: ClientObject, p: [Optional<TStringId>]) => {
  let objectId: Optional<TNumberId> = null;

  if (p && p[0]) {
    objectId = getObjectIdByStoryId(p[0]);
  }

  if (objectId !== null) {
    alife().release(alife().object(objectId), true);
  }
});

/**
 * todo;
 */
extern("xr_effects.clearAbuse", (object: ClientObject) => {
  SchemeAbuse.clearAbuse(object);
});

/**
 * todo;
 */
extern("xr_effects.disable_combat_handler", (actor: ClientObject, npc: ClientObject): void => {
  const state: IRegistryObjectState = registry.objects.get(npc.id());

  if (state[EScheme.COMBAT]) {
    (state[EScheme.COMBAT] as ISchemeCombatState).enabled = false;
  }

  if (state[EScheme.MOB_COMBAT]) {
    (state[EScheme.MOB_COMBAT] as ISchemeMobCombatState).enabled = false;
  }
});

/**
 * todo;
 */
extern("xr_effects.disable_combat_ignore_handler", (actor: ClientObject, npc: ClientObject): void => {
  const state: IRegistryObjectState = registry.objects.get(npc.id());

  if (state[EScheme.COMBAT_IGNORE]) {
    (state[EScheme.COMBAT_IGNORE] as ISchemeCombatIgnoreState).enabled = false;
  }
});

/**
 * todo;
 */
extern(
  "xr_effects.spawn_object",
  (
    actor: ClientObject,
    object: Optional<ClientObject>,
    [section, pathName, index, yaw]: [TSection, TName, TIndex, TRate]
  ): void => {
    logger.info("Spawn object");
    spawnObject(section, pathName, index, yaw);
  }
);

/**
 * Effect to spawn object in provided story id.
 */
extern(
  "xr_effects.spawn_object_in",
  (actor: ClientObject, object: ClientObject, [section, storyId]: [TSection, TStringId]): void => {
    spawnObjectInObject(section, getObjectIdByStoryId(storyId));
  }
);

/**
 * todo;
 */
extern("xr_effects.spawn_corpse", (actor: ClientObject, obj: ClientObject, params: [string, string, number]): void => {
  logger.info("Spawn corpse:", params[0]);

  const spawnSection: TSection = params[0];

  if (spawnSection === null) {
    abort("Wrong spawn section for 'spawn_corpse' function %s. For object %s", tostring(spawnSection), obj.name());
  }

  const pathName: Optional<TName> = params[1];

  if (pathName === null) {
    abort("Wrong path_name for 'spawn_corpse' function %s. For object %s", tostring(pathName), obj.name());
  }

  if (!level.patrol_path_exists(pathName)) {
    abort("Path %s doesnt exist. Function 'spawn_corpse' for object %s ", tostring(pathName), obj.name());
  }

  const patrolObject: patrol = new patrol(pathName);
  const index: TIndex = params[2] || 0;

  const serverObject: ServerCreatureObject = alife().create(
    spawnSection,
    patrolObject.point(index),
    patrolObject.level_vertex_id(0),
    patrolObject.game_vertex_id(0)
  );

  serverObject.kill();
});

/**
 * todo;
 */
extern(
  "xr_effects.destroy_object",
  (actor: ClientObject, object: ClientObject, p: [string, string, Optional<string>]): void => {
    if (p === null) {
      releaseObject(object.id());
    } else {
      if (p[0] === null || p[1] === null) {
        abort("Wrong parameters in destroy_object function.");
      }

      const targetString = p[2] !== null ? [0] + "|" + p[1] + "," + p[2] : p[0] + "|" + p[1];
      const [targetPosition, targetId, targetInit] = initTarget(object, targetString);

      if (targetId === null) {
        logger.info(
          "You are trying to set non-existant target [%s] for object [%s] in section [%s]:",
          targetString,
          targetId,
          registry.objects.get(object.id()).active_section
        );
      }

      releaseObject(targetId as TNumberId);
    }
  }
);

/**
 * todo;
 */
extern(
  "xr_effects.create_squad",
  (actor: ClientObject, obj: Optional<ClientObject>, params: [TStringId, TName]): void => {
    spawnSquadInSmart(params[0], params[1]);
  }
);

/**
 * todo;
 */
extern(
  "xr_effects.create_squad_member",
  (actor: ClientObject, object: ClientObject, params: [TSection, TStringId, string]): void => {
    const squadMemberSection: TSection = params[0];
    const storyId: Optional<TStringId> = params[1];

    let position: Optional<Vector> = null;
    let levelVertexId: Optional<TNumberId> = null;
    let gameVertexId: Optional<TNumberId> = null;

    if (storyId === null) {
      abort("Wrong squad identificator [NIL] in 'create_squad_member' function");
    }

    const simulationBoardManager: SimulationBoardManager = SimulationBoardManager.getInstance();
    const squad: Squad = getServerObjectByStoryId(storyId) as Squad;
    const squadSmartTerrain: Optional<SmartTerrain> = simulationBoardManager.getSmartTerrainDescriptorById(
      squad.assignedSmartTerrainId as TNumberId
    )!.smartTerrain;

    if (params[2] !== null) {
      let spawnPoint: TStringId;

      if (params[2] === "simulation_point") {
        const data: string = readIniString(SYSTEM_INI, squad.section_name(), "spawn_point", false, "");
        const condlist: LuaArray<IConfigSwitchCondition> =
          data === "" || data === null
            ? parseConditionsList(squadSmartTerrain.spawnPointName as string)
            : parseConditionsList(data);

        spawnPoint = pickSectionFromCondList(actor, object, condlist) as TStringId;
      } else {
        spawnPoint = params[2];
      }

      const point: Patrol = new patrol(spawnPoint);

      position = point.point(0);
      levelVertexId = point.level_vertex_id(0);
      gameVertexId = point.game_vertex_id(0);
    } else {
      const commander: ServerHumanObject = alife().object(squad.commander_id()) as ServerHumanObject;

      position = commander.position;
      levelVertexId = commander.m_level_vertex_id;
      gameVertexId = commander.m_game_vertex_id;
    }

    const newSquadMemberId: TNumberId = squad.addSquadMember(squadMemberSection, position, levelVertexId, gameVertexId);

    squad.assignSquadMemberToSmartTerrain(newSquadMemberId, squadSmartTerrain, null);
    simulationBoardManager.setupObjectSquadAndGroup(alife().object(newSquadMemberId) as ServerCreatureObject);
    // --squad_smart.refresh()
    squad.update();
  }
);

/**
 * todo;
 */
extern("xr_effects.remove_squad", (actor: ClientObject, obj: ClientObject, p: [string]): void => {
  const storyId: Optional<TSection> = p[0];

  if (storyId === null) {
    abort("Wrong squad identificator [NIL] in remove_squad function");
  }

  const squad: Optional<Squad> = getServerObjectByStoryId(storyId);

  if (squad === null) {
    abort("Wrong squad identificator [%s]. squad doesnt exist", tostring(storyId));
  }

  SimulationBoardManager.getInstance().onRemoveSquad(squad);
});

/**
 * todo;
 */
extern("xr_effects.kill_squad", (actor: ClientObject, obj: ClientObject, p: [Optional<TStringId>]): void => {
  const storyId: Optional<TStringId> = p[0];

  if (storyId === null) {
    abort("Wrong squad identificator [NIL] in kill_squad function");
  }

  const squad: Optional<Squad> = getServerObjectByStoryId(storyId);

  if (squad === null) {
    return;
  }

  const squadObjects: LuaTable<TNumberId, boolean> = new LuaTable();

  for (const k of squad.squad_members()) {
    squadObjects.set(k.id, true);
  }

  for (const [k, v] of squadObjects) {
    const clientObject: Optional<ClientObject> = registry.objects.get(k)?.object;

    if (clientObject === null) {
      alife().object<ServerHumanObject>(tonumber(k)!)!.kill();
    } else {
      clientObject.kill(clientObject);
    }
  }
});

/**
 * todo;
 */
extern("xr_effects.heal_squad", (actor: ClientObject, obj: ClientObject, params: [TStringId, number]) => {
  const storyId: Optional<TStringId> = params[0];
  let healthMod: TRate = 1;

  if (params[1] && params[1] !== null) {
    healthMod = math.ceil(params[1] / 100);
  }

  if (storyId === null) {
    abort("Wrong squad identificator [NIL] in heal_squad function");
  }

  const squad: Optional<Squad> = getServerObjectByStoryId(storyId);

  if (squad === null) {
    return;
  }

  for (const k of squad.squad_members()) {
    const clientObject: Optional<ClientObject> = registry.objects.get(k.id)?.object as Optional<ClientObject>;

    if (clientObject !== null) {
      clientObject.health = healthMod;
    }
  }
});

/**
 * todo;
 */
extern("xr_effects.clear_smart_terrain", (actor: ClientObject, object: ClientObject, p: [string, string]) => {
  logger.info("Clear smart terrain");

  const smartTerrainname: TName = p[0];

  if (smartTerrainname === null) {
    abort("Wrong squad identificator [NIL] in clear_smart_terrain function");
  }

  const simulationBoardManager: SimulationBoardManager = SimulationBoardManager.getInstance();
  const smartTerrain: SmartTerrain = simulationBoardManager.getSmartTerrainByName(smartTerrainname) as SmartTerrain;
  const smartTerrainId: TNumberId = smartTerrain.id;

  for (const [k, v] of simulationBoardManager.getSmartTerrainDescriptorById(smartTerrainId)!.assignedSquads) {
    if (p[1] && p[1] === FALSE) {
      // todo: Probably unreachable condition / cast
      if (!getObjectIdByStoryId(v.id as unknown as string)) {
        simulationBoardManager.exitSmartTerrain(v, smartTerrainId);
        simulationBoardManager.onRemoveSquad(v);
      }
    } else {
      simulationBoardManager.exitSmartTerrain(v, smartTerrainId);
      simulationBoardManager.onRemoveSquad(v);
    }
  }
});

/**
 * todo;
 */
extern("xr_effects.update_npc_logic", (actor: ClientObject, npc: ClientObject, params: LuaArray<TStringId>): void => {
  for (const [index, storyId] of params) {
    const object: Optional<ClientObject> = getObjectByStoryId(storyId);

    if (object !== null) {
      updateStalkerLogic(object);

      const planner: ActionPlanner = object.motivation_action_manager();

      planner.update();
      planner.update();
      planner.update();

      const state: IRegistryObjectState = registry.objects.get(object.id());

      // todo: Is it ok? Why?
      state.stateManager!.update();
      state.stateManager!.update();
      state.stateManager!.update();
      state.stateManager!.update();
      state.stateManager!.update();
      state.stateManager!.update();
      state.stateManager!.update();
    }
  }
});

/**
 * todo;
 */
extern("xr_effects.update_obj_logic", (actor: ClientObject, npc: ClientObject, params: LuaArray<TStringId>): void => {
  for (const [index, storyId] of params) {
    const object: Optional<ClientObject> = getObjectByStoryId(storyId);

    if (object !== null) {
      logger.info("Update object logic:", object.id());

      const state: IRegistryObjectState = registry.objects.get(object.id());

      trySwitchToAnotherSection(object, state[state.active_scheme!]!, actor);
    }
  }
});

/**
 * todo;
 */
extern(
  "xr_effects.hit_npc",
  (actor: ClientObject, npc: ClientObject, params: [string, string, string, number, number, string]): void => {
    logger.info("Hit npc");

    const targetHit: Hit = new hit();
    const rev: boolean = params[5] ? params[5] === TRUE : false;

    targetHit.draftsman = npc;
    targetHit.type = hit.wound;
    if (params[0] !== "self") {
      const hitter: Optional<ClientObject> = getObjectByStoryId(params[0]);

      if (!hitter) {
        return;
      }

      if (rev) {
        targetHit.draftsman = hitter;
        targetHit.direction = hitter.position().sub(npc.position());
      } else {
        targetHit.direction = npc.position().sub(hitter.position());
      }
    } else {
      if (rev) {
        targetHit.draftsman = null;
        targetHit.direction = npc.position().sub(new patrol(params[1]).point(0));
      } else {
        targetHit.direction = new patrol(params[1]).point(0).sub(npc.position());
      }
    }

    targetHit.bone(params[2]);
    targetHit.power = params[3];
    targetHit.impulse = params[4];

    npc.hit(targetHit);
  }
);

/**
 * todo;
 */
extern("xr_effects.restore_health", (actor: ClientObject, npc: ClientObject): void => {
  npc.health = 1;
});

/**
 * todo;
 */
extern(
  "xr_effects.force_obj",
  (actor: ClientObject, npc: ClientObject, p: [string, Optional<number>, Optional<number>]) => {
    logger.info("Force object");

    const object: Optional<ClientObject> = getObjectByStoryId(p[0]);

    if (!object) {
      abort("'force_obj' Target object does ! exist");
    }

    if (p[1] === null) {
      p[1] = 20;
    }

    if (p[2] === null) {
      p[2] = 100;
    }

    object.set_const_force(createVector(0, 1, 0), p[1], p[2]);
  }
);

/**
 * todo;
 */
extern("xr_effects.burer_force_gravi_attack", (actor: ClientObject, object: ClientObject): void => {
  object.burer_set_force_gravi_attack(true);
});

/**
 * todo;
 */
extern("xr_effects.burer_force_anti_aim", (actor: ClientObject, object: ClientObject): void => {
  object.set_force_anti_aim(true);
});

/**
 * Give list of items to an object.
 */
extern("xr_effects.give_items", (actor: ClientObject, object: ClientObject, params: Array<TSection>): void => {
  for (const section of params) {
    logger.info("Give item to object:", object.id(), section);
    spawnItemsForObject(object, section);
  }
});

/**
 * Give specific item to an object by story id.
 */
extern(
  "xr_effects.give_item",
  (
    actor: ClientObject,
    object: Optional<ClientObject> | ServerHumanObject,
    [section, objectStoryId]: [TSection, Optional<TStringId>]
  ): void => {
    const objectId: TNumberId =
      objectStoryId === null ? (object as ClientObject).id() : (getObjectIdByStoryId(objectStoryId) as TNumberId);

    logger.info("Give item to object:", objectId, section);

    spawnItemsForObject(alife().object(objectId)!, section);
  }
);

/**
 * todo;
 */
extern("xr_effects.disable_memory_object", (actor: ClientObject, object: ClientObject): void => {
  const bestEnemy: Optional<ClientObject> = object.best_enemy();

  if (bestEnemy) {
    object.enable_memory_object(bestEnemy, false);
  }
});

/**
 * todo;
 */
extern("xr_effects.set_force_sleep_animation", (actor: ClientObject, object: ClientObject, p: [number]) => {
  object.force_stand_sleep_animation(tonumber(p[0])!);
});

/**
 * todo;
 */
extern("xr_effects.release_force_sleep_animation", (actor: ClientObject, object: ClientObject): void => {
  object.release_stand_sleep_animation();
});

/**
 * todo;
 */
extern("xr_effects.set_visual_memory_enabled", (actor: ClientObject, object: ClientObject, p: [number]): void => {
  if (p && p[0] && tonumber(p[0])! >= 0 && tonumber(p[0])! <= 1) {
    object.set_visual_memory_enabled(tonumber(p[0]) === 1);
  }
});

/**
 * todo;
 */
extern("xr_effects.set_monster_animation", (actor: ClientObject, object: ClientObject, p: [string]) => {
  if (!(p && p[0])) {
    abort("Wrong parameters in function 'set_monster_animation'!!!");
  }

  object.set_override_animation(p[0]);
});

/**
 * todo;
 */
extern("xr_effects.clear_monster_animation", (actor: ClientObject, object: ClientObject): void => {
  object.clear_override_animation();
});

/**
 * todo;
 */
extern("xr_effects.switch_to_desired_job", (actor: ClientObject, object: ClientObject): void => {
  (getObjectSmartTerrain(object) as SmartTerrain).switch_to_desired_job(object);
});

/**
 * todo;
 */
extern("xr_effects.spawn_item_to_npc", (actor: ClientObject, npc: ClientObject, p: [Optional<string>]): void => {
  const newItem: Optional<TSection> = p[0];

  if (newItem) {
    alife().create(newItem, npc.position(), npc.level_vertex_id(), npc.game_vertex_id(), npc.id());
  }
});

/**
 * todo;
 */
extern("xr_effects.give_money_to_npc", (actor: ClientObject, npc: ClientObject, p: [Optional<number>]): void => {
  const money: Optional<TCount> = p[0];

  if (money) {
    npc.give_money(money);
  }
});

/**
 * todo;
 */
extern("xr_effects.seize_money_to_npc", (actor: ClientObject, npc: ClientObject, p: [Optional<number>]): void => {
  const money: Optional<TCount> = p[0];

  if (money) {
    npc.give_money(-money);
  }
});

/**
 * todo;
 */
extern("xr_effects.heli_start_flame", (actor: ClientObject, npc: ClientObject): void => {
  npc.get_helicopter().StartFlame();
});

/**
 * todo;
 */
extern("xr_effects.heli_die", (actor: ClientObject, object: ClientObject): void => {
  object.get_helicopter().Die();
  unregisterHelicopterObject(object);
});

/**
 * todo;
 */
extern("xr_effects.set_bloodsucker_state", (actor: ClientObject, object: ClientObject, p: [string, string]): void => {
  if ((p && p[0]) === null) {
    abort("Wrong parameters in function 'set_bloodsucker_state'!!!");
  }

  let state: string = p[0];

  if (p[1] !== null) {
    state = p[1];
    object = getObjectByStoryId(p[1]) as ClientObject;
  }

  if (object !== null) {
    if (state === "default") {
      object.force_visibility_state(-1);
    } else {
      object.force_visibility_state(tonumber(state) as TBloodsuckerVisibilityState);
    }
  }
});

/**
 * todo;
 */
extern("xr_effects.clear_box", (actor: ClientObject, npc: ClientObject, p: [string]) => {
  logger.info("Clear box");

  if ((p && p[0]) === null) {
    abort("Wrong parameters in function 'clear_box'!!!");
  }

  const inventoryBox: Optional<ClientObject> = getObjectByStoryId(p[0]);

  assertDefined(inventoryBox, "There is no object with story_id [%s]", tostring(p[0]));

  const itemsList: LuaArray<ClientObject> = new LuaTable();

  inventoryBox.iterate_inventory_box((box: ClientObject, item: ClientObject) => {
    table.insert(itemsList, item);
  }, inventoryBox);

  for (const [k, v] of itemsList) {
    alife().release(alife().object(v.id()), true);
  }
});

/**
 * todo;
 */
extern("xr_effects.polter_actor_ignore", (actor: ClientObject, npc: ClientObject, [ignore]: [string]) => {
  if (ignore === TRUE) {
    npc.poltergeist_set_actor_ignore(true);
  } else if (ignore === FALSE) {
    npc.poltergeist_set_actor_ignore(false);
  }
});
