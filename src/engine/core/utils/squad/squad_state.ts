import { IRegistryObjectState, registry } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";
import { pickSectionFromCondList, readIniString, TConditionList } from "@/engine/core/utils/ini";
import { TRUE } from "@/engine/lib/constants/words";
import { GameObject, Optional } from "@/engine/lib/types";

/**
 * Updates squad members invulnerability state based on defined logics condlist.
 * Updates each squad member separately and verifies each object has own section logics.
 *
 * @param squad - target squad object to update invulnerability state
 */
export function updateSquadInvulnerabilityState(squad: Squad): void {
  if (!squad.online) {
    return;
  }

  const invulnerability: boolean =
    pickSectionFromCondList(registry.actor, squad, squad.invulnerability as TConditionList) === TRUE;

  for (const squadMember of squad.squad_members()) {
    const objectState: Optional<IRegistryObjectState> = registry.objects.get(squadMember.id);

    if (objectState !== null) {
      const object: GameObject = objectState.object;

      if (
        object.invulnerable() !== invulnerability &&
        // Not separate invulnerability state of object, whether squad logics can override it.
        readIniString(objectState.ini, objectState.activeSection, "invulnerable", false) === null
      ) {
        object.invulnerable(invulnerability);
      }
    }
  }
}
