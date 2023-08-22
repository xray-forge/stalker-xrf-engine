import { alife, cast_planner, relation_registry, stalker_ids } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { AbstractCoreManager } from "@/engine/core/managers/base/AbstractCoreManager";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { gameTimeToString } from "@/engine/core/utils/game/game_time";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectActiveWeaponSlot } from "@/engine/core/utils/object";
import { getNumberRelationBetweenCommunities } from "@/engine/core/utils/relation";
import { toJSON } from "@/engine/core/utils/transform/json";
import { stalkerCommunities, TCommunity } from "@/engine/lib/constants/communities";
import { NIL } from "@/engine/lib/constants/words";
import { ActionPlanner, ClientObject, ESchemeType, Optional, TLabel, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Debug manager to work with UI overlay components / console commands and help debugging the game.
 */
export class DebugManager extends AbstractCoreManager {
  /**
   * Debug object inventory items.
   */
  public logObjectInventoryItems(object: ClientObject): void {
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
  public logObjectPlannerState(object: ClientObject): void {
    logger.pushSeparator();
    logger.info("Print object planner state report:", object.name());

    const plannerShowPrefix: TLabel = `${logger.getFullPrefix()} [${object.name()}]`;
    const actionPlanner: Optional<ActionPlanner> = object.motivation_action_manager();

    if (actionPlanner === null) {
      return logger.info("Object does not have action planner, `null` received");
    }

    const currentActionId: Optional<TNumberId> = actionPlanner.current_action_id();

    logger.info("Current best enemy:", object.best_enemy()?.name() || NIL);
    logger.info("Current best danger:", object.best_danger()?.object()?.name() || NIL);
    logger.info("Current planner initialized:", actionPlanner.initialized());
    logger.info("Current planner action id:", currentActionId);

    // Detect specifically which action is played.
    if (
      currentActionId === stalker_ids.action_alife_planner ||
      currentActionId === stalker_ids.action_combat_planner ||
      currentActionId === stalker_ids.action_danger_planner
    ) {
      logger.info(
        "Current action id:",
        currentActionId,
        "->",
        cast_planner(actionPlanner.action(currentActionId)).current_action_id()
      );
    }

    if (actionPlanner.show !== null) {
      actionPlanner.show(plannerShowPrefix);
    } else {
      logger.info("For more details run game in mixed/debug mode");
    }

    logger.pushSeparator();

    // Check state manager planner if it exists for the object.
    if (registry.objects.get(object.id())?.stateManager) {
      logger.info("Print object state planner report:", object.name());

      const state: IRegistryObjectState = registry.objects.get(object.id());
      const actionPlanner: ActionPlanner = state.stateManager!.planner;
      const currentActionId: Optional<TNumberId> = actionPlanner.current_action_id();

      logger.info("Current state planner initialized:", actionPlanner.initialized());
      logger.info("Current state action id:", currentActionId);

      if (actionPlanner.show !== null) {
        actionPlanner.show(plannerShowPrefix + "[planner] ");
      } else {
        logger.info("For more state details run game in mixed/debug mode");
      }

      logger.pushSeparator();
    }
  }

  /**
   * Details about state management of the object.
   */
  public logObjectStateManager(object: ClientObject): void {
    logger.pushSeparator();
    logger.info("Print object state manager report:", object.name());

    if (registry.objects.get(object.id())?.stateManager) {
      const stateManager: StalkerStateManager = registry.objects.get(object.id()).stateManager!;

      logger.info("State controller:", stateManager.controller);
      logger.info("Target state:", stateManager.targetState);
      logger.info(
        "Look object:",
        stateManager.lookObjectId ? alife().object(stateManager.lookObjectId)?.name() || NIL : NIL
      );
      logger.info("Look type:", stateManager.getObjectLookPositionType());
      logger.info("Current animation slot:", getObjectActiveWeaponSlot(object));
      logger.info("Callback object:", toJSON(stateManager.callback));
      logger.info("Is combat:", stateManager.isCombat);
      logger.info("Is alife:", stateManager.isAlife);
      logger.info("Animation states:", toJSON(stateManager.animation.state));
      logger.info("Animstate states:", toJSON(stateManager.animstate.state));
    } else {
      logger.info("No state manager declared for object");
    }

    logger.pushSeparator();
  }

  /**
   * Details about state management of the object.
   */
  public logObjectRelations(object: ClientObject): void {
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
  public logObjectState(object: ClientObject): void {
    logger.pushSeparator();
    logger.info("Print object state report:", object.name(), object.id(), object.section());

    const state: IRegistryObjectState = registry.objects.get(object.id());

    logger.info("Object section:", object.section());
    logger.info("Ini file name:", state.iniFilename);
    logger.info("Section logic:", state.sectionLogic);
    logger.info("Scheme type:", ESchemeType[state.schemeType]);
    logger.info("Active scheme:", state.activeScheme);
    logger.info("Active section:", state.activeSection);
    logger.info("Smart terrain name:", state.smartTerrainName);
    logger.info("Activation time:", state.activationTime);
    logger.info("Activation game time:", gameTimeToString(state.activationGameTime));
    logger.info("Portable store:", toJSON(state.portableStore));
    logger.info("State overrides:", toJSON(state.overrides));
    logger.info("Enemy id:", state.enemy_id);
    logger.info("Enemy name:", state.enemy_id ? alife().object(state.enemy_id)?.name() : NIL);
    logger.info("Script combat type:", state.script_combat_type);
    logger.info("Registered camp:", state.camp || "none");

    logger.pushSeparator();

    logger.info("State of scheme:", toJSON(state.activeScheme ? state[state.activeScheme] : null, "\n", 0, 4));

    logger.pushSeparator();
  }
}
