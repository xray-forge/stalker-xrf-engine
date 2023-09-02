import { registry } from "@/engine/core/database";
import {
  simulationPreconditionAlways,
  simulationPreconditionDay,
  simulationPreconditionNear,
  simulationPreconditionNearAndDay,
  simulationPreconditionNearAndNight,
  simulationPreconditionNight,
  simulationPreconditionNotSurge,
  simulationPreconditionSurge,
} from "@/engine/core/managers/simulation/simulation_preconditions";
import { ESimulationRole, ISimulationActivityDescriptor } from "@/engine/core/managers/simulation/simulation_types";
import { SmartTerrain } from "@/engine/core/objects";
import { Squad } from "@/engine/core/objects/server/squad/Squad";
import { isInTimeInterval } from "@/engine/core/utils/game/game_time";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getServerDistanceBetween } from "@/engine/core/utils/object";
import { hasAlifeInfo } from "@/engine/core/utils/object/object_info_portion";
import { isAnySquadMemberEnemyToActor } from "@/engine/core/utils/relation";
import { communities, TCommunity } from "@/engine/lib/constants/communities";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { storyNames } from "@/engine/lib/constants/story_names";
import { ServerObject, TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Descriptor of faction activities based on simulation role.
 */
export const simulationActivities: LuaTable<TCommunity, ISimulationActivityDescriptor> = $fromObject({
  [communities.none]: {
    [ESimulationRole.SQUAD]: null,
    [ESimulationRole.SMART_TERRAIN]: null,
    [ESimulationRole.ACTOR]: null,
  },
  [communities.stalker]: {
    [ESimulationRole.ACTOR]: null,
    [ESimulationRole.SMART_TERRAIN]: {
      base: {
        canSelect: (squad: Squad, target: SmartTerrain) => {
          return (
            isInTimeInterval(18, 8) &&
            !registry.isSurgeStarted &&
            !isAnySquadMemberEnemyToActor(squad) &&
            registry.baseSmartTerrains.get(target.name()) !== null
          );
        },
      },
      surge: { canSelect: () => registry.isSurgeStarted },
      territory: {
        canSelect: () => isInTimeInterval(8, 18) && !registry.isSurgeStarted,
      },
      resource: {
        canSelect: (squad: Squad, target: ServerObject) => isInTimeInterval(8, 18) && !registry.isSurgeStarted,
      },
    },
    [ESimulationRole.SQUAD]: null,
  },
  [communities.bandit]: {
    [ESimulationRole.SQUAD]: {
      stalker: {
        canSelect: (squad: Squad, target: ServerObject) =>
          isInTimeInterval(8, 21) && !registry.isSurgeStarted && getServerDistanceBetween(squad, target) <= 150,
      },
    },
    [ESimulationRole.SMART_TERRAIN]: {
      base: {
        canSelect: (squad: Squad, target: ServerObject) => {
          const smartName: TName = target.name();

          return (
            isInTimeInterval(21, 8) &&
            !registry.isSurgeStarted &&
            !isAnySquadMemberEnemyToActor(squad) &&
            (smartName === storyNames.zat_stalker_base_smart || smartName === storyNames.jup_a10_smart_terrain)
          );
        },
      },
      territory: {
        canSelect: () => isInTimeInterval(8, 21) && !registry.isSurgeStarted,
      },
      surge: { canSelect: () => registry.isSurgeStarted },
      resource: null,
    },
    [ESimulationRole.ACTOR]: {
      canSelect: (squad: Squad, target: ServerObject) =>
        hasAlifeInfo(infoPortions.sim_bandit_attack_harder) && getServerDistanceBetween(squad, target) <= 150,
    },
  },
  [communities.dolg]: {
    [ESimulationRole.SQUAD]: {
      freedom: {
        canSelect: (squad: Squad, target: ServerObject) =>
          isInTimeInterval(8, 19) && !registry.isSurgeStarted && getServerDistanceBetween(squad, target) <= 150,
      },
      monster_predatory_day: {
        canSelect: (squad: Squad, target: ServerObject) =>
          isInTimeInterval(8, 19) && !registry.isSurgeStarted && getServerDistanceBetween(squad, target) <= 150,
      },
      monster_predatory_night: {
        canSelect: (squad: Squad, target: ServerObject) =>
          isInTimeInterval(8, 19) && !registry.isSurgeStarted && getServerDistanceBetween(squad, target) <= 150,
      },
      monster_vegetarian: {
        canSelect: (squad: Squad, target: ServerObject) =>
          isInTimeInterval(8, 19) && !registry.isSurgeStarted && getServerDistanceBetween(squad, target) <= 150,
      },
      monster_zombied_day: {
        canSelect: (squad: Squad, target: ServerObject) =>
          isInTimeInterval(8, 19) && !registry.isSurgeStarted && getServerDistanceBetween(squad, target) <= 150,
      },
      monster_special: {
        canSelect: (squad: Squad, target: ServerObject) =>
          isInTimeInterval(8, 19) && !registry.isSurgeStarted && getServerDistanceBetween(squad, target) <= 150,
      },
    },
    [ESimulationRole.SMART_TERRAIN]: {
      base: {
        canSelect: (squad: Squad, target: ServerObject) =>
          isInTimeInterval(19, 8) &&
          !registry.isSurgeStarted &&
          !isAnySquadMemberEnemyToActor(squad) &&
          (target.name() === storyNames.zat_stalker_base_smart ||
            target.name() === storyNames.jup_a6 ||
            target.name() === storyNames.pri_a16),
      },
      territory: {
        canSelect: () => isInTimeInterval(8, 19) && !registry.isSurgeStarted,
      },
      surge: { canSelect: simulationPreconditionSurge },
      resource: null,
    },
    [ESimulationRole.ACTOR]: null,
  },
  [communities.freedom]: {
    [ESimulationRole.SQUAD]: {
      dolg: {
        canSelect: (squad: Squad, target: ServerObject) =>
          isInTimeInterval(8, 19) && !registry.isSurgeStarted && getServerDistanceBetween(squad, target) <= 150,
      },
    },
    [ESimulationRole.SMART_TERRAIN]: {
      base: {
        canSelect: (squad: Squad, target: ServerObject) =>
          isInTimeInterval(19, 8) &&
          !registry.isSurgeStarted &&
          !isAnySquadMemberEnemyToActor(squad) &&
          (target.name() === storyNames.zat_stalker_base_smart ||
            target.name() === storyNames.jup_a6 ||
            target.name() === storyNames.pri_a16),
      },
      territory: {
        canSelect: () => isInTimeInterval(8, 19) && !registry.isSurgeStarted,
      },
      surge: { canSelect: simulationPreconditionSurge },
      resource: null,
    },
    [ESimulationRole.ACTOR]: null,
  },
  [communities.killer]: {
    [ESimulationRole.SQUAD]: null,
    [ESimulationRole.SMART_TERRAIN]: {
      territory: { canSelect: simulationPreconditionNotSurge },
      base: null,
      resource: null,
      surge: { canSelect: simulationPreconditionSurge },
    },
    [ESimulationRole.ACTOR]: {
      canSelect: simulationPreconditionNear,
    },
  },
  [communities.zombied]: {
    [ESimulationRole.SQUAD]: null,
    [ESimulationRole.SMART_TERRAIN]: {
      territory: { canSelect: simulationPreconditionAlways },
      lair: { canSelect: simulationPreconditionAlways },
      resource: null,
      base: null,
    },
    [ESimulationRole.ACTOR]: null,
  },
  [communities.monster_predatory_day]: {
    [ESimulationRole.SQUAD]: {
      monster_vegetarian: { canSelect: simulationPreconditionDay },
      stalker: {
        canSelect: simulationPreconditionNearAndDay,
      },
      bandit: {
        canSelect: simulationPreconditionNearAndDay,
      },
      dolg: {
        canSelect: simulationPreconditionNearAndDay,
      },
      freedom: {
        canSelect: simulationPreconditionNearAndDay,
      },
      killer: {
        canSelect: simulationPreconditionNearAndDay,
      },
    },
    [ESimulationRole.SMART_TERRAIN]: {
      territory: { canSelect: simulationPreconditionDay },
      lair: { canSelect: simulationPreconditionNight },
      base: null,
      resource: null,
    },
    [ESimulationRole.ACTOR]: {
      canSelect: simulationPreconditionNearAndDay,
    },
  },
  [communities.monster_predatory_night]: {
    [ESimulationRole.SQUAD]: {
      monster_vegetarian: { canSelect: simulationPreconditionNight },
      stalker: {
        canSelect: simulationPreconditionNearAndNight,
      },
      bandit: {
        canSelect: simulationPreconditionNearAndNight,
      },
      dolg: {
        canSelect: simulationPreconditionNearAndNight,
      },
      freedom: {
        canSelect: simulationPreconditionNearAndNight,
      },
      killer: {
        canSelect: simulationPreconditionNearAndNight,
      },
    },
    [ESimulationRole.SMART_TERRAIN]: {
      territory: { canSelect: simulationPreconditionNight },
      lair: { canSelect: simulationPreconditionDay },
      base: null,
      resource: null,
    },
    [ESimulationRole.ACTOR]: {
      canSelect: simulationPreconditionNearAndNight,
    },
  },
  [communities.monster_vegetarian]: {
    [ESimulationRole.SQUAD]: null,
    [ESimulationRole.SMART_TERRAIN]: {
      lair: { canSelect: simulationPreconditionAlways },
      base: null,
      resource: null,
    },
    [ESimulationRole.ACTOR]: {
      canSelect: simulationPreconditionNearAndDay,
    },
  },
  [communities.monster_zombied_day]: {
    [ESimulationRole.SQUAD]: {
      stalker: {
        canSelect: simulationPreconditionNearAndDay,
      },
      bandit: {
        canSelect: simulationPreconditionNearAndDay,
      },
      dolg: {
        canSelect: simulationPreconditionNearAndDay,
      },
      freedom: {
        canSelect: simulationPreconditionNearAndDay,
      },
      killer: {
        canSelect: simulationPreconditionNearAndDay,
      },
    },
    [ESimulationRole.SMART_TERRAIN]: {
      territory: { canSelect: simulationPreconditionNotSurge },
      lair: { canSelect: simulationPreconditionNight },
      base: null,
      resource: null,
    },
    [ESimulationRole.ACTOR]: {
      canSelect: simulationPreconditionNearAndDay,
    },
  },
  [communities.monster_zombied_night]: {
    [ESimulationRole.SQUAD]: {
      stalker: {
        canSelect: simulationPreconditionNearAndNight,
      },
      bandit: {
        canSelect: simulationPreconditionNearAndNight,
      },
      dolg: {
        canSelect: simulationPreconditionNearAndNight,
      },
      freedom: {
        canSelect: simulationPreconditionNearAndNight,
      },
      killer: {
        canSelect: simulationPreconditionNearAndNight,
      },
    },
    [ESimulationRole.SMART_TERRAIN]: {
      territory: { canSelect: simulationPreconditionNight },
      lair: { canSelect: simulationPreconditionDay },
      base: null,
      resource: null,
    },
    [ESimulationRole.ACTOR]: {
      canSelect: simulationPreconditionNearAndNight,
    },
  },
  [communities.monster_special]: {
    [ESimulationRole.SQUAD]: null,
    [ESimulationRole.SMART_TERRAIN]: { lair: { canSelect: () => true }, base: null, resource: null },
    [ESimulationRole.ACTOR]: null,
  },
  [communities.monster]: {
    [ESimulationRole.SQUAD]: null,
    [ESimulationRole.SMART_TERRAIN]: { lair: { canSelect: () => true }, base: null, resource: null },
    [ESimulationRole.ACTOR]: null,
  },
  [communities.army]: {
    [ESimulationRole.SQUAD]: null,
    [ESimulationRole.SMART_TERRAIN]: {
      base: {
        canSelect: (squad: Squad, target: ServerObject) => isInTimeInterval(18, 8) && !registry.isSurgeStarted,
      },
      surge: { canSelect: () => registry.isSurgeStarted },
      territory: {
        canSelect: () => isInTimeInterval(8, 18) && !registry.isSurgeStarted,
      },
      resource: {
        canSelect: (squad: Squad, target: ServerObject) => isInTimeInterval(8, 18) && !registry.isSurgeStarted,
      },
    },
    [ESimulationRole.ACTOR]: null,
  },
  [communities.ecolog]: {
    [ESimulationRole.SQUAD]: null,
    [ESimulationRole.SMART_TERRAIN]: {
      base: {
        canSelect: (squad: Squad, target: ServerObject) => isInTimeInterval(18, 8) && !registry.isSurgeStarted,
      },
      surge: { canSelect: () => registry.isSurgeStarted },
      territory: {
        canSelect: () => isInTimeInterval(8, 18) && !registry.isSurgeStarted,
      },
      resource: {
        canSelect: (squad: Squad, target: ServerObject) => isInTimeInterval(8, 18) && !registry.isSurgeStarted,
      },
    },
    [ESimulationRole.ACTOR]: null,
  },
  [communities.monolith]: {
    [ESimulationRole.SQUAD]: null,
    [ESimulationRole.SMART_TERRAIN]: {
      base: {
        canSelect: (squad: Squad, target: ServerObject) => isInTimeInterval(18, 8) && !registry.isSurgeStarted,
      },
      surge: { canSelect: simulationPreconditionSurge },
      territory: {
        canSelect: () => isInTimeInterval(8, 18) && !registry.isSurgeStarted,
      },
      resource: {
        canSelect: (squad: Squad, target: ServerObject) => isInTimeInterval(8, 18) && !registry.isSurgeStarted,
      },
    },
    [ESimulationRole.ACTOR]: null,
  },
}) as LuaTable<TCommunity, ISimulationActivityDescriptor>;
