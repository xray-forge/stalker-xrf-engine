import { ActionBase, ClientObject, Optional } from "@/engine/lib/types";
import { MockWorldProperty } from "@/fixtures/xray/mocks/actions";
import { MockLuabindClass } from "@/fixtures/xray/mocks/luabind.mock";

/**
 * todo;
 */
export class MockActionBase extends MockLuabindClass {
  public object: Optional<ClientObject>;
  public name: string;

  public preconditions: Array<MockWorldProperty> = [];
  public effects: Array<MockWorldProperty> = [];

  public constructor(object: Optional<ClientObject> = null, name: string) {
    super();

    this.object = object;
    this.name = name || this.constructor.name;
  }

  public initialize(): void {}

  public execute(): void {}

  public setup(object: ClientObject): void {
    this.object = object;
  }

  public add_precondition(property: MockWorldProperty): void {
    this.preconditions.push(property);
  }

  public add_effect(property: MockWorldProperty): void {
    this.effects.push(property);
  }

  public getPrecondition(id: number): Optional<MockWorldProperty> {
    return this.preconditions.find((it) => it.condition() === id) ?? null;
  }

  public getEffect(id: number): Optional<MockWorldProperty> {
    return this.effects.find((it) => it.condition() === id) ?? null;
  }
}

export function mockActionBase(object: Optional<ClientObject> = null, name: string = "generic"): ActionBase {
  return new MockActionBase(object, name) as unknown as ActionBase;
}
