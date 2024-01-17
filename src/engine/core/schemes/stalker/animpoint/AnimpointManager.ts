import { level } from "xray16";

import { campConfig, CampManager, EObjectCampActivity } from "@/engine/core/ai/camp";
import { AbstractSchemeManager } from "@/engine/core/ai/scheme";
import {
  animpoint_predicates,
  animpointPredicateAlways,
} from "@/engine/core/animation/predicates/animpoint_predicates";
import { states } from "@/engine/core/animation/states";
import { EStalkerState, WEAPON_POSTFIX } from "@/engine/core/animation/types";
import { getCampZoneForPosition, registry } from "@/engine/core/database";
import { SmartCover } from "@/engine/core/objects/smart_cover";
import {
  IAnimpointActionDescriptor,
  ISchemeAnimpointState,
} from "@/engine/core/schemes/stalker/animpoint/animpoint_types";
import { assert } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { angleToDirection, createVector } from "@/engine/core/utils/vector";
import { GameObject, LuaArray, Optional, TIndex, TName, TNumberId, TRate, Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manager of animpoint scheme when stalkers are captured by animation and follow some defined logic.
 * Specific animation state for some period of time.
 */
export class AnimpointManager extends AbstractSchemeManager<ISchemeAnimpointState> {
  public isStarted: boolean = false;

  public currentAction: Optional<EStalkerState> = null;
  public availableActions: Optional<LuaArray<IAnimpointActionDescriptor>> = null;

  public campManager: Optional<CampManager> = null;
  public coverName: Optional<TName> = null;

  public position: Optional<Vector> = null;
  public positionLevelVertexId: Optional<TNumberId> = null;
  public vertexPosition: Optional<Vector> = null;
  public smartCoverDirection: Optional<Vector> = null;
  public lookPosition: Optional<Vector> = null;

  public override activate(object: GameObject): void {
    logger.info("Activate animpoint scheme: %s", object.name());

    this.state.signals = new LuaTable();

    this.calculatePosition();

    if (this.isStarted) {
      if (!this.state.useCamp && this.coverName === this.state.coverName) {
        this.fillPossibleAnimationActions();

        const targetAction: EStalkerState = this.state.approvedActions.get(
          math.random(this.state.approvedActions.length())
        ).name;

        const currentStateAnimstate: Optional<TName> = states.get(targetAction).animstate;
        const targetStateAnimstate: Optional<TName> = states.get(this.currentAction as EStalkerState).animstate;

        if (currentStateAnimstate === targetStateAnimstate) {
          if (targetAction !== this.currentAction) {
            this.currentAction = table.random(this.state.approvedActions)[1].name;
          }

          return;
        }
      }

      this.stop();
    }
  }

  /**
   * Called from other places managing game animations.
   * Example: camp binder updates.
   */
  public update(): void {
    const actionsList: LuaArray<EStalkerState> = new LuaTable();
    const description: Optional<EStalkerState> = this.state.description;

    if (!this.state.useCamp) {
      if (this.state.availableAnimations === null) {
        assert(
          this.state.approvedActions,
          "animpoint not in camp and approvedActions is null. Name [%s]",
          this.state.coverName
        );

        for (const [, action] of this.state.approvedActions) {
          table.insert(actionsList, action.name);
        }
      } else {
        for (const [index, state] of this.state.availableAnimations) {
          table.insert(actionsList, state);
        }
      }

      this.currentAction = table.random(actionsList)[1];

      return;
    }

    const [campAction, isDirector] = this.campManager!.getObjectActivity(this.object.id());
    const campActionsList = isDirector
      ? campConfig.CAMP_ACTIVITY_ANIMATION.get(campAction as EObjectCampActivity).director
      : campConfig.CAMP_ACTIVITY_ANIMATION.get(campAction as EObjectCampActivity).listener;

    let isFound: boolean = false;

    for (const [, action] of this.state.approvedActions!) {
      for (const it of $range(1, campActionsList.length())) {
        if (description + campActionsList.get(it) === action.name) {
          table.insert(actionsList, action.name);
          isFound = true;
        }
      }
    }

    if (!isFound) {
      table.insert(actionsList, description as EStalkerState);
    }

    const randomIndex: TIndex = math.random(actionsList.length());
    let action: EStalkerState = actionsList.get(randomIndex);

    if (this.state.actionNameBase) {
      if (this.state.actionNameBase === description + WEAPON_POSTFIX) {
        action = (description + WEAPON_POSTFIX) as EStalkerState;
      }

      if (action === description + WEAPON_POSTFIX && this.state.actionNameBase === description) {
        table.remove(actionsList, randomIndex);
        action = table.random(actionsList)[1];
      }
    } else {
      this.state.actionNameBase = action === description + WEAPON_POSTFIX ? action : description;
    }

    this.currentAction = action;
  }

  /**
   * Calculate object positioning based on animpoint target smart cover position.
   */
  public calculatePosition(): void {
    const smartCover: Optional<SmartCover> = registry.smartCovers.get(this.state.coverName);

    assert(smartCover, "There is no registered smart_cover with name '%s'.", this.state.coverName);

    this.position = registry.smartCovers.get(this.state.coverName).position;
    this.positionLevelVertexId = level.vertex_id(this.position);
    this.vertexPosition = level.vertex_position(this.positionLevelVertexId);
    this.smartCoverDirection = angleToDirection(smartCover.angle);

    const lookDirection: Vector = this.smartCoverDirection!.normalize();

    this.lookPosition = createVector(
      this.position.x + 10 * lookDirection.x,
      this.position.y,
      this.position.z + 10 * lookDirection.z
    );

    const descriptionState: EStalkerState = smartCover.description() as EStalkerState;

    if (animpoint_predicates.get(descriptionState) === null) {
      assert(
        this.state.availableAnimations,
        "Wrong animpoint smart_cover description '%s', name '%s'.",
        tostring(descriptionState),
        smartCover.name()
      );
    }

    this.state.description = descriptionState;
    this.availableActions = animpoint_predicates.get(descriptionState);
    this.state.approvedActions = new LuaTable();
  }

  /**
   * @returns tuple with animpoint position and direction
   */
  public getAnimationParameters(): LuaMultiReturn<[Optional<Vector>, Optional<Vector>]> {
    return $multi(this.position, this.smartCoverDirection);
  }

  /**
   * @returns whether object reached position where animpoint scheme should activate animations
   */
  public isPositionReached(): boolean {
    if (this.currentAction !== null) {
      return true;
    }

    if (this.position === null) {
      return false;
    }

    const object: GameObject = registry.objects.get(this.object.id()).object;

    if (object === null) {
      return false;
    }

    const direction: Vector = object.direction();
    const v1: TRate = -math.deg(math.atan2(this.smartCoverDirection!.x, this.smartCoverDirection!.z));
    const v2: TRate = -math.deg(math.atan2(direction.x, direction.z));
    const rotY: TRate = math.min(math.abs(v1 - v2), 360 - math.abs(v1) - math.abs(v2));

    const isDistanceReached: boolean =
      object.position().distance_to_sqr(this.vertexPosition!) <= this.state.reachDistanceSqr;
    const isDirectionReached: boolean = rotY < 50;

    return isDistanceReached && isDirectionReached;
  }

  /**
   * todo: Description.
   */
  public fillPossibleAnimationActions(): void {
    const isInCamp: boolean = this.campManager !== null;

    if (this.state.availableAnimations !== null) {
      for (const [, state] of this.state.availableAnimations) {
        table.insert(this.state.approvedActions, {
          predicate: animpointPredicateAlways,
          name: state,
        });
      }
    } else if (this.availableActions) {
      for (const [, action] of this.availableActions) {
        if (action.predicate(this.object, isInCamp)) {
          table.insert(this.state.approvedActions, action);
        }
      }
    }

    assert(
      this.state.approvedActions.length() !== 0,
      "There is no approved actions for stalker[%s] in animpoint.",
      this.object.name()
    );

    logger.info("Filled available actions: %s %s", this.object.name(), this.state.approvedActions.length());
  }

  /**
   * Start animpoint activity.
   * Fill approved actions list and start animating.
   */
  public start(): void {
    logger.info("Start: %s", this.object.name());

    if (this.state.useCamp) {
      this.campManager = getCampZoneForPosition(this.position);
    }

    this.fillPossibleAnimationActions();

    // Capture object in camp if it exists. Handle separate animation otherwise.
    if (this.campManager) {
      this.campManager.registerObject(this.object.id());
    } else {
      this.currentAction = table.random(this.state.approvedActions)[1].name;
    }

    this.isStarted = true;
    this.coverName = this.state.coverName;

    logger.info("Started: %s %s %s", this.object.name(), this.currentAction, this.coverName);
  }

  /**
   * Stop animation based on animpoint scheme logics.
   */
  public stop(): void {
    logger.info("Stop: %s", this.object.name());

    if (this.campManager !== null) {
      this.campManager.unregisterObject(this.object.id());
    }

    this.isStarted = false;
    this.currentAction = null;
  }
}
