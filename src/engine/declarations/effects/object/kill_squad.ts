import { GameObject, ServerHumanObject } from "xray16/alias";
import { assert, extern, Nillable, TNumberId, TStringId } from "xray16/lib";
import { $isNil } from "xray16/macros";

import { getServerObjectByStoryId, registry } from "@/engine/core/database";
import type { Squad } from "@/engine/core/objects/squad";

/**
 * Kill every member of the squad referenced by the provided story ID.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object owning the logics scheme.
 * @param p - Tuple containing the story ID of the squad to kill.
 */
extern("xr_effects.kill_squad", (actor: GameObject, object: GameObject, p: [Nillable<TStringId>]): void => {
  const storyId: Nillable<TStringId> = p[0];

  assert(storyId, "Wrong squad identification [NIL] in kill_squad function");

  const squad: Nillable<Squad> = getServerObjectByStoryId(storyId);

  if (!squad) {
    return;
  }

  const squadObjects: LuaTable<TNumberId, boolean> = new LuaTable();

  for (const k of squad.squad_members()) {
    squadObjects.set(k.id, true);
  }

  for (const [k] of squadObjects) {
    const gameObject: Nillable<GameObject> = registry.objects.get(k)?.object;

    if ($isNil(gameObject)) {
      registry.simulator.object<ServerHumanObject>(tonumber(k)!)!.kill();
    } else {
      gameObject.kill(gameObject);
    }
  }
});
