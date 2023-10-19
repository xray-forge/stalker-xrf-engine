import { registry } from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/actor";
import { ENotificationDirection, NotificationManager } from "@/engine/core/managers/notifications";
import { extern } from "@/engine/core/utils/binding";
import { breakObjectDialog, getNpcSpeaker } from "@/engine/core/utils/dialog";
import { actorHasMedKit, getActorAvailableMedKit, getAnyObjectPistol } from "@/engine/core/utils/item";
import { LuaLogger } from "@/engine/core/utils/logging";
import { enableObjectWoundedHealing } from "@/engine/core/utils/object";
import { transferItemsFromActor } from "@/engine/core/utils/reward";
import { drugs, TMedkit } from "@/engine/lib/constants/items/drugs";
import { misc } from "@/engine/lib/constants/items/misc";
import { EGameObjectRelation, GameObject, Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Break dialog for two participating objects.
 */
extern("dialogs.break_dialog", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  breakObjectDialog(getNpcSpeaker(firstSpeaker, secondSpeaker));
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
 * Transfer medkit for NPC from actor.
 */
extern("dialogs.transfer_medkit", (actor: GameObject, object: GameObject): void => {
  const availableMedkit: Optional<TMedkit> = getActorAvailableMedKit();

  if (availableMedkit !== null) {
    transferItemsFromActor(getNpcSpeaker(actor, object), availableMedkit);
  }

  registry.simulator.create(
    misc.medkit_script,
    object.position(),
    object.level_vertex_id(),
    object.game_vertex_id(),
    object.id()
  );

  enableObjectWoundedHealing(object);

  if (object.relation(actor) !== EGameObjectRelation.ENEMY) {
    object.set_relation(EGameObjectRelation.FRIEND, actor);
  }

  actor.change_character_reputation(10);
});

/**
 * Check whether actor has at least one bandage.
 */
extern("dialogs.actor_have_bandage", (): boolean => {
  return registry.actor.object(drugs.bandage) !== null;
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
 * Check if actor has at least 2000 money value.
 */
extern("dialogs.has_2000_money", (actor: GameObject): boolean => {
  return actor.money() >= 2000;
});

/**
 * Transfer pistol from actor to object
 */
extern("dialogs.transfer_any_pistol_from_actor", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  const pistol: Optional<GameObject> = getAnyObjectPistol(registry.actor);

  if (pistol) {
    registry.actor.transfer_item(pistol, getNpcSpeaker(firstSpeaker, secondSpeaker));
    NotificationManager.getInstance().sendItemRelocatedNotification(ENotificationDirection.OUT, pistol.section());
  }
});

/**
 * Checks if actor has any pistol item.
 */
extern("dialogs.have_actor_any_pistol", (): boolean => {
  return getAnyObjectPistol(registry.actor) !== null;
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
