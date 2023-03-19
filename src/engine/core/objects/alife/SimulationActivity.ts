import { XR_cse_alife_object } from "xray16";

import { SurgeManager } from "@/engine/core/managers/SurgeManager";
import { TravelManager } from "@/engine/core/managers/TravelManager";
import { Squad } from "@/engine/core/objects/alife/Squad";
import { hasAlifeInfo } from "@/engine/core/utils/info_portion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getServerDistanceBetween } from "@/engine/core/utils/object";
import { isInTimeInterval } from "@/engine/core/utils/time";
import { communities, TCommunity } from "@/engine/lib/constants/communities";
import { Optional, PartialRecord } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

export type TSimActivityPreconditionChecker = (squad: Squad, target: XR_cse_alife_object) => boolean;

export interface ISimActivityPrecondition {
  prec: TSimActivityPreconditionChecker;
}

export type TSimActivitySmartType = "surge" | "base" | "resource" | "territory" | "lair";

export interface ISimActivityDescriptor {
  squad: Optional<PartialRecord<TCommunity, Optional<ISimActivityPrecondition>>>;
  smart: Optional<PartialRecord<TSimActivitySmartType, Optional<ISimActivityPrecondition>>>;
  actor: Optional<ISimActivityPrecondition>;
}

export const simulation_activities: Record<TCommunity, ISimActivityDescriptor> = {
  [communities.none]: {
    squad: null,
    smart: null,
    actor: null,
  },
  [communities.stalker]: {
    squad: null,
    smart: {
      base: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(18, 8) &&
          !SurgeManager.getInstance().isStarted &&
          !TravelManager.getInstance().isEnemyWithSquadMember(squad) &&
          (target.name() === "zat_stalker_base_smart" || target.name() === "jup_a6" || target.name() === "pri_a16"),
      },
      surge: { prec: () => SurgeManager.getInstance().isStarted },
      territory: {
        prec: () => isInTimeInterval(8, 18) && !SurgeManager.getInstance().isStarted,
      },
      resource: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(8, 18) && !SurgeManager.getInstance().isStarted,
      },
    },
    actor: null,
  },
  [communities.bandit]: {
    squad: {
      stalker: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(8, 21) &&
          !SurgeManager.getInstance().isStarted &&
          getServerDistanceBetween(squad, target) <= 150,
      },
    },
    smart: {
      base: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(21, 8) &&
          !SurgeManager.getInstance().isStarted &&
          !TravelManager.getInstance().isEnemyWithSquadMember(squad) &&
          (target.name() === "zat_stalker_base_smart" || target.name() === "jup_a10_smart_terrain"),
      },
      territory: {
        prec: () => isInTimeInterval(8, 21) && !SurgeManager.getInstance().isStarted,
      },
      surge: { prec: () => SurgeManager.getInstance().isStarted },
      resource: null,
    },
    actor: {
      prec: (squad: Squad, target: XR_cse_alife_object) =>
        hasAlifeInfo("sim_bandit_attack_harder") && getServerDistanceBetween(squad, target) <= 150,
    },
  },
  [communities.dolg]: {
    squad: {
      freedom: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(8, 19) &&
          !SurgeManager.getInstance().isStarted &&
          getServerDistanceBetween(squad, target) <= 150,
      },
      monster_predatory_day: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(8, 19) &&
          !SurgeManager.getInstance().isStarted &&
          getServerDistanceBetween(squad, target) <= 150,
      },
      monster_predatory_night: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(8, 19) &&
          !SurgeManager.getInstance().isStarted &&
          getServerDistanceBetween(squad, target) <= 150,
      },
      monster_vegetarian: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(8, 19) &&
          !SurgeManager.getInstance().isStarted &&
          getServerDistanceBetween(squad, target) <= 150,
      },
      monster_zombied_day: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(8, 19) &&
          !SurgeManager.getInstance().isStarted &&
          getServerDistanceBetween(squad, target) <= 150,
      },
      monster_special: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(8, 19) &&
          !SurgeManager.getInstance().isStarted &&
          getServerDistanceBetween(squad, target) <= 150,
      },
    },
    smart: {
      base: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(19, 8) &&
          !SurgeManager.getInstance().isStarted &&
          !TravelManager.getInstance().isEnemyWithSquadMember(squad) &&
          (target.name() === "zat_stalker_base_smart" || target.name() === "jup_a6" || target.name() === "pri_a16"),
      },
      territory: {
        prec: () => isInTimeInterval(8, 19) && !SurgeManager.getInstance().isStarted,
      },
      surge: { prec: () => SurgeManager.getInstance().isStarted },
      resource: null,
    },
    actor: null,
  },
  [communities.freedom]: {
    squad: {
      dolg: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(8, 19) &&
          !SurgeManager.getInstance().isStarted &&
          getServerDistanceBetween(squad, target) <= 150,
      },
    },
    smart: {
      base: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(19, 8) &&
          !SurgeManager.getInstance().isStarted &&
          !TravelManager.getInstance().isEnemyWithSquadMember(squad) &&
          (target.name() === "zat_stalker_base_smart" || target.name() === "jup_a6" || target.name() === "pri_a16"),
      },
      territory: {
        prec: () => isInTimeInterval(8, 19) && !SurgeManager.getInstance().isStarted,
      },
      surge: { prec: () => SurgeManager.getInstance().isStarted },
      resource: null,
    },
    actor: null,
  },
  [communities.killer]: {
    squad: null,
    smart: {
      territory: { prec: () => !SurgeManager.getInstance().isStarted },
      base: null,
      resource: null,
      surge: { prec: () => SurgeManager.getInstance().isStarted },
    },
    actor: {
      prec: (squad: Squad, target: XR_cse_alife_object) => getServerDistanceBetween(squad, target) <= 150,
    },
  },
  [communities.zombied]: {
    squad: null,
    smart: { territory: { prec: () => true }, lair: { prec: () => true }, resource: null, base: null },
    actor: null,
  },
  [communities.monster_predatory_day]: {
    squad: {
      monster_vegetarian: { prec: () => isInTimeInterval(6, 19) },
      stalker: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(6, 19) && getServerDistanceBetween(squad, target) <= 150,
      },
      bandit: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(6, 19) && getServerDistanceBetween(squad, target) <= 150,
      },
      dolg: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(6, 19) && getServerDistanceBetween(squad, target) <= 150,
      },
      freedom: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(6, 19) && getServerDistanceBetween(squad, target) <= 150,
      },
      killer: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(6, 19) && getServerDistanceBetween(squad, target) <= 150,
      },
    },
    smart: {
      territory: { prec: () => isInTimeInterval(6, 19) },
      lair: { prec: () => isInTimeInterval(19, 6) },
      base: null,
      resource: null,
    },
    actor: {
      prec: (squad: Squad, target: XR_cse_alife_object) =>
        isInTimeInterval(6, 19) && getServerDistanceBetween(squad, target) <= 150,
    },
  },
  [communities.monster_predatory_night]: {
    squad: {
      monster_vegetarian: { prec: () => isInTimeInterval(21, 6) },
      stalker: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(19, 6) && getServerDistanceBetween(squad, target) <= 150,
      },
      bandit: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(19, 6) && getServerDistanceBetween(squad, target) <= 150,
      },
      dolg: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(19, 6) && getServerDistanceBetween(squad, target) <= 150,
      },
      freedom: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(19, 6) && getServerDistanceBetween(squad, target) <= 150,
      },
      killer: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(19, 6) && getServerDistanceBetween(squad, target) <= 150,
      },
    },
    smart: {
      territory: { prec: () => isInTimeInterval(19, 6) },
      lair: { prec: () => isInTimeInterval(6, 19) },
      base: null,
      resource: null,
    },
    actor: {
      prec: (squad: Squad, target: XR_cse_alife_object) =>
        isInTimeInterval(19, 6) && getServerDistanceBetween(squad, target) <= 150,
    },
  },
  [communities.monster_vegetarian]: {
    squad: null,
    smart: {
      lair: { prec: () => true },
      base: null,
      resource: null,
    },
    actor: {
      prec: (squad: Squad, target: XR_cse_alife_object) =>
        isInTimeInterval(6, 19) && getServerDistanceBetween(squad, target) <= 150,
    },
  },
  [communities.monster_zombied_day]: {
    squad: {
      stalker: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(6, 19) && getServerDistanceBetween(squad, target) <= 150,
      },
      bandit: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(6, 19) && getServerDistanceBetween(squad, target) <= 150,
      },
      dolg: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(6, 19) && getServerDistanceBetween(squad, target) <= 150,
      },
      freedom: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(6, 19) && getServerDistanceBetween(squad, target) <= 150,
      },
      killer: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(6, 19) && getServerDistanceBetween(squad, target) <= 150,
      },
    },
    smart: {
      territory: { prec: () => !SurgeManager.getInstance().isStarted },
      lair: { prec: () => isInTimeInterval(19, 6) },
      base: null,
      resource: null,
    },
    actor: {
      prec: (squad: Squad, target: XR_cse_alife_object) =>
        isInTimeInterval(6, 19) && getServerDistanceBetween(squad, target) <= 150,
    },
  },
  [communities.monster_zombied_night]: {
    squad: {
      stalker: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(19, 6) && getServerDistanceBetween(squad, target) <= 150,
      },
      bandit: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(19, 6) && getServerDistanceBetween(squad, target) <= 150,
      },
      dolg: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(19, 6) && getServerDistanceBetween(squad, target) <= 150,
      },
      freedom: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(19, 6) && getServerDistanceBetween(squad, target) <= 150,
      },
      killer: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(19, 6) && getServerDistanceBetween(squad, target) <= 150,
      },
    },
    smart: {
      territory: { prec: () => isInTimeInterval(19, 6) },
      lair: { prec: () => isInTimeInterval(6, 19) },
      base: null,
      resource: null,
    },
    actor: {
      prec: (squad: Squad, target: XR_cse_alife_object) =>
        isInTimeInterval(19, 6) && getServerDistanceBetween(squad, target) <= 150,
    },
  },
  [communities.monster_special]: {
    squad: null,
    smart: { lair: { prec: () => true }, base: null, resource: null },
    actor: null,
  },
  [communities.monster]: {
    squad: null,
    smart: { lair: { prec: () => true }, base: null, resource: null },
    actor: null,
  },
  [communities.army]: {
    squad: null,
    smart: {
      base: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(18, 8) && !SurgeManager.getInstance().isStarted,
      },
      surge: { prec: () => SurgeManager.getInstance().isStarted },
      territory: {
        prec: () => isInTimeInterval(8, 18) && !SurgeManager.getInstance().isStarted,
      },
      resource: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(8, 18) && !SurgeManager.getInstance().isStarted,
      },
    },
    actor: null,
  },
  [communities.ecolog]: {
    squad: null,
    smart: {
      base: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(18, 8) && !SurgeManager.getInstance().isStarted,
      },
      surge: { prec: () => SurgeManager.getInstance().isStarted },
      territory: {
        prec: () => isInTimeInterval(8, 18) && !SurgeManager.getInstance().isStarted,
      },
      resource: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(8, 18) && !SurgeManager.getInstance().isStarted,
      },
    },
    actor: null,
  },
  [communities.monolith]: {
    squad: null,
    smart: {
      base: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(18, 8) && !SurgeManager.getInstance().isStarted,
      },
      surge: { prec: () => SurgeManager.getInstance().isStarted },
      territory: {
        prec: () => isInTimeInterval(8, 18) && !SurgeManager.getInstance().isStarted,
      },
      resource: {
        prec: (squad: Squad, target: XR_cse_alife_object) =>
          isInTimeInterval(8, 18) && !SurgeManager.getInstance().isStarted,
      },
    },
    actor: null,
  },
};
