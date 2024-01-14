import { jest } from "@jest/globals";
import { CPhysicObject } from "xray16";

import { TDuration } from "@/engine/lib/types";

export class MockPhysicObject {
  public static mock(): CPhysicObject {
    return new MockPhysicObject() as unknown as CPhysicObject;
  }

  public animationTime: TDuration = 0;

  public run_anim_back = jest.fn();

  public run_anim_forward = jest.fn();

  public stop_anim = jest.fn();

  public anim_time_get = jest.fn(() => this.animationTime);

  public anim_time_set = jest.fn((time: TDuration) => {
    this.animationTime = time;
  });
}
