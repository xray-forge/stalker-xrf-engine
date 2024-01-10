import { cast_planner, CTime, relation_registry } from "xray16";

import { EActionId } from "@/engine/core/ai/planner/types";
import { StalkerStateManager } from "@/engine/core/ai/state";
import { EStateActionId } from "@/engine/core/ai/state/types";
import { IRegistryObjectState, registry } from "@/engine/core/database";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getNumberRelationBetweenCommunities } from "@/engine/core/utils/relation";
import { gameTimeToString } from "@/engine/core/utils/time";
import { toJSON } from "@/engine/core/utils/transform";
import { getObjectActiveWeaponSlot } from "@/engine/core/utils/weapon";
import { stalkerCommunities, TCommunity } from "@/engine/lib/constants/communities";
import { NIL } from "@/engine/lib/constants/words";
import { ActionPlanner, ESchemeType, GameObject, Optional, TLabel, TName, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Debug object inventory items.
 *
 * @param object - game object
 */
export function logObjectInventoryItems(object: GameObject): void {
  logger.pushSeparator();
  logger.format("Print object inventory report: %s", object.name());

  logger.format("Best weapon: %s", object.best_weapon()?.name());
  logger.format("Best item: %s", object.best_item()?.name());

  object.iterate_inventory((owner, item) => {
    logger.format("*: %s %s", item.section(), item.id());
  }, object);

  logger.pushSeparator();
}

/**
 * Debug action planner state.
 *
 * @param object - game object
 */
export function logObjectPlannerState(object: GameObject): void {
  logger.pushSeparator();
  logger.format("Print object planner state report: %s", object.name());

  const plannerShowPrefix: TLabel = `${logger.getFullPrefix()} [${object.name()}]`;
  const actionPlanner: Optional<ActionPlanner> = object.motivation_action_manager();

  if (actionPlanner === null) {
    return logger.format("Object does not have action planner, `nil` received");
  }

  const currentActionId: Optional<TNumberId> = actionPlanner.current_action_id();

  logger.format("Current best enemy: %s", object.best_enemy()?.name());
  logger.format("Current best danger: %s", object.best_danger()?.object()?.name());
  logger.format("Current planner initialized: %s", actionPlanner.initialized());
  logger.format("Current planner action id: %s %s", currentActionId, EActionId[currentActionId]);

  // Detect specifically which action is played.
  if (
    currentActionId === EActionId.ALIFE ||
    currentActionId === EActionId.COMBAT ||
    currentActionId === EActionId.ANOMALY
  ) {
    logger.format(
      "Current action id: %s -> %s",
      currentActionId,
      cast_planner(actionPlanner.action(currentActionId)).current_action_id()
    );
  }

  if (actionPlanner.show !== null) {
    actionPlanner.show(plannerShowPrefix);
  } else {
    logger.format("For more details run game in mixed/debug mode");
  }

  logger.pushSeparator();

  // Check state manager planner if it exists for the object.
  if (registry.objects.get(object.id())?.stateManager) {
    logger.format("Print object state planner report: %s", object.name());

    const state: IRegistryObjectState = registry.objects.get(object.id());
    const actionPlanner: ActionPlanner = state.stateManager!.planner;
    const currentActionId: Optional<TNumberId> = actionPlanner.current_action_id();

    logger.format("Current state planner initialized: %s", actionPlanner.initialized());
    logger.format("Current state action id: %s %s", currentActionId, EStateActionId[currentActionId]);

    if (actionPlanner.show !== null) {
      actionPlanner.show(plannerShowPrefix + "[planner] ");
    } else {
      logger.format("For more state details run game in mixed/debug mode");
    }

    logger.pushSeparator();
  }
}

/**
 * Details about state management of the object.
 *
 * @param object - game object
 */
export function logObjectStateManager(object: GameObject): void {
  logger.pushSeparator();
  logger.format("Print object state manager report: %s", object.name());

  if (registry.objects.get(object.id())?.stateManager) {
    const stateManager: StalkerStateManager = registry.objects.get(object.id()).stateManager!;

    logger.format("State controller: %s", stateManager.controller);
    logger.format("Target state: %s", stateManager.targetState);
    logger.format(
      "Look object: %s",
      stateManager.lookObjectId ? registry.simulator.object(stateManager.lookObjectId)?.name() || NIL : NIL
    );
    logger.format("Look type: %s", stateManager.getObjectLookPositionType());
    logger.format("Current animation slot: %s", getObjectActiveWeaponSlot(object));
    logger.format("Callback object: %s", toJSON(stateManager.callback));
    logger.format("Is combat: %s", stateManager.isCombat);
    logger.format("Is alife: %s", stateManager.isAlife);
    logger.format("Animation states: %s", toJSON(stateManager.animation.state));
    logger.format(
      "Animation controller animation: %s",
      toJSON(stateManager.animation.animations.get(stateManager.animation.state.currentState as TName))
    );
    logger.format("Animstate states: %s", toJSON(stateManager.animstate.state));
    logger.format(
      "Animstate controller animation: %s",
      toJSON(stateManager.animation.animations.get(stateManager.animation.state.currentState as TName))
    );
  } else {
    logger.format("No state manager declared for object");
  }

  logger.pushSeparator();
}

/**
 * Details about state management of the object.
 *
 * @param object - game object
 */
export function logObjectRelations(object: GameObject): void {
  logger.pushSeparator();
  logger.format("Print object relations report: %s", object.name());

  logger.format("Object community: %s", object.character_community());
  logger.format(
    "Object goodwill to actor: %s",
    relation_registry.community_relation(object.character_community(), registry.actor.character_community())
  );
  logger.format(
    "Object community to actor: %s",
    getNumberRelationBetweenCommunities(
      object.character_community() as TCommunity,
      registry.actor.character_community() as TCommunity
    )
  );
  logger.format(
    "Actor community to object: %s",
    getNumberRelationBetweenCommunities(
      registry.actor.character_community() as TCommunity,
      object.character_community() as TCommunity
    )
  );

  Object.values(stalkerCommunities).forEach((it) => {
    logger.format(
      "Community to object: %s",
      it,
      getNumberRelationBetweenCommunities(it, object.character_community() as TCommunity)
    );
    logger.format(
      "Object to community: %s",
      it,
      getNumberRelationBetweenCommunities(object.character_community() as TCommunity, it)
    );
  });

  logger.pushSeparator();
}

/**
 * Log object scheme state for easier debug.
 *
 * @param object - game object
 */
export function logObjectState(object: GameObject): void {
  logger.pushSeparator();
  logger.format("Print object state report: %s %s %", object.name(), object.id(), object.section());

  const state: IRegistryObjectState = registry.objects.get(object.id());

  logger.format("Object section: %s", object.section());
  logger.format("Ini file name: %s", state.iniFilename);
  logger.format("Section logic: %s", state.sectionLogic);
  logger.format("Scheme type: %s", ESchemeType[state.schemeType]);
  logger.format("Active scheme: %s", state.activeScheme);
  logger.format("Active section: %s", state.activeSection);
  logger.format("Smart terrain name: %s", state.smartTerrainName);
  logger.format("Activation time: %s", state.activationTime);
  logger.format(
    "Activation game time: %s",
    (state.activationGameTime as Optional<CTime>) ? gameTimeToString(state.activationGameTime) : NIL
  );
  logger.format("Portable store: %s", toJSON(state.portableStore));
  logger.format("State overrides: %s", toJSON(state.overrides));
  logger.format("Enemy id: %s", state.enemyId);
  logger.format("Enemy name: %s", state.enemyId ? registry.simulator.object(state.enemyId)?.name() : NIL);
  logger.format("Script combat type: %s", tostring(state.scriptCombatType));
  logger.format("Registered camp: %s", state.camp || "none");

  logger.pushSeparator();

  logger.format("State of scheme: %s", toJSON(state.activeScheme ? state[state.activeScheme] : null, "\n", 0, 4));

  logger.pushSeparator();
}
