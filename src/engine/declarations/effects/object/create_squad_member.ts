import { patrol } from "xray16";
import { GameObject, Patrol, ServerCreatureObject, ServerHumanObject, Vector } from "xray16/alias";
import { abort, extern, LuaArray, Nillable, TNumberId, TSection, TStringId } from "xray16/lib";
import { $isNil, $isNotNil } from "xray16/macros";

import { getServerObjectByStoryId, registry, SYSTEM_INI } from "@/engine/core/database";
import { IConfigSwitchCondition, parseConditionsList, pickSectionFromCondList, readIniString } from "@/engine/core/ini";
import {
  getSimulationTerrainDescriptorById,
  setupSimulationObjectSquadAndGroup,
} from "@/engine/core/managers/simulation/utils";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import type { Squad } from "@/engine/core/objects/squad";

/**
 * Add a new member of the provided section to an existing squad referenced by story ID.
 *
 * Todo: Move member creation to squad / squad util.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object used when resolving the spawn point condition list.
 * @param params - Tuple of member section, squad story ID and Nillable spawn point name.
 */
extern(
  "xr_effects.create_squad_member",
  (actor: GameObject, object: GameObject, params: [TSection, TStringId, string]): void => {
    const squadMemberSection: TSection = params[0];
    const storyId: Nillable<TStringId> = params[1];

    let position: Nillable<Vector> = null;
    let levelVertexId: Nillable<TNumberId> = null;
    let gameVertexId: Nillable<TNumberId> = null;

    if ($isNil(storyId)) {
      abort("Wrong squad identificator [NIL] in 'create_squad_member' function");
    }

    const squad: Squad = getServerObjectByStoryId(storyId) as Squad;
    const squadTerrain: Nillable<SmartTerrain> = getSimulationTerrainDescriptorById(
      squad.assignedTerrainId as TNumberId
    )!.terrain;

    if ($isNotNil(params[2])) {
      let spawnPoint: TStringId;

      if (params[2] === "simulation_point") {
        const data: string = readIniString(SYSTEM_INI, squad.section_name(), "spawn_point", false);
        const condlist: LuaArray<IConfigSwitchCondition> =
          data === "" || $isNil(data)
            ? parseConditionsList(squadTerrain.spawnPointName as string)
            : parseConditionsList(data);

        spawnPoint = pickSectionFromCondList(actor, object, condlist) as TStringId;
      } else {
        spawnPoint = params[2];
      }

      const point: Patrol = new patrol(spawnPoint);

      position = point.point(0);
      levelVertexId = point.level_vertex_id(0);
      gameVertexId = point.game_vertex_id(0);
    } else {
      const commander: ServerHumanObject = registry.simulator.object(squad.commander_id()) as ServerHumanObject;

      position = commander.position;
      levelVertexId = commander.m_level_vertex_id;
      gameVertexId = commander.m_game_vertex_id;
    }

    const newSquadMember: ServerCreatureObject = squad.addMember(
      squadMemberSection,
      position,
      levelVertexId,
      gameVertexId
    );

    squad.assignMemberToTerrain(newSquadMember.id, squadTerrain, null);

    setupSimulationObjectSquadAndGroup(newSquadMember);

    // --squad_smart.refresh()
    squad.update();
  }
);
