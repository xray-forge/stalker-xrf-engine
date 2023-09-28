import { hit, level } from "xray16";

import { isStoryObject, registry } from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/actor";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { SimulationBoardManager } from "@/engine/core/managers/simulation";
import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import {
  canSurgeKillSquad,
  getNearestAvailableSurgeCover,
  getOnlineSurgeCoversList,
} from "@/engine/core/managers/surge/utils/surge_cover";
import { pickSectionFromCondList } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { hasAlifeInfo, isImmuneToSurgeObject, isObjectOnLevel } from "@/engine/core/utils/object";
import { animations, postProcessors } from "@/engine/lib/constants/animation";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { TLevel } from "@/engine/lib/constants/levels";
import { Z_VECTOR } from "@/engine/lib/constants/vectors";
import { TRUE } from "@/engine/lib/constants/words";
import { ClientObject, Hit, LuaArray, Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo: Description.
 */
export function killAllSurgeUnhiddenAfterActorDeath(): void {
  const simulationBoardManager: SimulationBoardManager = SimulationBoardManager.getInstance();
  const levelName: TLevel = level.name();

  const activeCovers: LuaArray<ClientObject> = getOnlineSurgeCoversList();

  for (const [, squad] of simulationBoardManager.getSquads()) {
    if (isObjectOnLevel(squad, levelName) && !isImmuneToSurgeObject(squad)) {
      for (const member of squad.squad_members()) {
        let isInCover: boolean = false;

        for (const [, coverObject] of activeCovers) {
          if (coverObject.inside(member.object.position)) {
            isInCover = true;
            break;
          }
        }

        if (!isInCover) {
          logger.info(
            "Releasing object from squad after actors death because of surge:",
            member.object.name(),
            squad.name()
          );

          const clientObject: Optional<ClientObject> = level.object_by_id(member.object.id);

          // todo: What is the difference here?
          if (clientObject === null) {
            member.object.kill();
          } else {
            clientObject.kill(clientObject);
          }
        }
      }
    }
  }
}

/**
 * todo: Description.
 */
export function killAllSurgeUnhidden(): void {
  logger.info("Kill all surge not unhidden");

  const actor: ClientObject = registry.actor;
  const surgeHit: Hit = new hit();

  surgeHit.type = hit.fire_wound;
  surgeHit.power = 0.9;
  surgeHit.impulse = 0.0;
  surgeHit.direction = Z_VECTOR;
  surgeHit.draftsman = actor;

  logger.info("Kill crows");

  for (const [, id] of registry.crows.storage) {
    const object: Optional<ClientObject> = registry.objects.get(id)?.object;

    if (object.alive()) {
      object.hit(surgeHit);
    }
  }

  const simulationBoardManager: SimulationBoardManager = SimulationBoardManager.getInstance();
  const levelName: TLevel = level.name();
  const surgeCovers: LuaArray<ClientObject> = getOnlineSurgeCoversList();

  logger.info("Releasing squads");

  for (const [, squad] of simulationBoardManager.getSquads()) {
    if (isObjectOnLevel(squad, levelName) && !isImmuneToSurgeObject(squad) && !isStoryObject(squad)) {
      for (const member of squad.squad_members()) {
        if (!isStoryObject(member.object)) {
          if (canSurgeKillSquad(squad)) {
            logger.info("Releasing object from squad because of surge:", member.object.name(), squad.name());

            const clientObject: Optional<ClientObject> = level.object_by_id(member.object.id);

            if (clientObject === null) {
              member.object.kill();
            } else {
              clientObject.kill(clientObject);
            }
          } else {
            let release = true;

            // Check if is in cover.
            for (const [, coverObject] of surgeCovers) {
              if (coverObject.inside(member.object.position)) {
                release = false;
                break;
              }
            }

            if (release) {
              logger.info("Releasing object from squad because of surge:", member.object.name(), squad.name());

              const clientObject = level.object_by_id(member.object.id);

              if (clientObject !== null) {
                clientObject.kill(clientObject);
              } else {
                member.object.kill();
              }
            }
          }
        }
      }
    }
  }

  if (actor.alive()) {
    const coverObject: Optional<ClientObject> = getNearestAvailableSurgeCover(actor);

    if (!coverObject?.inside(actor.position())) {
      if (hasAlifeInfo(infoPortions.anabiotic_in_process)) {
        EventsManager.emitEvent(EGameEvent.SURGE_SURVIVED_WITH_ANABIOTIC);
      }

      ActorInputManager.getInstance().disableGameUiOnly();

      /**
       * Whether actor should survive surge.
       */
      if (pickSectionFromCondList(actor, null, surgeConfig.CAN_SURVIVE_SURGE) === TRUE) {
        level.add_cam_effector(
          animations.camera_effects_surge_02,
          surgeConfig.SLEEP_CAM_EFFECTOR_ID,
          false,
          "engine.surge_survive_start"
        );
        level.add_pp_effector(postProcessors.surge_fade, surgeConfig.SLEEP_FADE_PP_EFFECTOR_ID, false);
        actor.health -= 0.05;
      } else {
        killAllSurgeUnhiddenAfterActorDeath();
        actor.kill(actor);
      }
    }
  }
}
