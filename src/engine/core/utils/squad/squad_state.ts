import { GameObject } from "xray16/alias";
import { Nillable, TRUE } from "xray16/lib";
import { $isNil, $isNotNil } from "xray16/macros";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";
import { pickSectionFromCondList, readIniString, TConditionList } from "@/engine/core/utils/ini";

/**
 * Updates squad members invulnerability state based on defined logics condlist.
 * Updates each squad member separately and verifies each object has own section logics.
 *
 * @param squad - Target squad object to update invulnerability state.
 */
export function updateSquadInvulnerabilityState(squad: Squad): void {
  if (!squad.online) {
    return;
  }

  const invulnerability: boolean =
    pickSectionFromCondList(registry.actor, squad, squad.invulnerabilityConditionList as TConditionList) === TRUE;

  for (const squadMember of squad.squad_members()) {
    const objectState: Nillable<IRegistryObjectState> = registry.objects.get(squadMember.id);

    if ($isNotNil(objectState)) {
      const object: GameObject = objectState.object;

      if (
        object.invulnerable() !== invulnerability &&
        // Not separate invulnerability state of object, whether squad logics can override it.
        $isNil(readIniString(objectState.ini, objectState.activeSection, "invulnerable", false))
      ) {
        object.invulnerable(invulnerability);
      }
    }
  }
}
