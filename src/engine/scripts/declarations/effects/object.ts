import { hit, level, patrol } from "xray16";

import {
  getObjectByStoryId,
  getObjectIdByStoryId,
  getServerObjectByStoryId,
  getStoryIdByObjectId,
  IBaseSchemeState,
  IRegistryObjectState,
  registry,
  SYSTEM_INI,
  unregisterHelicopterObject,
} from "@/engine/core/database";
import { SimulationBoardManager } from "@/engine/core/managers/simulation/SimulationBoardManager";
import { updateStalkerLogic } from "@/engine/core/objects/binders/creature/StalkerBinder";
import type { SmartTerrain } from "@/engine/core/objects/server/smart_terrain";
import type { Squad } from "@/engine/core/objects/server/squad";
import { ISchemeMobCombatState } from "@/engine/core/schemes/monster/mob_combat";
import { ISchemeCombatState } from "@/engine/core/schemes/stalker/combat";
import { ISchemeCombatIgnoreState } from "@/engine/core/schemes/stalker/combat_ignore";
import { initTarget } from "@/engine/core/schemes/stalker/remark/actions";
import { abort, assert, assertDefined } from "@/engine/core/utils/assertion";
import { extern } from "@/engine/core/utils/binding";
import {
  IConfigSwitchCondition,
  parseConditionsList,
  pickSectionFromCondList,
  readIniString,
} from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectSmartTerrain } from "@/engine/core/utils/object";
import { clearObjectAbuse } from "@/engine/core/utils/object/object_meeting";
import {
  releaseObject,
  spawnItemsForObject,
  spawnObject,
  spawnObjectInObject,
  spawnSquadInSmart,
} from "@/engine/core/utils/object/object_spawn";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/scheme_switch";
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
extern("xr_effects.anim_obj_forward", (actor: ClientObject, object: ClientObject, p: LuaArray<string>): void => {
  for (const [k, v] of p) {
    if (v !== null) {
      registry.doors.get(v).forwardAnimation();
    }
  }
});

/**
 * todo;
 */
extern("xr_effects.anim_obj_backward", (actor: ClientObject, object: ClientObject, p: [string]): void => {
  if (p[0] !== null) {
    registry.doors.get(p[0]).backwardAnimation();
  }
});

/**
 * todo;
 */
extern("xr_effects.anim_obj_stop", (actor: ClientObject, object: ClientObject, p: [string]): void => {
  if (p[0] !== null) {
    registry.doors.get(p[0]).stopAnimation();
  }
});

/**
 * todo;
 */
extern(
  "xr_effects.hit_obj",
  (actor: ClientObject, object: ClientObject, params: [string, string, number, number, string, string]): void => {
    const h: hit = new hit();
    const storyObject: Optional<ClientObject> = getObjectByStoryId(params[0]);

    if (!storyObject) {
      return;
    }

    logger.info("Hit object:", object.name(), storyObject.name());

    h.bone(params[1]);
    h.power = params[2];
    h.impulse = params[3];

    if (params[4]) {
      h.direction = subVectors(new patrol(params[4]).point(0), storyObject.position());
    } else {
      h.direction = subVectors(object.position(), storyObject.position());
    }

    h.draftsman = object;
    h.type = hit.wound;
    storyObject.hit(h);
  }
);

/**
 * Hit target from name of actor.
 * Usually used to become enemies based on hit.
 */
extern(
  "xr_effects.hit_npc_from_actor",
  (actor: ClientObject, object: ClientObject, [storyId]: [Optional<TStringId>] = [null]): void => {
    const hitObject: Hit = new hit();
    const target: ClientObject = storyId ? (getObjectByStoryId(storyId) as ClientObject) : object;

    hitObject.direction = actor.position().sub(target.position());
    hitObject.draftsman = actor;
    hitObject.type = hit.wound;
    hitObject.power = 0.001;
    hitObject.impulse = 0.001;
    hitObject.bone("bip01_spine");

    target.hit(hitObject);
  }
);

/**
 * Make objects enemies.
 * Hit object or second parameter story ID from name of first story ID parameter.
 */
