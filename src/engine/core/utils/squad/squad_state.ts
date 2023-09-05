import { IRegistryObjectState, registry } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/server/squad";
import { pickSectionFromCondList, readIniString, TConditionList } from "@/engine/core/utils/ini";
import { TRUE } from "@/engine/lib/constants/words";
import { ClientObject } from "@/engine/lib/types";

/**
 * todo;
 */
export function updateSquadInvulnerabilityState(squad: Squad): void {
  if (!squad.isSquadOnline) {
    return;
  }

  const invulnerability: boolean =
    pickSectionFromCondList(registry.actor, squad, squad.invulnerability as TConditionList) === TRUE;

  for (const squadMember of squad.squad_members()) {
    const objectState: IRegistryObjectState = registry.objects.get(squadMember.id);

    if (objectState !== null) {
      const object: ClientObject = objectState.object;

      if (
        object.invulnerable() !== invulnerability &&
        readIniString(objectState.ini, objectState.activeSection, "invulnerable", false, "", null) === null
      ) {
        object.invulnerable(invulnerability);
      }
    }
  }
}
