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
import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain";
import { Squad } from "@/engine/core/objects/server/squad/Squad";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getServerDistanceBetween } from "@/engine/core/utils/position";
import { isAnySquadMemberEnemyToActor } from "@/engine/core/utils/relation";
import { isInTimeInterval } from "@/engine/core/utils/time";
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
      base: (squad: Squad, target: SmartTerrain) => {
        return (
          isInTimeInterval(18, 8) &&
          !surgeConfig.IS_STARTED &&
          !isAnySquadMemberEnemyToActor(squad) &&
          registry.baseSmartTerrains.get(target.name()) !== null
        );
      },
      surge: simulationPreconditionSurge,
      territory: () => isInTimeInterval(8, 18) && !surgeConfig.IS_STARTED,
      resource: () => isInTimeInterval(8, 18) && !surgeConfig.IS_STARTED,
    },
    [ESimulationRole.SQUAD]: null,
  },
  [communities.bandit]: {
    [ESimulationRole.SQUAD]: {
      stalker: (squad: Squad, target: ServerObject) =>
        isInTimeInterval(8, 21) && !surgeConfig.IS_STARTED && getServerDistanceBetween(squad, target) <= 150,
    },
    [ESimulationRole.SMART_TERRAIN]: {
      base: (squad: Squad, target: ServerObject) => {
        const smartName: TName = target.name();

        return (
          isInTimeInterval(21, 8) &&
          !surgeConfig.IS_STARTED &&
          !isAnySquadMemberEnemyToActor(squad) &&
          (smartName === storyNames.zat_stalker_base_smart || smartName === storyNames.jup_a10_smart_terrain)
        );
      },
      territory: () => isInTimeInterval(8, 21) && !surgeConfig.IS_STARTED,
      surge: simulationPreconditionSurge,
      resource: null,
    },
    [ESimulationRole.ACTOR]: (squad: Squad, target: ServerObject) =>
      hasInfoPortion(infoPortions.sim_bandit_attack_harder) && getServerDistanceBetween(squad, target) <= 150,
  },
  [communities.dolg]: {
    [ESimulationRole.SQUAD]: {
      freedom: (squad: Squad, target: ServerObject) =>
        isInTimeInterval(8, 19) && !surgeConfig.IS_STARTED && getServerDistanceBetween(squad, target) <= 150,
      monster_predatory_day: (squad: Squad, target: ServerObject) =>
        isInTimeInterval(8, 19) && !surgeConfig.IS_STARTED && getServerDistanceBetween(squad, target) <= 150,
      monster_predatory_night: (squad: Squad, target: ServerObject) =>
        isInTimeInterval(8, 19) && !surgeConfig.IS_STARTED && getServerDistanceBetween(squad, target) <= 150,
      monster_vegetarian: (squad: Squad, target: ServerObject) =>
        isInTimeInterval(8, 19) && !surgeConfig.IS_STARTED && getServerDistanceBetween(squad, target) <= 150,
      monster_zombied_day: (squad: Squad, target: ServerObject) =>
        isInTimeInterval(8, 19) && !surgeConfig.IS_STARTED && getServerDistanceBetween(squad, target) <= 150,
      monster_special: (squad: Squad, target: ServerObject) =>
        isInTimeInterval(8, 19) && !surgeConfig.IS_STARTED && getServerDistanceBetween(squad, target) <= 150,
    },
    [ESimulationRole.SMART_TERRAIN]: {
      base: (squad: Squad, target: ServerObject) =>
        isInTimeInterval(19, 8) &&
        !surgeConfig.IS_STARTED &&
        !isAnySquadMemberEnemyToActor(squad) &&
        (target.name() === storyNames.zat_stalker_base_smart ||
          target.name() === storyNames.jup_a6 ||
          target.name() === storyNames.pri_a16),
      territory: () => isInTimeInterval(8, 19) && !surgeConfig.IS_STARTED,
      surge: simulationPreconditionSurge,
      resource: null,
    },
    [ESimulationRole.ACTOR]: null,
  },
  [communities.freedom]: {
    [ESimulationRole.SQUAD]: {
      dolg: (squad: Squad, target: ServerObject) =>
        isInTimeInterval(8, 19) && !surgeConfig.IS_STARTED && getServerDistanceBetween(squad, target) <= 150,
    },
    [ESimulationRole.SMART_TERRAIN]: {
      base: (squad: Squad, target: ServerObject) =>
        isInTimeInterval(19, 8) &&
        !surgeConfig.IS_STARTED &&
        !isAnySquadMemberEnemyToActor(squad) &&
        (target.name() === storyNames.zat_stalker_base_smart ||
          target.name() === storyNames.jup_a6 ||
          target.name() === storyNames.pri_a16),
      territory: () => isInTimeInterval(8, 19) && !surgeConfig.IS_STARTED,
      surge: simulationPreconditionSurge,
      resource: null,
    },
    [ESimulationRole.ACTOR]: null,
  },
  [communities.killer]: {
    [ESimulationRole.SQUAD]: null,
    [ESimulationRole.SMART_TERRAIN]: {
      territory: simulationPreconditionNotSurge,
      base: null,
      resource: null,
      surge: simulationPreconditionSurge,
    },
    [ESimulationRole.ACTOR]: simulationPreconditionNear,
  },
  [communities.zombied]: {
    [ESimulationRole.SQUAD]: null,
    [ESimulationRole.SMART_TERRAIN]: {
      territory: simulationPreconditionAlways,
      lair: simulationPreconditionAlways,
      resource: null,
      base: null,
    },
    [ESimulationRole.ACTOR]: null,
  },
  [communities.monster_predatory_day]: {
    [ESimulationRole.SQUAD]: {
      monster_vegetarian: simulationPreconditionDay,
      stalker: simulationPreconditionNearAndDay,
      bandit: simulationPreconditionNearAndDay,
      dolg: simulationPreconditionNearAndDay,
      freedom: simulationPreconditionNearAndDay,
      killer: simulationPreconditionNearAndDay,
    },
    [ESimulationRole.SMART_TERRAIN]: {
      territory: simulationPreconditionDay,
      lair: simulationPreconditionNight,
      base: null,
      resource: null,
    },
    [ESimulationRole.ACTOR]: simulationPreconditionNearAndDay,
  },
  [communities.monster_predatory_night]: {
    [ESimulationRole.SQUAD]: {
      monster_vegetarian: simulationPreconditionNight,
      stalker: simulationPreconditionNearAndNight,
      bandit: simulationPreconditionNearAndNight,
      dolg: simulationPreconditionNearAndNight,
      freedom: simulationPreconditionNearAndNight,
      killer: simulationPreconditionNearAndNight,
    },
    [ESimulationRole.SMART_TERRAIN]: {
      territory: simulationPreconditionNight,
      lair: simulationPreconditionDay,
      base: null,
      resource: null,
    },
    [ESimulationRole.ACTOR]: simulationPreconditionNearAndNight,
  },
  [communities.monster_vegetarian]: {
    [ESimulationRole.SQUAD]: null,
    [ESimulationRole.SMART_TERRAIN]: {
      lair: simulationPreconditionAlways,
      base: null,
      resource: null,
    },
    [ESimulationRole.ACTOR]: simulationPreconditionNearAndDay,
  },
  [communities.monster_zombied_day]: {
    [ESimulationRole.SQUAD]: {
      stalker: simulationPreconditionNearAndDay,
      bandit: simulationPreconditionNearAndDay,
      dolg: simulationPreconditionNearAndDay,
      freedom: simulationPreconditionNearAndDay,
      killer: simulationPreconditionNearAndDay,
    },
    [ESimulationRole.SMART_TERRAIN]: {
      territory: simulationPreconditionNotSurge,
      lair: simulationPreconditionNight,
      base: null,
      resource: null,
    },
    [ESimulationRole.ACTOR]: simulationPreconditionNearAndDay,
  },
  [communities.monster_zombied_night]: {
    [ESimulationRole.SQUAD]: {
      stalker: simulationPreconditionNearAndNight,
      bandit: simulationPreconditionNearAndNight,
      dolg: simulationPreconditionNearAndNight,
      freedom: simulationPreconditionNearAndNight,
      killer: simulationPreconditionNearAndNight,
    },
    [ESimulationRole.SMART_TERRAIN]: {
      territory: simulationPreconditionNight,
      lair: simulationPreconditionDay,
      base: null,
      resource: null,
    },
    [ESimulationRole.ACTOR]: simulationPreconditionNearAndNight,
  },
  [communities.monster_special]: {
    [ESimulationRole.SQUAD]: null,
    [ESimulationRole.SMART_TERRAIN]: { lair: simulationPreconditionAlways, base: null, resource: null },
    [ESimulationRole.ACTOR]: null,
  },
  [communities.monster]: {
    [ESimulationRole.SQUAD]: null,
    [ESimulationRole.SMART_TERRAIN]: { lair: simulationPreconditionAlways, base: null, resource: null },
    [ESimulationRole.ACTOR]: null,
  },
  [communities.army]: {
    [ESimulationRole.SQUAD]: null,
    [ESimulationRole.SMART_TERRAIN]: {
      base: () => isInTimeInterval(18, 8) && !surgeConfig.IS_STARTED,
      surge: simulationPreconditionSurge,
      territory: () => isInTimeInterval(8, 18) && !surgeConfig.IS_STARTED,
      resource: () => isInTimeInterval(8, 18) && !surgeConfig.IS_STARTED,
    },
    [ESimulationRole.ACTOR]: null,
  },
  [communities.ecolog]: {
    [ESimulationRole.SQUAD]: null,
    [ESimulationRole.SMART_TERRAIN]: {
      base: () => isInTimeInterval(18, 8) && !surgeConfig.IS_STARTED,
      surge: simulationPreconditionSurge,
      territory: () => isInTimeInterval(8, 18) && !surgeConfig.IS_STARTED,
      resource: () => isInTimeInterval(8, 18) && !surgeConfig.IS_STARTED,
    },
    [ESimulationRole.ACTOR]: null,
  },
  [communities.monolith]: {
    [ESimulationRole.SQUAD]: null,
    [ESimulationRole.SMART_TERRAIN]: {
      base: () => isInTimeInterval(18, 8) && !surgeConfig.IS_STARTED,
      surge: simulationPreconditionSurge,
      territory: () => isInTimeInterval(8, 18) && !surgeConfig.IS_STARTED,
      resource: () => isInTimeInterval(8, 18) && !surgeConfig.IS_STARTED,
    },
    [ESimulationRole.ACTOR]: null,
  },
}) as LuaTable<TCommunity, ISimulationActivityDescriptor>;