extern(
  "xr_effects.make_enemy",
  (actor: ClientObject, object: ClientObject, parameters: [TStringId, Optional<TStringId>]): void => {
    assert(parameters, "Invalid parameter in function 'hit_npc_from_npc'.");

    const [from, to] = parameters;

    const target: ClientObject = to ? (getObjectByStoryId(to) as ClientObject) : object;
    const hitObject: Hit = new hit();

    hitObject.draftsman = getObjectByStoryId(from);

    hitObject.type = hit.wound;
    hitObject.direction = hitObject.draftsman!.position().sub(target.position());
    hitObject.bone("bip01_spine");
    hitObject.power = 0.03;
    hitObject.impulse = 0.03;

    target.hit(hitObject);
  }
);

/**
 * Set sniper fire mode for an object.
 */
extern("xr_effects.sniper_fire_mode", (actor: ClientObject, object: ClientObject, parameters: [string]): void => {
  object.sniper_fire_mode(parameters[0] === TRUE);
});

/**
 * todo;
 */
extern("xr_effects.kill_npc", (actor: ClientObject, object: Optional<ClientObject>, p: [Optional<TStringId>]): void => {
  if (p && p[0]) {
    object = getObjectByStoryId(p[0]);
  }

  if (object !== null && object.alive()) {
    object.kill(object);
  }
});

/**
 * todo;
 */
extern("xr_effects.remove_npc", (actor: ClientObject, object: ClientObject, p: [Optional<TStringId>]): void => {
  let objectId: Optional<TNumberId> = null;

  if (p && p[0]) {
    objectId = getObjectIdByStoryId(p[0]);
  }

  if (objectId !== null) {
    registry.simulator.release(registry.simulator.object(objectId), true);
  }
});

/**
 * Clear abuse for provided object.
 */
extern("xr_effects.clear_abuse", (actor: ClientObject, object: ClientObject): void => {
  clearObjectAbuse(object);
});

/**
 * todo;
 */
