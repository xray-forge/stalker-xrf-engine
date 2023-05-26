import {
  action_planner,
  alife,
  alife_simulator,
  cse_alife_creature_actor,
  cse_alife_object,
  game_object,
  level,
  relation_registry,
  TXR_class_id,
  vector,
} from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { AbstractCoreManager } from "@/engine/core/managers/base/AbstractCoreManager";
import { EStateActionId } from "@/engine/core/objects/state";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { EActionId } from "@/engine/core/schemes";
import { LuaLogger } from "@/engine/core/utils/logging";
import { areObjectsOnSameLevel } from "@/engine/core/utils/object";
import { getNumberRelationBetweenCommunities } from "@/engine/core/utils/relation";
import { gameTimeToString } from "@/engine/core/utils/time";
import { toJSON } from "@/engine/core/utils/transform/json";
import { stalkerCommunities, TCommunity } from "@/engine/lib/constants/communities";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { NIL } from "@/engine/lib/constants/words";
import { ESchemeType, Optional, TDistance, TName, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Debug manager to work with UI overlay components / console commands and help debugging the game.
 */
export class DebugManager extends AbstractCoreManager {
  /**
   * Get nearest to actor server object by pattern or just anything near.
   */
  public getNearestServerObject(
    pattern: Optional<TName | TXR_class_id> = null,
    searchOffline: boolean = false
  ): Optional<cse_alife_object> {
    const simulator: Optional<alife_simulator> = alife();
    const actorPosition: vector = registry.actor.position();
    const hasFilter: boolean = pattern !== null;

    let nearestDistance: Optional<TDistance> = null;
    let nearest: Optional<cse_alife_object> = null;

    if (simulator === null) {
      return null;
    }

    for (const it of $range(1, MAX_U16)) {
      const serverObject: Optional<cse_alife_object> = simulator.object(it);

      if (serverObject && serverObject.parent_id !== 0) {
        let isMatch: boolean = false;

        // Filter objects if pattern is provided.
        if (hasFilter) {
          if (type(pattern) === "string" && string.find(serverObject.name(), pattern as string)) {
            isMatch = true;
          } else if (type(pattern) === "number" && pattern === serverObject.clsid()) {
            isMatch = true;
          }
        } else {
          isMatch = true;
        }

        if (isMatch) {
          const distanceToSqr: TDistance = serverObject.position.distance_to_sqr(actorPosition);

          if (!nearestDistance) {
            nearestDistance = distanceToSqr;
            nearest = serverObject;
          } else if (distanceToSqr < nearestDistance) {
            nearestDistance = distanceToSqr;
            nearest = serverObject;
          }
        }
      }
    }

    if (nearest) {
      if (areObjectsOnSameLevel(nearest, simulator.object(0) as cse_alife_creature_actor)) {
        if (
          searchOffline ||
          (nearestDistance as TDistance) <= simulator.switch_distance() * simulator.switch_distance()
        ) {
          return nearest;
        }
      }
    }

    return null;
  }

  /**
   * Get nearest to actor object by pattern or just anything near.
   */
  public getNearestClientObject(pattern: Optional<TName | TXR_class_id> = null): Optional<game_object> {
    const nearestServerObject: Optional<cse_alife_object> = this.getNearestServerObject(pattern, false);

    if (nearestServerObject) {
      return level.object_by_id(nearestServerObject.id);
    } else {
      return null;
    }
  }

  /**
   * Debug object inventory items.
   */
  public logObjectInventoryItems(object: game_object): void {
    logger.pushSeparator();
    logger.info("Print object inventory report:", object.name());

    logger.info("Best weapon:", object.best_weapon()?.name() || NIL);
    logger.info("Best item:", object.best_item()?.name() || NIL);

    object.iterate_inventory((owner, item) => {
      logger.info("*:", item.section(), item.id());
    }, object);

    logger.pushSeparator();
  }

  /**
   * Debug action planner state.
   */
  public logObjectPlannerState(object: game_object): void {
    logger.pushSeparator();
    logger.info("Print object planner state report:", object.name());

    const actionPlanner: action_planner = object.motivation_action_manager();
    const currentActionId: Optional<TNumberId> = actionPlanner.current_action_id();

    logger.info("Current best enemy:", object.best_enemy()?.name() || NIL);
    logger.info("Current best danger:", object.best_danger()?.object()?.name() || NIL);
    logger.info("Current planner initialized:", actionPlanner.initialized());
    logger.info("Current action id:", currentActionId);

    if (currentActionId !== null) {
      logger.info("Action is:", EActionId[currentActionId] || EStateActionId[currentActionId] || "unknown");
    }

    if (actionPlanner.show !== null) {
      actionPlanner.show(logger.getFullPrefix() + " ");
    } else {
      logger.info("For more details run game in mixed/debug mode");
    }

    logger.pushSeparator();

    // Check state manager planner if it exists for the object.
    if (registry.objects.get(object.id())?.stateManager) {
      logger.info("Print object state planner report:", object.name());

      const state: IRegistryObjectState = registry.objects.get(object.id());
      const actionPlanner: action_planner = state.stateManager!.planner;
      const currentActionId: Optional<TNumberId> = actionPlanner.current_action_id();

      logger.info("Current state planner initialized:", actionPlanner.initialized());
      logger.info("Current state action id:", currentActionId);

      if (currentActionId !== null) {
        logger.info("State action is:", EStateActionId[currentActionId] || "unknown");
      }

      if (actionPlanner.show !== null) {
        actionPlanner.show(logger.getFullPrefix() + " ");
      } else {
        logger.info("For more state details run game in mixed/debug mode");
      }

      logger.pushSeparator();
    }
  }

  /**
   * Details about state management of the object.
   */
  public logObjectStateManager(object: game_object): void {
    logger.pushSeparator();
    logger.info("Print object state manager report:", object.name());

    if (registry.objects.get(object.id())?.stateManager) {
      const stateManager: StalkerStateManager = registry.objects.get(object.id()).stateManager!;

      logger.info("Target state:", stateManager.targetState);
      logger.info(
        "Look object:",
        stateManager.lookObjectId ? alife().object(stateManager.lookObjectId)?.name() || NIL : NIL
      );
      logger.info("Callback object:", toJSON(stateManager.callback));
      logger.info("Is combat:", stateManager.isCombat);
      logger.info("Is alife:", stateManager.isAlife);
      logger.info("Animation states:", toJSON(stateManager.animation.states));
      logger.info("Animstate states:", toJSON(stateManager.animstate.states));
    } else {
      logger.info("No state manager declared for object");
    }

    logger.pushSeparator();
  }

  /**
   * Details about state management of the object.
   */
  public logObjectRelations(object: game_object): void {
    logger.pushSeparator();
    logger.info("Print object relations report:", object.name());

    logger.info("Object community:", object.character_community());
    logger.info(
      "Object goodwill to actor:",
      relation_registry.community_relation(object.character_community(), registry.actor.character_community())
    );
    logger.info(
      "Object community to actor:",
      getNumberRelationBetweenCommunities(
        object.character_community() as TCommunity,
        registry.actor.character_community() as TCommunity
      )
    );
    logger.info(
      "Actor community to object:",
      getNumberRelationBetweenCommunities(
        registry.actor.character_community() as TCommunity,
        object.character_community() as TCommunity
      )
    );

    Object.values(stalkerCommunities).forEach((it) => {
      logger.info(
        "Community to object:",
        it,
        getNumberRelationBetweenCommunities(it, object.character_community() as TCommunity)
      );
      logger.info(
        "Object to community:",
        it,
        getNumberRelationBetweenCommunities(object.character_community() as TCommunity, it)
      );
    });

    logger.pushSeparator();
  }

  /**
   * Log object scheme state for easier debug.
   */
  public logObjectState(object: game_object): void {
    logger.pushSeparator();
    logger.info("Print object scheme state report:", object.name(), object.id());

    const state: IRegistryObjectState = registry.objects.get(object.id());

    logger.info("Ini file name:", state.ini_filename);
    logger.info("Scheme type:", ESchemeType[state.schemeType]);
    logger.info("Active scheme:", state.active_scheme);
    logger.info("Active section:", state.active_section);
    logger.info("Section logic:", state.section_logic);
    logger.info("Active gulag name:", state.gulag_name);
    logger.info("Activation time:", state.activation_time);
    logger.info("Activation game time:", gameTimeToString(state.activation_game_time));
    logger.info("Portable store:", toJSON(state.portableStore));
    logger.info("State overrides:", toJSON(state.overrides));
    logger.info("Enemy id:", state.enemy_id);
    logger.info("Enemy name:", state.enemy_id ? alife().object(state.enemy_id)?.name() : NIL);
    logger.info("Script combat type:", state.script_combat_type);
    logger.info("Registered camp:", state.registred_camp);

    logger.pushSeparator();

    logger.info("State of scheme:", toJSON(state.active_scheme ? state[state.active_scheme] : null, "\n", 0, 4));

    logger.pushSeparator();
  }
}
