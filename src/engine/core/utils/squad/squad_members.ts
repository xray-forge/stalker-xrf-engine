import { GameObject, ServerCreatureObject, ServerGroupObject, ServerObject } from "xray16/alias";
import { LuaArray, Nillable } from "xray16/lib";
import { $isNil } from "xray16/macros";

import { registry } from "@/engine/core/database";

/**
 * List squad members before acting on them, as `squad_members()` walks the engine member list in place and a death or
 * unregister inside the loop shifts it, skipping and repeating members.
 *
 * @param squad - Squad to list.
 * @returns Its members at the time of the call.
 */
export function getSquadMembers(squad: ServerGroupObject): LuaArray<ServerCreatureObject> {
  const members: LuaArray<ServerCreatureObject> = new LuaTable();

  for (const member of squad.squad_members()) {
    table.insert(members, member.object);
  }

  return members;
}

/**
 * Kill a squad member: online members die on the client to run their death callbacks, offline ones die on the server
 * through their death handler, so their smart terrain, squad and listeners learn of it as of an online death, and the
 * body stays. Either way the member leaves its squad, so list the squad with {@link getSquadMembers} first.
 *
 * @param member - Squad member to kill.
 * @param killer - Object credited with an offline kill, the member itself by default.
 */
export function killSquadMember(member: ServerCreatureObject, killer: ServerObject = member): void {
  const object: Nillable<GameObject> = registry.objects.get(member.id)?.object;

  if ($isNil(object)) {
    member.on_death(killer);
  } else {
    object.kill(object);
  }
}
