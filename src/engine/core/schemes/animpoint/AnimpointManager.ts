import { level } from "xray16";

import { registry } from "@/engine/core/database";
import { getCampForPosition } from "@/engine/core/database/camp";
import { SmartCover } from "@/engine/core/objects";
import { EStalkerState, WEAPON_POSTFIX } from "@/engine/core/objects/animation";
import {
  animpoint_predicates,
  animpointPredicateAlways,
} from "@/engine/core/objects/animation/predicates/animpoint_predicates";
import { states } from "@/engine/core/objects/animation/states";
import { EObjectCampActivity } from "@/engine/core/objects/state/camp";
import { CAMP_ACTIVITY_ANIMATION } from "@/engine/core/objects/state/camp/camp_logic";
import { CampManager } from "@/engine/core/objects/state/camp/CampManager";
import { IAnimpointActionDescriptor, ISchemeAnimpointState } from "@/engine/core/schemes/animpoint/types";
import { AbstractSchemeManager } from "@/engine/core/schemes/base";
import { assert } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { angleToDirection, createVector } from "@/engine/core/utils/vector";
import { ClientObject, LuaArray, Optional, TName, TNumberId, TRate, Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manager of animpoint scheme when stalkers are captured by animation and follow some defined logic.
 * Specific animation state for some period of time.
 */
export class AnimpointManager extends AbstractSchemeManager<ISchemeAnimpointState> {
  public isStarted: boolean = false;

  public currentAction: Optional<EStalkerState> = null;
  public availableActions: Optional<LuaArray<IAnimpointActionDescriptor>> = null;

  public camp: Optional<CampManager> = null;
  public coverName: Optional<TName> = null;

  public position: Optional<Vector> = null;
  public positionLevelVertexId: Optional<TNumberId> = null;
  public vertexPosition: Optional<Vector> = null;
  public smartCoverDirection: Optional<Vector> = null;
  public lookPosition: Optional<Vector> = null;

  public override activateScheme(isLoading: boolean, object: ClientObject): void {
    this.state.signals = new LuaTable();

    this.calculatePosition();

    if (this.isStarted) {
      if (!this.state.useCamp && this.coverName === this.state.coverName) {
        this.fillApprovedActions();

        const targetAction: EStalkerState = this.state.approvedActions.get(
          math.random(this.state.approvedActions.length())
        ).name;

        const currentStateAnimstate: Optional<TName> = states.get(targetAction).animstate;
        const targetStateAnimstate: Optional<TName> = states.get(this.currentAction as EStalkerState).animstate;

        if (currentStateAnimstate === targetStateAnimstate) {
          if (targetAction !== this.currentAction) {
            this.currentAction = this.state.approvedActions.get(math.random(this.state.approvedActions.length())).name;
          }

          return;
        }
      }

      this.stop();
    }
  }

  public update(): void {
    const actionsList: LuaArray<EStalkerState> = new LuaTable();
    const description: Optional<EStalkerState> = this.state.description;

    if (this.state.useCamp) {
      const [campAction, isDirector] = this.camp!.getCampAction(this.object.id());
      const campActionsList = isDirector
        ? CAMP_ACTIVITY_ANIMATION.get(campAction as EObjectCampActivity).director
        : CAMP_ACTIVITY_ANIMATION.get(campAction as EObjectCampActivity).listener;

      let isFound: boolean = false;

      for (const [id, action] of this.state.approvedActions!) {
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

      const randomNumber: number = math.random(actionsList.length());
      let action: EStalkerState = actionsList.get(randomNumber);

      if (this.state.actionNameBase) {
        if (this.state.actionNameBase === description + WEAPON_POSTFIX) {
          action = (description + WEAPON_POSTFIX) as EStalkerState;
        }

        if (action === description + WEAPON_POSTFIX && this.state.actionNameBase === description) {
          table.remove(actionsList, randomNumber);
          action = actionsList.get(math.random(actionsList.length()));
        }
      } else {
        this.state.actionNameBase = action === description + WEAPON_POSTFIX ? action : description;
      }

      this.currentAction = action;
    } else {
      if (this.state.availableAnimations === null) {
        assert(
          this.state.approvedActions,
          "animpoint not in camp and approvedActions is null. Name [%s]",
          this.state.coverName
        );

        for (const [, action] of this.state.approvedActions!) {
          table.insert(actionsList, action.name);
        }
      } else {
        for (const [index, state] of this.state.availableAnimations!) {
          table.insert(actionsList, state);
        }
      }

      this.currentAction = actionsList.get(math.random(actionsList.length()));
    }
  }

  /**
   * todo: Description.
   */
  public calculatePosition(): void {
    const smartCover: Optional<SmartCover> = registry.smartCovers.get(this.state.coverName);

    assert(smartCover, "There is no smart_cover with name [%s]", this.state.coverName);

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
        "Wrong animpoint smart_cover description %s, name %s",
        tostring(descriptionState),
        smartCover.name()
      );
    }

    this.state.description = descriptionState;
    this.availableActions = animpoint_predicates.get(descriptionState);
    this.state.approvedActions = new LuaTable();
  }

  /**
   * todo: Description.
   */
  public getAnimationParameters(): LuaMultiReturn<[Optional<Vector>, Optional<Vector>]> {
    return $multi(this.position, this.smartCoverDirection);
  }

  /**
   * todo: Description.
   */
  public isPositionReached(): boolean {
    if (this.currentAction !== null) {
      return true;
    }

    if (this.position === null) {
      return false;
    }

    const object: ClientObject = registry.objects.get(this.object.id()).object;

    if (object === null) {
      return false;
    }

    const v1: TRate = -math.deg(math.atan2(this.smartCoverDirection!.x, this.smartCoverDirection!.z));
    const v2: TRate = -math.deg(math.atan2(object.direction().x, object.direction().z));
    const rotY: TRate = math.min(math.abs(v1 - v2), 360 - math.abs(v1) - math.abs(v2));

    const isDistanceReached: boolean =
      object.position().distance_to_sqr(this.vertexPosition!) <= this.state.reachDistance;
    const isDirectionReached: boolean = rotY < 50;

    return isDistanceReached && isDirectionReached;
  }

  /**
   * todo: Description.
   */
  public fillApprovedActions(): void {
    const isInCamp: boolean = this.camp !== null;

    if (this.state.availableAnimations !== null) {
      for (const [, state] of this.state.availableAnimations) {
        table.insert(this.state.approvedActions, {
          predicate: animpointPredicateAlways,
          name: state,
        });
      }
    } else {
      if (this.availableActions) {
        for (const [, action] of this.availableActions) {
          if (action.predicate(this.object, isInCamp)) {
            table.insert(this.state.approvedActions, action);
          }
        }
      }
    }

    assert(
      this.state.approvedActions.length() !== 0,
      "There is no approved actions for stalker[%s] in animpoint.",
      this.object.name()
    );

    logger.info("Filled approved actions:", this.object.name(), this.state.approvedActions.length());
  }

  /**
   * todo: Description.
   */
  public getCurrentAction(): Optional<EStalkerState> {
    return this.currentAction;
  }

  /**
   * todo: Description.
   */
  public start(): void {
    logger.info("Start:", this.object.name());

    if (this.state.useCamp) {
      this.camp = getCampForPosition(this.position);
    }

    this.fillApprovedActions();

    // Capture object in camp if it exists. Handle separate animation otherwise.
    if (this.camp) {
      this.camp.registerObject(this.object.id());
    } else {
      this.currentAction = this.state.approvedActions!.get(math.random(this.state.approvedActions!.length())).name;
    }

    this.isStarted = true;
    this.coverName = this.state.coverName;

    logger.info("Started:", this.object.name(), this.currentAction, this.coverName);
  }

  /**
   * Stop animation based on animpoint scheme logics.
   */
  public stop(): void {
    logger.info("Stop:", this.object.name());

    if (this.camp !== null) {
      this.camp.unregisterObject(this.object.id());
    }

    this.isStarted = false;
    this.currentAction = null;
  }
}
