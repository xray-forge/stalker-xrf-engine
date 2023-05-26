import { action_base, game_object, world_property } from "xray16";

import { Optional } from "@/engine/lib/types";
import { MockLuabindClass } from "@/fixtures/xray/mocks/luabind.mock";

/**
 * todo;
 */
export class MockActionBase extends MockLuabindClass {
  public object: Optional<game_object>;
  public name: string;

  public preconditions: Array<world_property> = [];
  public effects: Array<world_property> = [];

  public constructor(object: Optional<game_object> = null, name: string) {
    super();

    this.object = object;
    this.name = name || this.constructor.name;
  }

  public initialize(): void {}

  public execute(): void {}

  public setup(object: game_object): void {
    this.object = object;
  }

  public add_precondition(property: world_property): void {
    this.preconditions.push(property);
  }

  public add_effect(property: world_property): void {
    this.effects.push(property);
  }

  public getPrecondition(id: number): Optional<world_property> {
    return this.preconditions.find((it) => it.condition() === id) ?? null;
  }

  public getEffect(id: number): Optional<world_property> {
    return this.effects.find((it) => it.condition() === id) ?? null;
  }
}

export function mockActionBase(object: Optional<game_object> = null, name: string = "generic"): action_base {
  return new MockActionBase(object, name) as unknown as action_base;
}
