import { level, patrol } from "xray16";
import { GameObject, ServerCreatureObject } from "xray16/alias";
import { abort, extern, Nillable, TIndex, TName, TSection } from "xray16/lib";
import { $isNil } from "xray16/macros";

import { registry } from "@/engine/core/database";

/**
 * Spawn corpse of provided section.
 * Spawn location is based on provided patrol name and patrol index.
 */
extern(
  "xr_effects.spawn_corpse",
  (_: GameObject, object: GameObject, [spawnSection, pathName, index]: [TSection, TName, Nillable<TIndex>]): void => {
    // logger.format("Spawn corpse: %s", params[0]);

    if ($isNil(spawnSection)) {
      abort("Wrong spawn section for 'spawn_corpse' function %s. For object %s", tostring(spawnSection), object.name());
    }

    if ($isNil(pathName)) {
      abort("Wrong path_name for 'spawn_corpse' function %s. For object %s", tostring(pathName), object.name());
    }

    if (!level.patrol_path_exists(pathName)) {
      abort("Path %s doesnt exist. Function 'spawn_corpse' for object %s ", tostring(pathName), object.name());
    }

    const patrolObject: patrol = new patrol(pathName);

    const serverObject: ServerCreatureObject = registry.simulator.create(
      spawnSection,
      patrolObject.point(index ?? 0),
      patrolObject.level_vertex_id(0),
      patrolObject.game_vertex_id(0)
    );

    serverObject.kill();
  }
);
