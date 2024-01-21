import {
  CHelicopter,
  CUIGameCustom,
  CUIProgressBar,
  CUIStatic,
  get_hud,
  level,
  StaticDrawableWrapper,
  time_global,
} from "xray16";

import { getIdBySid, registry } from "@/engine/core/database";
import { helicopterConfig } from "@/engine/core/schemes/helicopter/heli_move/HelicopterConfig";
import { pickRandom } from "@/engine/core/utils/random";
import { resolveXmlFile } from "@/engine/core/utils/ui";
import { distanceBetween2d } from "@/engine/core/utils/vector";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { ACTOR, NIL } from "@/engine/lib/constants/words";
import {
  GameObject,
  Optional,
  StringOptional,
  TCount,
  TDistance,
  TIndex,
  TName,
  TNumberId,
  TRate,
  TTimestamp,
  Vector,
  XmlInit,
} from "@/engine/lib/types";

/**
 * todo;
 */
export class HelicopterFireManager {
  public readonly object: GameObject;

  public enemy: Optional<GameObject> = null;
  public enemyId: Optional<TNumberId> = null;
  public enemyPreference: Optional<StringOptional<TName>> = NIL; // All, actor or nil.
  public enemyDie: boolean = true;
  public enemyTime: TTimestamp = time_global();

  public firePoint: Optional<Vector> = null;
  public fireId: any = null;

  public flagByEnemy: boolean = true;
  public hitCount: TCount = 0;
  public updateVisibility: number = 0;
  public showHealth: boolean = false;

  public uiProgressBar: Optional<CUIProgressBar> = null;

  public constructor(object: GameObject) {
    this.object = object;
  }

  /**
   * todo: Description.
   */
  public updateEnemyState(): void {
    const helicopter: CHelicopter = this.object.get_helicopter();

    if (this.hitCount > 2) {
      this.hitCount = 0;
      this.flagByEnemy = true;
    }

    if (this.enemy && this.enemyDie && this.enemyPreference === "all") {
      this.updateEnemyArr();
    }

    if (this.enemy && time_global() - this.enemyTime > this.updateVisibility * 1000) {
      if (!helicopter.isVisible(this.enemy)) {
        if (this.enemyPreference === "all") {
          this.updateEnemyArr();
        }
      }

      this.enemyTime = time_global();
    }

    if (this.enemy) {
      if (!helicopter.isVisible(this.enemy)) {
        this.flagByEnemy = true;
      }
    }

    this.setEnemy();
  }

  /**
   * todo: Description.
   */
  public showHelicopterFightUI(): void {
    const hud: CUIGameCustom = get_hud();
    const uiHelicopterHealth: Optional<StaticDrawableWrapper> = hud.GetCustomStatic("cs_heli_health");

    if (uiHelicopterHealth === null) {
      hud.AddCustomStatic("cs_heli_health", true);

      const xml: XmlInit = resolveXmlFile(helicopterConfig.HELICOPTER_STATIC_UI_XML_PATH);
      const window: CUIStatic = hud.GetCustomStatic("cs_heli_health")!.wnd();

      this.uiProgressBar = xml.InitProgressBar("heli_health", window);
      this.setHelicopterFightUIHealth();
    }
  }

  /**
   * todo: Description.
   */
  public setHelicopterFightUIHealth(): void {
    const hud: CUIGameCustom = get_hud();
    const uiHelicopterHealth: Optional<StaticDrawableWrapper> = hud.GetCustomStatic("cs_heli_health");

    if (uiHelicopterHealth) {
      hud.AddCustomStatic("cs_heli_health", true);

      const helicopter: CHelicopter = this.object.get_helicopter();
      const progress: TRate = helicopter.GetfHealth() * 100;

      if (progress > 0) {
        this.uiProgressBar!.Show(true);
        this.uiProgressBar!.SetProgressPos(progress);
      } else {
        this.uiProgressBar!.Show(false);
        this.showHealth = false;
        hud.RemoveCustomStatic("cs_heli_health");
      }
    }
  }

  /**
   * todo: Description.
   */
  public removeHelicopterFightUI(): void {
    const hud: CUIGameCustom = get_hud();

    if (hud.GetCustomStatic("cs_heli_health")) {
      hud.RemoveCustomStatic("cs_heli_health");
    }
  }

  /**
   * todo: Description.
   */
  public setEnemy(): void {
    const helicopter: CHelicopter = this.object.get_helicopter();

    if (this.flagByEnemy) {
      helicopter.ClearEnemy();
      this.enemyDie = false;
      if (this.enemy) {
        if (helicopter.isVisible(this.enemy)) {
          helicopter.SetEnemy(this.enemy);
          this.flagByEnemy = false;
        }
      } else {
        if (this.enemyPreference) {
          if (this.enemyPreference === ACTOR) {
            this.enemy = registry.actor;
          } else {
            if (this.enemyPreference === "all") {
              this.updateEnemyArr();
            } else {
              if (this.enemyPreference !== NIL) {
                this.enemyId = getIdBySid(tonumber(this.enemyPreference)!);
                this.enemy = level.object_by_id(this.enemyId!);
              }
            }
          }
        }

        if (this.enemy) {
          helicopter.SetEnemy(this.enemy!);
        } else {
          this.enemyDie = true;
        }

        this.flagByEnemy = false;
      }
    }

    if (!this.enemyDie && this.enemy!.death_time() > 0) {
      helicopter.ClearEnemy();
      this.enemyDie = true;
    }

    if (this.enemyDie && this.firePoint) {
      helicopter.SetEnemy(this.firePoint);
    }
  }

  /**
   * todo: Description.
   */
  public updateOnHit(): void {
    if (this.showHealth) {
      this.setHelicopterFightUIHealth();
    } else {
      this.removeHelicopterFightUI();
    }

    if (this.enemy!.id() === this.fireId) {
      if (this.enemyPreference !== NIL) {
        this.hitCount = this.hitCount + 1;
      } else {
        this.hitCount = 0;
      }
    } else {
      this.fireId = this.enemy!.id();
      this.hitCount = 1;
    }
  }

  /**
   * todo: Description.
   */
  public updateEnemyArr(): void {
    const helicopter: CHelicopter = this.object.get_helicopter();
    const helicopterPosition: Vector = this.object.position();

    let index: TIndex = 0;
    let minDist2D: TDistance = MAX_U16;

    while (index < registry.helicopter.enemyIndex) {
      const enemy: Optional<GameObject> = registry.helicopter.enemies.get(index) as Optional<GameObject>;

      if (enemy) {
        const enemyPosition: Vector = enemy.position();

        if (helicopter.isVisible(enemy)) {
          if (distanceBetween2d(helicopterPosition, enemyPosition) < minDist2D) {
            this.enemy = enemy;
            this.flagByEnemy = true;

            minDist2D = distanceBetween2d(helicopterPosition, enemyPosition);
          }
        }
      }

      index += 1;
    }

    const actor: GameObject = registry.actor;

    if ((helicopter.isVisible(actor) && pickRandom(false, true)) || registry.helicopter.enemyIndex === 0) {
      if (distanceBetween2d(helicopterPosition, actor.position()) <= minDist2D * 2) {
        this.enemy = actor;
      }
    }
  }
}
