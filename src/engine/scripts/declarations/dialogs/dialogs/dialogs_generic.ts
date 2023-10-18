import { level } from "xray16";

import { registry } from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/actor";
import { ENotificationDirection, NotificationManager } from "@/engine/core/managers/notifications";
import { SimulationBoardManager } from "@/engine/core/managers/simulation/SimulationBoardManager";
import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import { ISchemeWoundedState } from "@/engine/core/schemes/stalker/wounded";
import { extern } from "@/engine/core/utils/binding";
import { getObjectCommunity } from "@/engine/core/utils/community";
import {
  breakObjectDialog,
  getActorAvailableMedKit,
  getNpcSpeaker,
  updateObjectDialog,
} from "@/engine/core/utils/dialog";
import { actorHasMedKit } from "@/engine/core/utils/item";
import { LuaLogger } from "@/engine/core/utils/logging";
import { enableObjectWoundedHealing } from "@/engine/core/utils/object";
import { isObjectWounded } from "@/engine/core/utils/planner";
import { transferItemsFromActor } from "@/engine/core/utils/reward";
import { communities } from "@/engine/lib/constants/communities";
import { drugs, TMedkit } from "@/engine/lib/constants/items/drugs";
import { misc } from "@/engine/lib/constants/items/misc";
import { pistols, TPistol } from "@/engine/lib/constants/items/weapons";
import { levels } from "@/engine/lib/constants/levels";
import { EGameObjectRelation, EScheme, GameObject, Optional, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Break dialog for two participating objects.
 */
extern("dialogs.break_dialog", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  breakObjectDialog(getNpcSpeaker(firstSpeaker, secondSpeaker));
});

/**
 * Update current state of NPC dialog logics / meet state.
 */
extern("dialogs.update_npc_dialog", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  updateObjectDialog(getNpcSpeaker(firstSpeaker, secondSpeaker));
});

/**
 * Check if speaking with wounded object.
 */
extern("dialogs.is_wounded", (actor: GameObject, object: GameObject): boolean => {
  return isObjectWounded(getNpcSpeaker(actor, object).id());
});

/**
 * Check if speaking with not wounded object.
 */
extern("dialogs.is_not_wounded", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectWounded(getNpcSpeaker(firstSpeaker, secondSpeaker).id());
});

/**
 * Check if actor has at least one medkit.
 */
extern("dialogs.actor_have_medkit", (): boolean => {
  return actorHasMedKit();
});

/**
 * Check if actor has no medkits.
 */
extern("dialogs.actor_hasnt_medkit", (): boolean => {
  return !actorHasMedKit();
});

/**
 * todo;
 */
extern("dialogs.transfer_medkit", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  const availableMedkit: Optional<TMedkit> = getActorAvailableMedKit();

  if (availableMedkit !== null) {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), availableMedkit);
  }

  registry.simulator.create(
    misc.medkit_script,
    secondSpeaker.position(),
    secondSpeaker.level_vertex_id(),
    secondSpeaker.game_vertex_id(),
    secondSpeaker.id()
  );

  enableObjectWoundedHealing(secondSpeaker);

  if (secondSpeaker.relation(firstSpeaker) !== EGameObjectRelation.ENEMY) {
    secondSpeaker.set_relation(EGameObjectRelation.FRIEND, firstSpeaker);
  }

  firstSpeaker.change_character_reputation(10);
});

/**
 * Check whether actor has at least one bandage.
 */
extern("dialogs.actor_have_bandage", (actor: GameObject, object: GameObject): boolean => {
  return actor.object(drugs.bandage) !== null;
});

/**
 * Transfer bandage from actor to object and set relation to friendly.
 */
extern("dialogs.transfer_bandage", (actor: GameObject, object: GameObject): void => {
  transferItemsFromActor(object, drugs.bandage);
  object.set_relation(EGameObjectRelation.FRIEND, actor);
});

/**
 * Kill actor on dialog option selection.
 */
extern("dialogs.kill_yourself", (actor: GameObject, object: GameObject): void => {
  actor.kill(object);
});

/**
 * todo;
 */
extern("dialogs.allow_wounded_dialog", (object: GameObject, victim: GameObject, id: TNumberId): boolean => {
  return (registry.objects.get(victim.id())[EScheme.WOUNDED] as ISchemeWoundedState)?.helpDialog === id;
});

/**
 * Check whether current level is zaton.
 */
extern("dialogs.level_zaton", (): boolean => {
  return level.name() === levels.zaton;
});

/**
 * Check whether current level is not zaton.
 */
extern("dialogs.not_level_zaton", (): boolean => {
  return level.name() !== levels.zaton;
});

/**
 * Check whether current level is jupiter.
 */
extern("dialogs.level_jupiter", (): boolean => {
  return level.name() === levels.jupiter;
});

/**
 * Check whether current level is not jupiter.
 */
extern("dialogs.not_level_jupiter", (): boolean => {
  return level.name() !== levels.jupiter;
});

/**
 * Check whether current level is pripyat.
 */
extern("dialogs.level_pripyat", (): boolean => {
  return level.name() === levels.pripyat;
});

/**
 * Check whether current level is not pripyat.
 */
extern("dialogs.not_level_pripyat", (): boolean => {
  return level.name() !== levels.pripyat;
});

/**
 * Check whether actor is friend with object.
 */
extern("dialogs.is_friend", (actor: GameObject, object: GameObject): boolean => {
  return actor.relation(object) === EGameObjectRelation.FRIEND;
});

/**
 * Check whether actor is not friend with object.
 */
extern("dialogs.is_not_friend", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return firstSpeaker.relation(secondSpeaker) !== EGameObjectRelation.FRIEND;
});