extern("xr_effects.disable_combat_handler", (actor: ClientObject, object: ClientObject): void => {
  const state: IRegistryObjectState = registry.objects.get(object.id());

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
extern("xr_effects.disable_combat_ignore_handler", (actor: ClientObject, object: ClientObject): void => {
  const state: IRegistryObjectState = registry.objects.get(object.id());

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
 * Spawn corpse of provided section.
 * Spawn location is based on provided patrol name and patrol index.
 */
extern(
  "xr_effects.spawn_corpse",
  (
    actor: ClientObject,
    object: ClientObject,
    [spawnSection, pathName, index]: [TSection, TName, Optional<TIndex>]
  ): void => {
    // logger.info("Spawn corpse:", params[0]);

    if (spawnSection === null) {
      abort("Wrong spawn section for 'spawn_corpse' function %s. For object %s", tostring(spawnSection), object.name());
    }

    if (pathName === null) {
      abort("Wrong path_name for 'spawn_corpse' function %s. For object %s", tostring(pathName), object.name());
    }

    if (!level.patrol_path_exists(pathName)) {
      abort("Path %s doesnt exist. Function 'spawn_corpse' for object %s ", tostring(pathName), object.name());
    }

    const patrolObject: patrol = new patrol(pathName);

    const serverObject: ServerCreatureObject = registry.simulator.create(
      spawnSection,
      patrolObject.point(index ?? 0),
      patrolObject.level_vertex_id(0),
      patrolObject.game_vertex_id(0)
    );

    serverObject.kill();
  }
);

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
          registry.objects.get(object.id()).activeSection
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
    const squadSmartTerrain: Optional<SmartTerrain> = simulationBoardManager.getSmartTerrainDescriptor(
      squad.assignedSmartTerrainId as TNumberId
    )!.smartTerrain;

    if (params[2] !== null) {
      let spawnPoint: TStringId;

      if (params[2] === "simulation_point") {
        const data: string = readIniString(SYSTEM_INI, squad.section_name(), "spawn_point", false);
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
      const commander: ServerHumanObject = registry.simulator.object(squad.commander_id()) as ServerHumanObject;

      position = commander.position;
      levelVertexId = commander.m_level_vertex_id;
      gameVertexId = commander.m_game_vertex_id;
    }

    const newSquadMemberId: TNumberId = squad.addSquadMember(squadMemberSection, position, levelVertexId, gameVertexId);

    squad.assignSquadMemberToSmartTerrain(newSquadMemberId, squadSmartTerrain, null);
    simulationBoardManager.setupObjectSquadAndGroup(
      registry.simulator.object(newSquadMemberId) as ServerCreatureObject
    );
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

  SimulationBoardManager.getInstance().releaseSquad(squad);
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
      registry.simulator.object<ServerHumanObject>(tonumber(k)!)!.kill();
    } else {
      clientObject.kill(clientObject);
    }
  }
});

/**
 * todo;
 */
extern("xr_effects.heal_squad", (actor: ClientObject, obj: ClientObject, params: [TStringId, number]): void => {
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
extern(
  "xr_effects.clear_smart_terrain",
  (
    actor: ClientObject,
    object: ClientObject,
    [smartTerrainName, clearStory]: [Optional<TName>, Optional<"false">]
  ): void => {
    logger.format("Clear smart terrain: '%s', '%s'", smartTerrainName, clearStory);

    if (smartTerrainName === null) {
      abort("Wrong squad id [NIL] in clear_smart_terrain function");
    }

    const simulationBoardManager: SimulationBoardManager = SimulationBoardManager.getInstance();
    const smartTerrain: SmartTerrain = simulationBoardManager.getSmartTerrainByName(smartTerrainName) as SmartTerrain;
    const smartTerrainId: TNumberId = smartTerrain.id;

    for (const [, squad] of simulationBoardManager.getSmartTerrainDescriptor(smartTerrainId)!.assignedSquads) {
      if (clearStory === FALSE) {
        if (!getStoryIdByObjectId(squad.id)) {
          logger.format("Remove smart terrain squads on effect: '%s', '%s', '%s'", smartTerrainName, squad.name());

          simulationBoardManager.exitSmartTerrain(squad, smartTerrainId);
          simulationBoardManager.releaseSquad(squad);
        }
      } else {
        logger.format("Remove smart terrain squads on effect: '%s', '%s', '%s'", smartTerrainName, squad.name());

        simulationBoardManager.exitSmartTerrain(squad, smartTerrainId);
        simulationBoardManager.releaseSquad(squad);
      }
    }
  }
);

/**
 * todo;
 */
extern(
  "xr_effects.update_npc_logic",
  (actor: ClientObject, object: ClientObject, params: LuaArray<TStringId>): void => {
    for (const [index, storyId] of params) {
      const storyObject: Optional<ClientObject> = getObjectByStoryId(storyId);

      if (storyObject !== null) {
        updateStalkerLogic(storyObject);

        const planner: ActionPlanner = storyObject.motivation_action_manager();

        planner.update();
        planner.update();
        planner.update();

        const state: IRegistryObjectState = registry.objects.get(storyObject.id());

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
  }
);

/**
 * todo;
 */
extern(
  "xr_effects.update_obj_logic",
  (actor: ClientObject, object: ClientObject, params: LuaArray<TStringId>): void => {
    for (const [index, storyId] of params) {
      const storyObject: Optional<ClientObject> = getObjectByStoryId(storyId);

      if (storyObject !== null) {
        logger.info("Update object logic:", storyObject.id());

        const state: IRegistryObjectState = registry.objects.get(storyObject.id());

        trySwitchToAnotherSection(storyObject, state[state.activeScheme as EScheme] as IBaseSchemeState);
      }
    }
  }
);

/**
 * todo;
 */
extern(
  "xr_effects.hit_npc",
  (actor: ClientObject, object: ClientObject, params: [string, string, string, number, number, string]): void => {
    logger.info("Hit object:", object.name());

    const targetHit: Hit = new hit();
    const rev: boolean = params[5] ? params[5] === TRUE : false;

    targetHit.draftsman = object;
    targetHit.type = hit.wound;
    if (params[0] !== "self") {
      const hitter: Optional<ClientObject> = getObjectByStoryId(params[0]);

      if (!hitter) {
        return;
      }

      if (rev) {
        targetHit.draftsman = hitter;
        targetHit.direction = hitter.position().sub(object.position());
      } else {
        targetHit.direction = object.position().sub(hitter.position());
      }
    } else {
      if (rev) {
        targetHit.draftsman = null;
        targetHit.direction = object.position().sub(new patrol(params[1]).point(0));
      } else {
        targetHit.direction = new patrol(params[1]).point(0).sub(object.position());
      }
    }

    targetHit.bone(params[2]);
    targetHit.power = params[3];
    targetHit.impulse = params[4];

    object.hit(targetHit);
  }
);

/**
 * todo;
 */
extern("xr_effects.restore_health", (actor: ClientObject, object: ClientObject): void => {
  object.health = 1;
});

/**
 * todo;
 */
extern(
  "xr_effects.force_obj",
  (actor: ClientObject, object: ClientObject, p: [string, Optional<number>, Optional<number>]): void => {
    logger.info("Force object");

    const storyObject: Optional<ClientObject> = getObjectByStoryId(p[0]);

    if (!storyObject) {
      abort("Effect 'force_obj' target object does not exist.");
    }

    if (p[1] === null) {
      p[1] = 20;
    }

    if (p[2] === null) {
      p[2] = 100;
    }

    storyObject.set_const_force(createVector(0, 1, 0), p[1], p[2]);
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

    spawnItemsForObject(registry.simulator.object(objectId)!, section);
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
extern("xr_effects.set_force_sleep_animation", (actor: ClientObject, object: ClientObject, p: [number]): void => {
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
extern("xr_effects.set_monster_animation", (actor: ClientObject, object: ClientObject, p: [string]): void => {
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
  (getObjectSmartTerrain(object) as SmartTerrain).switchObjectToDesiredJob(object.id());
});

/**
 * todo;
 */
extern(
  "xr_effects.spawn_item_to_npc",
  (actor: ClientObject, object: ClientObject, [section]: [Optional<TSection>]): void => {
    if (section) {
      registry.simulator.create(
        section,
        object.position(),
        object.level_vertex_id(),
        object.game_vertex_id(),
        object.id()
      );
    }
  }
);

/**
 * todo;
 */
extern("xr_effects.give_money_to_npc", (actor: ClientObject, object: ClientObject, p: [Optional<number>]): void => {
  const money: Optional<TCount> = p[0];

  if (money) {
    object.give_money(money);
  }
});

/**
 * todo;
 */
extern("xr_effects.seize_money_to_npc", (actor: ClientObject, object: ClientObject, p: [Optional<number>]): void => {
  const money: Optional<TCount> = p[0];

  if (money) {
    object.give_money(-money);
  }
});

/**
 * todo;
 */
extern("xr_effects.heli_start_flame", (actor: ClientObject, object: ClientObject): void => {
  object.get_helicopter().StartFlame();
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
extern("xr_effects.clear_box", (actor: ClientObject, object: ClientObject, p: [string]): void => {
  logger.info("Clear box");

  if ((p && p[0]) === null) {
    abort("Wrong parameters in function 'clear_box'!!!");
  }

  const inventoryBox: Optional<ClientObject> = getObjectByStoryId(p[0]);

  assertDefined(inventoryBox, "There is no object with story_id [%s]", tostring(p[0]));

  const itemsList: LuaArray<ClientObject> = new LuaTable();

  inventoryBox.iterate_inventory_box((box: ClientObject, item: ClientObject): void => {
    table.insert(itemsList, item);
  }, inventoryBox);

  for (const [, item] of itemsList) {
    registry.simulator.release(registry.simulator.object(item.id()), true);
  }
});

/**
 * todo;
 */
extern("xr_effects.polter_actor_ignore", (actor: ClientObject, object: ClientObject, [ignore]: [string]): void => {
  if (ignore === TRUE) {
    object.poltergeist_set_actor_ignore(true);
  } else if (ignore === FALSE) {
    object.poltergeist_set_actor_ignore(false);
  }
});
