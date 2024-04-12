import { hit, level, patrol } from "xray16";

import {
  getManager,
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
import { SimulationManager } from "@/engine/core/managers/simulation/SimulationManager";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { switchSmartTerrainObjectToDesiredJob } from "@/engine/core/objects/smart_terrain/job";
import type { Squad } from "@/engine/core/objects/squad";
import { ISchemeMobCombatState } from "@/engine/core/schemes/monster/mob_combat";
import { ISchemeCombatState } from "@/engine/core/schemes/stalker/combat";
import { ISchemeCombatIgnoreState } from "@/engine/core/schemes/stalker/combat_ignore";
import { clearObjectAbuse } from "@/engine/core/schemes/stalker/meet/utils";
import { initTarget } from "@/engine/core/schemes/stalker/remark/actions";
import { abort, assert } from "@/engine/core/utils/assertion";
import { extern } from "@/engine/core/utils/binding";
import {
  IConfigSwitchCondition,
  parseConditionsList,
  pickSectionFromCondList,
  readIniString,
} from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { updateStalkerLogic } from "@/engine/core/utils/logics";
import { getObjectSmartTerrain } from "@/engine/core/utils/position";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/scheme_switch";
import {
  releaseObject,
  spawnItemsForObject,
  spawnObject,
  spawnObjectInObject,
  spawnSquadInSmart,
} from "@/engine/core/utils/spawn";
import { createVector, subVectors } from "@/engine/core/utils/vector";
import { misc } from "@/engine/lib/constants/items/misc";
import { FALSE, TRUE } from "@/engine/lib/constants/words";
import {
  ActionPlanner,
  EScheme,
  GameObject,
  Hit,
  LuaArray,
  Optional,
  Patrol,
  ServerCreatureObject,
  ServerHumanObject,
  TBloodsuckerVisibilityState,
  TCount,
  TDuration,
  TIndex,
  TName,
  TNumberId,
  TRate,
  TSection,
  TStringId,
  TStringifiedBoolean,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Process forward animation for provided doors.
 */
extern("xr_effects.anim_obj_forward", (_: GameObject, __: GameObject, doors: Array<TName>): void => {
  for (const [, doorName] of ipairs(doors)) {
    registry.doors.get(doorName).startAnimation(true);
  }
});

/**
 * Process backward animation for provided doors.
 */
extern("xr_effects.anim_obj_backward", (_: GameObject, __: GameObject, doors: Array<TName>): void => {
  for (const [, doorName] of ipairs(doors)) {
    registry.doors.get(doorName).startAnimation(false);
  }
});

/**
 * Stop animation for provided doors.
 */
extern("xr_effects.anim_obj_stop", (_: GameObject, __: GameObject, doors: Array<TName>): void => {
  for (const [, doorName] of ipairs(doors)) {
    registry.doors.get(doorName).stopAnimation();
  }
});

/**
 * todo;
 */
extern(
  "xr_effects.hit_obj",
  (_: GameObject, object: GameObject, params: [string, string, number, number, string, string]): void => {
    const h: hit = new hit();
    const storyObject: Optional<GameObject> = getObjectByStoryId(params[0]);

    if (!storyObject) {
      return;
    }

    logger.info("Hit object: %s %s", object.name(), storyObject.name());

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
  (actor: GameObject, object: GameObject, [storyId]: [Optional<TStringId>] = [null]): void => {
    const hitObject: Hit = new hit();
    const target: GameObject = storyId ? (getObjectByStoryId(storyId) as GameObject) : object;

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
  (_: GameObject, object: GameObject, [from, to]: [TStringId, Optional<TStringId>]): void => {
    const target: GameObject = to ? (getObjectByStoryId(to) as GameObject) : object;
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
extern("xr_effects.sniper_fire_mode", (_: GameObject, object: GameObject, parameters: [string]): void => {
  object.sniper_fire_mode(parameters[0] === TRUE);
});

/**
 * todo;
 */
extern("xr_effects.kill_npc", (_: GameObject, object: Optional<GameObject>, [storyId]: [Optional<TStringId>]): void => {
  if (storyId) {
    object = getObjectByStoryId(storyId);
  }

  if (object?.alive()) {
    object.kill(object);
  }
});

/**
 * todo;
 */
extern("xr_effects.remove_npc", (_: GameObject, __: GameObject, [storyId]: [Optional<TStringId>]): void => {
  let objectId: Optional<TNumberId> = null;

  if (storyId) {
    objectId = getObjectIdByStoryId(storyId);
  }

  if (objectId) {
    registry.simulator.release(registry.simulator.object(objectId), true);
  }
});

/**
 * Clear abuse for provided object.
 */
extern("xr_effects.clear_abuse", (_: GameObject, object: GameObject): void => {
  clearObjectAbuse(object);
});

/**
 * todo;
 */
extern("xr_effects.disable_combat_handler", (_: GameObject, object: GameObject): void => {
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
extern("xr_effects.disable_combat_ignore_handler", (_: GameObject, object: GameObject): void => {
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
  (_: GameObject, __: GameObject, [section, pathName, index, yaw]: [TSection, TName, TIndex, TRate]): void => {
    spawnObject(section, pathName, index, yaw);
  }
);

/**
 * Effect to spawn object in provided story id.
 */
extern(
  "xr_effects.spawn_object_in",
  (_: GameObject, __: GameObject, [section, storyId]: [TSection, TStringId]): void => {
    spawnObjectInObject(section, getObjectIdByStoryId(storyId));
  }
);

/**
 * Spawn corpse of provided section.
 * Spawn location is based on provided patrol name and patrol index.
 */
extern(
  "xr_effects.spawn_corpse",
  (_: GameObject, object: GameObject, [spawnSection, pathName, index]: [TSection, TName, Optional<TIndex>]): void => {
    // logger.format("Spawn corpse: %s", params[0]);

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
  (_: GameObject, object: GameObject, parameters: [Optional<string>, Optional<string>, Optional<string>]): void => {
    if (!parameters[0] && !parameters[1]) {
      return releaseObject(object.id());
    }

    if (!parameters[0] || !parameters[1]) {
      abort("Wrong parameters in destroy_object function.");
    }

    const targetString =
      parameters[2] !== null ? [0] + "|" + parameters[1] + "," + parameters[2] : parameters[0] + "|" + parameters[1];
    const [, targetId] = initTarget(object, targetString);

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
);

/**
 * todo;
 */
extern(
  "xr_effects.create_squad",
  (_: GameObject, __: Optional<GameObject>, [section, terrainName]: [TSection, TName]): void => {
    spawnSquadInSmart(section, terrainName);
  }
);

/**
 * todo;
 * todo: Move member creation to squad / squad util.
 */
extern(
  "xr_effects.create_squad_member",
  (actor: GameObject, object: GameObject, params: [TSection, TStringId, string]): void => {
    const squadMemberSection: TSection = params[0];
    const storyId: Optional<TStringId> = params[1];

    let position: Optional<Vector> = null;
    let levelVertexId: Optional<TNumberId> = null;
    let gameVertexId: Optional<TNumberId> = null;

    if (storyId === null) {
      abort("Wrong squad identificator [NIL] in 'create_squad_member' function");
    }

    const simulationManager: SimulationManager = getManager(SimulationManager);
    const squad: Squad = getServerObjectByStoryId(storyId) as Squad;
    const squadSmartTerrain: Optional<SmartTerrain> = simulationManager.getSmartTerrainDescriptor(
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

    const newSquadMember: ServerCreatureObject = squad.addMember(
      squadMemberSection,
      position,
      levelVertexId,
      gameVertexId
    );

    squad.assignMemberToSmartTerrain(newSquadMember.id, squadSmartTerrain, null);
    simulationManager.setupObjectSquadAndGroup(newSquadMember);
    // --squad_smart.refresh()
    squad.update();
  }
);

/**
 * todo;
 */
extern("xr_effects.remove_squad", (_: GameObject, __: GameObject, [storyId]: [TStringId]): void => {
  if (!storyId) {
    abort("Wrong squad identificator [NIL] in remove_squad function");
  }

  const squad: Optional<Squad> = getServerObjectByStoryId(storyId);

  if (squad === null) {
    abort("Wrong squad identificator [%s]. squad doesnt exist", tostring(storyId));
  }

  getManager(SimulationManager).releaseSquad(squad);
});

/**
 * todo;
 */
extern("xr_effects.kill_squad", (actor: GameObject, object: GameObject, p: [Optional<TStringId>]): void => {
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

  for (const [k] of squadObjects) {
    const gameObject: Optional<GameObject> = registry.objects.get(k)?.object;

    if (gameObject === null) {
      registry.simulator.object<ServerHumanObject>(tonumber(k)!)!.kill();
    } else {
      gameObject.kill(gameObject);
    }
  }
});

/**
 * todo;
 */
extern(
  "xr_effects.heal_squad",
  (_: GameObject, __: GameObject, [storyId, healthModRaw]: [TStringId, Optional<number>]): void => {
    let healthMod: TRate = 1;

    if (healthModRaw) {
      healthMod = math.ceil(healthModRaw / 100);
    }

    if (!storyId) {
      abort("Wrong squad identifier 'nil' in heal_squad effect");
    }

    const squad: Optional<Squad> = getServerObjectByStoryId(storyId);

    if (!squad) {
      return;
    }

    for (const squadMember of squad.squad_members()) {
      const gameObject: Optional<GameObject> = registry.objects.get(squadMember.id)?.object as Optional<GameObject>;

      if (gameObject !== null) {
        gameObject.health = healthMod;
      }
    }
  }
);

/**
 * todo;
 */
extern(
  "xr_effects.clear_smart_terrain",
  (
    _: GameObject,
    __: GameObject,
    [terrainName, clearStory]: [Optional<TName>, Optional<TStringifiedBoolean>]
  ): void => {
    logger.info("Clear smart terrain: '%s', '%s'", terrainName, clearStory);

    if (!terrainName) {
      abort("Wrong squad id [NIL] in clear_smart_terrain function");
    }

    const simulationManager: SimulationManager = getManager(SimulationManager);
    const smartTerrain: SmartTerrain = simulationManager.getSmartTerrainByName(terrainName) as SmartTerrain;
    const smartTerrainId: TNumberId = smartTerrain.id;

    for (const [, squad] of simulationManager.getSmartTerrainDescriptor(smartTerrainId)!.assignedSquads) {
      if (clearStory === FALSE) {
        if (!getStoryIdByObjectId(squad.id)) {
          logger.info("Remove smart terrain squads on effect: '%s', '%s'", terrainName, squad.name());
          simulationManager.releaseSquad(squad);
        }
      } else {
        logger.info("Remove smart terrain squads on effect: '%s', '%s'", terrainName, squad.name());
        simulationManager.releaseSquad(squad);
      }
    }
  }
);

/**
 * todo;
 */
extern("xr_effects.update_npc_logic", (_: GameObject, __: GameObject, params: LuaArray<TStringId>): void => {
  for (const [, storyId] of params) {
    const storyObject: Optional<GameObject> = getObjectByStoryId(storyId);

    if (storyObject) {
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
});

/**
 * todo;
 */
extern("xr_effects.update_obj_logic", (_: GameObject, __: GameObject, params: LuaArray<TStringId>): void => {
  for (const [, storyId] of params) {
    const storyObject: Optional<GameObject> = getObjectByStoryId(storyId);

    if (storyObject !== null) {
      logger.info("Update object logic: %s", storyObject.id());

      const state: IRegistryObjectState = registry.objects.get(storyObject.id());

      trySwitchToAnotherSection(storyObject, state[state.activeScheme as EScheme] as IBaseSchemeState);
    }
  }
});

/**
 * todo;
 */
extern(
  "xr_effects.hit_npc",
  (_: GameObject, object: GameObject, params: [string, string, string, number, number, string]): void => {
    logger.info("Hit object: %s", object.name());

    const targetHit: Hit = new hit();
    const rev: boolean = params[5] ? params[5] === TRUE : false;

    targetHit.draftsman = object;
    targetHit.type = hit.wound;
    if (params[0] !== "self") {
      const hitter: Optional<GameObject> = getObjectByStoryId(params[0]);

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
extern("xr_effects.restore_health", (_: GameObject, object: GameObject): void => {
  object.health = 1;
});

/**
 * todo;
 */
extern(
  "xr_effects.force_obj",
  (_: GameObject, __: GameObject, p: [string, Optional<number>, Optional<number>]): void => {
    logger.info("Force object");

    const storyObject: Optional<GameObject> = getObjectByStoryId(p[0]);

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
 * Force burer gravity attack as enabled.
 */
extern("xr_effects.burer_force_gravi_attack", (_: GameObject, object: GameObject): void => {
  object.burer_set_force_gravi_attack(true);
});

/**
 * Force burer anti aim force.
 */
extern("xr_effects.burer_force_anti_aim", (_: GameObject, object: GameObject): void => {
  object.set_force_anti_aim(true);
});

/**
 * Give list of items to an object.
 */
extern("xr_effects.give_items", (_: GameObject, object: GameObject, params: Array<TSection>): void => {
  for (const section of params) {
    logger.info("Give item to object: %s %s", object.id(), section);
    spawnItemsForObject(object, section);
  }
});

/**
 * Give specific item to an object by story id.
 */
extern(
  "xr_effects.give_item",
  (
    _: GameObject,
    object: Optional<GameObject> | ServerHumanObject,
    [section, objectStoryId]: [TSection, Optional<TStringId>]
  ): void => {
    const objectId: TNumberId =
      objectStoryId === null ? (object as GameObject).id() : (getObjectIdByStoryId(objectStoryId) as TNumberId);

    logger.info("Give item to object: %s %s", objectId, section);

    spawnItemsForObject(registry.simulator.object(objectId)!, section);
  }
);

/**
 * todo;
 */
extern("xr_effects.disable_memory_object", (_: GameObject, object: GameObject): void => {
  const bestEnemy: Optional<GameObject> = object.best_enemy();

  if (bestEnemy) {
    object.enable_memory_object(bestEnemy, false);
  }
});

/**
 * todo;
 */
extern("xr_effects.set_force_sleep_animation", (_: GameObject, object: GameObject, [duration]: [TDuration]): void => {
  object.force_stand_sleep_animation(tonumber(duration) as TDuration);
});

/**
 * Release sleep animation of the object.
 */
extern("xr_effects.release_force_sleep_animation", (_: GameObject, object: GameObject): void => {
  object.release_stand_sleep_animation();
});

/**
 * todo;
 */
extern("xr_effects.set_visual_memory_enabled", (_: GameObject, object: GameObject, p: [number]): void => {
  if (p && p[0] && tonumber(p[0])! >= 0 && tonumber(p[0])! <= 1) {
    object.set_visual_memory_enabled(tonumber(p[0]) === 1);
  }
});

/**
 * todo;
 */
extern(
  "xr_effects.set_monster_animation",
  (_: GameObject, object: GameObject, [animation]: [Optional<TName>]): void => {
    if (animation) {
      object.set_override_animation(animation);
    } else {
      abort("Wrong parameters in function 'set_monster_animation'!!!");
    }
  }
);

/**
 * Clear animation of monster object.
 */
extern("xr_effects.clear_monster_animation", (_: GameObject, object: GameObject): void => {
  object.clear_override_animation();
});

/**
 * todo;
 */
extern("xr_effects.switch_to_desired_job", (_: GameObject, object: GameObject): void => {
  switchSmartTerrainObjectToDesiredJob(getObjectSmartTerrain(object) as SmartTerrain, object.id());
});

/**
 * todo;
 */
extern("xr_effects.spawn_item_to_npc", (_: GameObject, object: GameObject, [section]: [Optional<TSection>]): void => {
  if (section) {
    registry.simulator.create(
      section,
      object.position(),
      object.level_vertex_id(),
      object.game_vertex_id(),
      object.id()
    );
  }
});

/**
 * todo;
 */
extern("xr_effects.give_money_to_npc", (_: GameObject, object: GameObject, [money]: [Optional<TCount>]): void => {
  if (money) {
    object.give_money(money);
  }
});

/**
 * todo;
 */
extern("xr_effects.seize_money_to_npc", (_: GameObject, object: GameObject, p: [Optional<number>]): void => {
  const money: Optional<TCount> = p[0];

  if (money) {
    object.give_money(-money);
  }
});

/**
 * todo;
 */
extern("xr_effects.heli_start_flame", (_: GameObject, object: GameObject): void => {
  object.get_helicopter().StartFlame();
});

/**
 * todo;
 */
extern("xr_effects.heli_die", (_: GameObject, object: GameObject): void => {
  object.get_helicopter().Die();
  unregisterHelicopterObject(object);
});

/**
 * todo;
 */
extern("xr_effects.set_bloodsucker_state", (_: GameObject, object: Optional<GameObject>, p: [string, string]): void => {
  if ((p && p[0]) === null) {
    abort("Wrong parameters in function 'set_bloodsucker_state'!!!");
  }

  let state: string = p[0];

  if (p[1]) {
    state = p[1];
    object = getObjectByStoryId(p[1]);
  }

  if (object) {
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
extern("xr_effects.clear_box", (_: GameObject, __: GameObject, [storyId]: [TStringId]): void => {
  logger.info("Clear box");

  if (!storyId) {
    abort("Wrong parameters in function 'clear_box'!!!");
  }

  const inventoryBox: Optional<GameObject> = getObjectByStoryId(storyId);

  assert(inventoryBox, "There is no object with storyId '%s'.", storyId);

  const itemsList: LuaArray<GameObject> = new LuaTable();

  inventoryBox.iterate_inventory_box((_: GameObject, item: GameObject): void => {
    table.insert(itemsList, item);
  }, inventoryBox);

  for (const [, item] of itemsList) {
    registry.simulator.release(registry.simulator.object(item.id()), true);
  }
});

/**
 * Toggle poltergeist object ignoring of actor.
 */
extern("xr_effects.polter_actor_ignore", (_: GameObject, object: GameObject, [ignore]: [TStringifiedBoolean]): void => {
  object.poltergeist_set_actor_ignore(ignore === TRUE);
});

/**
 * Set torch state for an object if story id object exists and has it.
 * Expect `on` or `off` as state.
 *
 * Where:
 * - storyId - story ID of object to toggle torch
 * - state - string value representing next torch state (on, off)
 */
extern(
  "xr_effects.set_torch_state",
  (_: GameObject, __: GameObject, [storyId, state]: [TStringId, Optional<string>]): void => {
    if (!state) {
      abort("Not enough parameters in 'set_torch_state' function effect.");
    }

    const torch: Optional<GameObject> = getObjectByStoryId(storyId)?.object(misc.device_torch) as Optional<GameObject>;

    if (torch) {
      torch.enable_attachable_item(state === "on");
    }
  }
);