/**
 * Become friends with object.
 */
extern("dialogs.become_friend", (actor: GameObject, object: GameObject): void => {
  actor.set_relation(EGameObjectRelation.FRIEND, object);
});

/**
 * Check if speaking with stalker community member.
 */
extern("dialogs.npc_stalker", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return getObjectCommunity(getNpcSpeaker(firstSpeaker, secondSpeaker)) === communities.stalker;
});

/**
 * Check if speaking with bandit community member.
 */
extern("dialogs.npc_bandit", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return getObjectCommunity(getNpcSpeaker(firstSpeaker, secondSpeaker)) === communities.bandit;
});

/**
 * Check if speaking with freedom community member.
 */
extern("dialogs.npc_freedom", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return getObjectCommunity(getNpcSpeaker(firstSpeaker, secondSpeaker)) === communities.freedom;
});

/**
 * Check if speaking with dolg community member.
 */
extern("dialogs.npc_dolg", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return getObjectCommunity(getNpcSpeaker(firstSpeaker, secondSpeaker)) === communities.dolg;
});

/**
 * Check if speaking with army community member.
 */
extern("dialogs.npc_army", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return getObjectCommunity(getNpcSpeaker(firstSpeaker, secondSpeaker)) === communities.army;
});

/**
 * todo;
 */
extern("dialogs.actor_in_dolg", (actor: GameObject, object: GameObject): boolean => {
  for (const [k, v] of SimulationBoardManager.getInstance().getFactions()) {
    if (v.isCommunity === true && v.name === communities.dolg) {
      return true;
    }
  }

  return false;
});

/**
 * todo;
 */
extern("dialogs.actor_not_in_dolg", (actor: GameObject, object: GameObject): boolean => {
  for (const [k, v] of SimulationBoardManager.getInstance().getFactions()) {
    if (v.isCommunity === true && v.name === communities.dolg) {
      return false;
    }
  }

  return true;
});

/**
 * todo;
 */
extern("dialogs.actor_in_freedom", (actor: GameObject, object: GameObject): boolean => {
  for (const [k, v] of SimulationBoardManager.getInstance().getFactions()) {
    if (v.isCommunity === true && v.name === communities.freedom) {
      return true;
    }
  }

  return false;
});

/**
 * todo;
 */
extern("dialogs.actor_not_in_freedom", (actor: GameObject, object: GameObject): boolean => {
  for (const [k, v] of SimulationBoardManager.getInstance().getFactions()) {
    if (v.isCommunity === true && v.name === communities.freedom) {
      return false;
    }
  }

  return true;
});

/**
 * todo;
 */
extern("dialogs.actor_in_bandit", (actor: GameObject, object: GameObject): boolean => {
  for (const [k, v] of SimulationBoardManager.getInstance().getFactions()) {
    if (v.isCommunity === true && v.name === communities.bandit) {
      return true;
    }
  }

  return false;
});

/**
 * todo;
 */
extern("dialogs.actor_not_in_bandit", (actor: GameObject, object: GameObject): boolean => {
  for (const [k, v] of SimulationBoardManager.getInstance().getFactions()) {
    if (v.isCommunity === true && v.name === communities.bandit) {
      return false;
    }
  }

  return true;
});

/**
 * todo;
 */
extern("dialogs.actor_in_stalker", (actor: GameObject, object: GameObject): boolean => {
  for (const [k, v] of SimulationBoardManager.getInstance().getFactions()) {
    if (v.isCommunity === true && v.name === communities.stalker) {
      return true;
    }
  }

  return false;
});

/**
 * todo;
 */
extern("dialogs.actor_not_in_stalker", (): boolean => {
  for (const [, v] of SimulationBoardManager.getInstance().getFactions()) {
    if (v.isCommunity && v.name === communities.stalker) {
      return false;
    }
  }

  return true;
});

/**
 * Check if actor has at least 2000 money value.
 */
extern("dialogs.has_2000_money", (actor: GameObject): boolean => {
  return actor.money() >= 2000;
});

/**
 * todo;
 */
extern("dialogs.transfer_any_pistol_from_actor", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  const actor: GameObject = registry.actor;
  const object: GameObject = getNpcSpeaker(firstSpeaker, secondSpeaker);
  const pistol: Optional<TPistol> = getNpcPistol(actor);

  if (pistol !== null) {
    actor.transfer_item(actor.object(pistol)!, object);
    NotificationManager.getInstance().sendItemRelocatedNotification(ENotificationDirection.OUT, pistol);
  }
});

/**
 * todo;
 */
function getNpcPistol(object: GameObject): Optional<TPistol> {
  let pistol: Optional<TPistol> = null;

  object.iterate_inventory((owner, item) => {
    const section: TPistol = item.section();

    if (pistols[section] !== null) {
      pistol = section;
    }
  }, object);

  return pistol;
}

/**
 * todo;
 */
extern("dialogs.have_actor_any_pistol", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return getNpcPistol(registry.actor) !== null;
});

/**
 * Disable actor game UI (including torch and night vision).
 */
extern("dialogs.disable_ui", (): void => {
  ActorInputManager.getInstance().disableGameUi(false);
});

/**
 * Disable actor game UI only.
 */
extern("dialogs.disable_ui_only", (): void => {
  ActorInputManager.getInstance().disableGameUiOnly();
});

/**
 * Check if surge is in running state.
 */
extern("dialogs.is_surge_running", (): boolean => {
  return surgeConfig.IS_STARTED;
});

/**
 * Check if surge is in finished state (not running).
 */
extern("dialogs.is_surge_not_running", (): boolean => {
  return surgeConfig.IS_FINISHED;
});
