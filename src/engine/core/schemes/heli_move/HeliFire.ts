import {
  CScriptXmlInit,
  get_hud,
  level,
  time_global,
  XR_CHelicopter,
  XR_CUIGameCustom,
  XR_CUIProgressBar,
  XR_game_object,
  XR_StaticDrawableWrapper,
  XR_vector,
} from "xray16";

import { getIdBySid, registry } from "@/engine/core/database";
import { randomChoice } from "@/engine/core/utils/general";
import { LuaLogger } from "@/engine/core/utils/logging";
import { distanceBetween2d } from "@/engine/core/utils/physics";
import { MAX_UNSIGNED_16_BIT } from "@/engine/lib/constants/memory";
import { ACTOR, STRINGIFIED_NIL } from "@/engine/lib/constants/words";
import { Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);
const heli_firer: LuaTable<number, HeliFire> = new LuaTable();

export class HeliFire {
  public static readonly HELI_STATIC_UI_XML_PATH: string = "game\\heli\\heli_progress.xml";

  public object: XR_game_object;
  public enemy_: Optional<string>;
  public enemy: Optional<XR_game_object>;
  public enemy_id: Optional<number>;
  public fire_point: Optional<XR_vector>;
  public flag_by_enemy: boolean;
  public hit_count: number;
  public fire_id: any;
  public enemy_die: boolean;
  public enemy_time: number;
  public upd_vis: number;
  public show_health: boolean;

  public heli_progress: Optional<XR_CUIProgressBar> = null;

  public constructor(object: XR_game_object) {
    this.object = object;
    this.enemy_ = null;
    this.fire_point = null;
    this.enemy = null;
    this.enemy_id = null;
    this.flag_by_enemy = true;
    this.hit_count = 0;
    this.fire_id = null;
    this.enemy_die = true;
    this.enemy_time = time_global();
    this.upd_vis = 0;
    this.show_health = false;
  }

  public update_enemy_state(): void {
    const heli = this.object.get_helicopter();

    // --'    printf("update_enemy_state()")
    if (this.hit_count > 2) {
      this.hit_count = 0;
      this.flag_by_enemy = true;
    }

    if (this.enemy && this.enemy_die && this.enemy_ === "all") {
      this.update_enemy_arr();
    }

    if (this.enemy && time_global() - this.enemy_time > this.upd_vis * 1000) {
      // --'printf("this.upd_vis  = %d", this.upd_vis);
      if (!heli.isVisible(this.enemy)) {
        if (this.enemy_ === "all") {
          this.update_enemy_arr();
        }
      }

      this.enemy_time = time_global();
    }

    if (this.enemy) {
      if (!heli.isVisible(this.enemy)) {
        this.flag_by_enemy = true;
      }
    }

    this.set_enemy();
  }

  public cs_heli(): void {
    const hud: XR_CUIGameCustom = get_hud();
    const custom_static = hud.GetCustomStatic("cs_heli_health");

    if (custom_static === null) {
      hud.AddCustomStatic("cs_heli_health", true);

      const xml = new CScriptXmlInit();

      xml.ParseFile(HeliFire.HELI_STATIC_UI_XML_PATH);

      const st = hud.GetCustomStatic("cs_heli_health")!;
      const w = st.wnd();

      this.heli_progress = xml.InitProgressBar("heli_health", w);
      this.set_cs_heli_progress_health();
    }
  }

  public set_cs_heli_progress_health(): void {
    const heli = this.object.get_helicopter();
    const hud = get_hud();
    const custom_static = hud.GetCustomStatic("cs_heli_health");
    const xml = new CScriptXmlInit();

    xml.ParseFile(HeliFire.HELI_STATIC_UI_XML_PATH);

    if (custom_static) {
      hud.AddCustomStatic("cs_heli_health", true);

      const st = hud.GetCustomStatic("cs_heli_health")!;
      const w = st.wnd();
      const _progr = heli.GetfHealth() * 100;

      if (_progr > 0) {
        this.heli_progress!.Show(true);
        this.heli_progress!.SetProgressPos(_progr);
      } else {
        this.heli_progress!.Show(false);
        this.show_health = false;
        hud.RemoveCustomStatic("cs_heli_health");
      }
    }
  }

  public cs_remove(): void {
    const hud: XR_CUIGameCustom = get_hud();
    const custom_static: Optional<XR_StaticDrawableWrapper> = hud.GetCustomStatic("cs_heli_health");

    if (custom_static) {
      hud.RemoveCustomStatic("cs_heli_health");
    }
  }

  public set_enemy(): void {
    const heli = this.object.get_helicopter();

    if (this.flag_by_enemy) {
      heli.ClearEnemy();
      // --'printf("ClearEnemy()")
      this.enemy_die = false;
      if (this.enemy) {
        if (heli.isVisible(this.enemy)) {
          heli.SetEnemy(this.enemy);
          this.flag_by_enemy = false;
        }
      } else {
        if (this.enemy_) {
          if (this.enemy_ === ACTOR) {
            this.enemy = registry.actor;
          } else {
            if (this.enemy_ === "all") {
              this.update_enemy_arr();
            } else {
              if (this.enemy_ !== STRINGIFIED_NIL) {
                this.enemy_id = getIdBySid(tonumber(this.enemy_)!);
                this.enemy = level.object_by_id(this.enemy_id!);
              }
            }
          }
        }

        if (this.enemy) {
          heli.SetEnemy(this.enemy!);
          // --'printf("set_enemy(this.enemy, actor or SID)")
        } else {
          this.enemy_die = true;
        }

        this.flag_by_enemy = false;
      }
    }

    if (!this.enemy_die && this.enemy!.death_time() > 0) {
      // --'printf("ClearEnemy()")
      heli.ClearEnemy();
      this.enemy_die = true;
    }

    if (this.enemy_die && this.fire_point) {
      heli.SetEnemy(this.fire_point);
    }
  }

  public update_hit(): void {
    if (this.show_health) {
      this.set_cs_heli_progress_health();
    } else {
      this.cs_remove();
    }

    if (this.enemy!.id() === this.fire_id) {
      if (this.enemy_ !== STRINGIFIED_NIL) {
        this.hit_count = this.hit_count + 1;
      } else {
        this.hit_count = 0;
      }
    } else {
      this.fire_id = this.enemy!.id();
      this.hit_count = 1;
    }
  }

  public update_enemy_arr(): void {
    const heli: XR_CHelicopter = this.object.get_helicopter();
    let index: number = 0;
    let min_dist2D: number = MAX_UNSIGNED_16_BIT;

    while (index < registry.helicopter.enemiesCount) {
      if (registry.helicopter.enemies.has(index)) {
        const enemy: XR_game_object = registry.helicopter.enemies.get(index);

        if (heli.isVisible(enemy)) {
          if (distanceBetween2d(this.object.position(), enemy.position()) < min_dist2D) {
            this.enemy = enemy;
            min_dist2D = distanceBetween2d(this.object.position(), enemy.position());
            this.flag_by_enemy = true;
          }
        }
      }

      index = index + 1;
    }

    const actor: XR_game_object = registry.actor;

    if ((heli.isVisible(actor) && randomChoice(false, true)) || registry.helicopter.enemiesCount === 0) {
      if (distanceBetween2d(this.object.position(), actor.position()) <= min_dist2D * 2) {
        this.enemy = actor;
      }
    }
  }
}

export function get_heli_firer(object: XR_game_object): HeliFire {
  if (heli_firer.get(object.id()) === null) {
    heli_firer.set(object.id(), new HeliFire(object));
  }

  return heli_firer.get(object.id());
}
