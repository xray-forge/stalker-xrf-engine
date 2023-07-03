import { entity_action } from "xray16";

import { ClientObject, EntityAction, Optional, TEntityActionType, TIndex, TName } from "@/engine/lib/types";

/**
 * todo;
 */
export function action(object: Optional<ClientObject>, ...actions: Array<TEntityActionType>): EntityAction {
  const entityAction: EntityAction = new entity_action();
  let index: TIndex = 0;

  while (actions[index] !== null) {
    entityAction.set_action(actions[index]);
    index += 1;
  }

  if (object !== null) {
    object.command(entityAction, false);
  }

  // todo: Is copy needed?
  return new entity_action(entityAction);
}

/**
 * todo;
 */
export function interruptObjectAction(object: ClientObject, scriptName: TName): void {
  if (object.get_script()) {
    object.script(false, scriptName);
  }
}
