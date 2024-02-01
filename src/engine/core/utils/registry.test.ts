import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { clsid } from "xray16";

import { registerActor, registerSimulator } from "@/engine/core/database";
import {
  getGameObjects,
  getNearestGameObject,
  getNearestServerObject,
  getServerObjects,
} from "@/engine/core/utils/registry";
import { AnyObject, GameObject, ServerObject, TClassId, TIndex } from "@/engine/lib/types";
import { MockLuaTable } from "@/fixtures/lua";
import { MockAlifeCreatureActor, MockAlifeObject, MockAlifeSimulator, MockGameObject } from "@/fixtures/xray";

describe("getNearestServerObject util", () => {
  beforeEach(() => {
    MockGameObject.REGISTRY.reset();
    MockAlifeSimulator.reset();
    registerSimulator();
  });

  it("should correctly search for client objects", () => {
    registerActor(MockGameObject.mockActor());

    const actor: ServerObject = MockAlifeCreatureActor.mock({
      name: "actor_name",
    });
    const first: ServerObject = MockAlifeObject.mock({
      clsid: clsid.dog_s,
      name: "dog_name",
    });
    const second: ServerObject = MockAlifeObject.mock({
      clsid: clsid.dog_red,
      name: "dog_name",
    });
    const third: ServerObject = MockAlifeObject.mock();
    const fourth: ServerObject = MockAlifeObject.mock({ parentId: actor.id });

    jest.spyOn(actor.position, "distance_to_sqr").mockImplementation(() => 1);
    jest.spyOn(first.position, "distance_to_sqr").mockImplementation(() => 145 * 145);
    jest.spyOn(second.position, "distance_to_sqr").mockImplementation(() => 130 * 130);
    jest.spyOn(third.position, "distance_to_sqr").mockImplementation(() => 100 * 100);
    jest.spyOn(fourth.position, "distance_to_sqr").mockImplementation(() => 25 * 25);

    expect(getNearestServerObject()?.id).toBe(third.id);
    expect(getNearestServerObject(null, false)?.id).toBe(third.id);
    expect(getNearestServerObject("dog_", false)?.id).toBe(second.id);
    expect(getNearestServerObject(clsid.dog_s as TClassId, false)?.id).toBe(first.id);
    expect(getNearestServerObject((it) => it.name() === "dog_name" && it.clsid() === clsid.dog_s, false)?.id).toBe(
      first.id
    );

    (third as AnyObject).m_game_vertex_id = 9999;

    expect(getNearestServerObject()?.id).toBe(second.id);

    jest.spyOn(actor.position, "distance_to_sqr").mockImplementation(() => 1);
    jest.spyOn(first.position, "distance_to_sqr").mockImplementation(() => 299 * 299);
    jest.spyOn(second.position, "distance_to_sqr").mockImplementation(() => 260 * 260);
    jest.spyOn(third.position, "distance_to_sqr").mockImplementation(() => 270 * 270);
    jest.spyOn(fourth.position, "distance_to_sqr").mockImplementation(() => 25 * 25);

    expect(getNearestServerObject(null, false)).toBeNull();
  });
});

describe("getServerObjects util", () => {
  beforeEach(() => {
    MockGameObject.REGISTRY.reset();
    MockAlifeSimulator.reset();
    registerSimulator();
  });

  it("should correctly search for client objects", () => {
    const actor: ServerObject = MockAlifeCreatureActor.mock({
      name: "actor_name",
    });
    const first: ServerObject = MockAlifeObject.mock({
      clsid: clsid.script_stalker as TClassId,
      name: "stalker_name",
    });
    const second: ServerObject = MockAlifeObject.mock({
      clsid: clsid.pseudodog_s,
      name: "dog_name",
    });
    const third: ServerObject = MockAlifeObject.mock();

    MockAlifeObject.mock({ parentId: actor.id });

    MockGameObject.mock({ id: actor.id });
    MockGameObject.mock({ id: first.id });

    expect((getServerObjects() as unknown as MockLuaTable<TIndex, ServerObject>).map((it) => it.id)).toEqual([
      first.id,
      second.id,
      third.id,
    ]);
    expect((getServerObjects(null, false) as unknown as MockLuaTable<TIndex, ServerObject>).map((it) => it.id)).toEqual(
      [first.id]
    );

    expect(
      (getServerObjects(clsid.script_stalker as TClassId) as unknown as MockLuaTable<TIndex, ServerObject>).map(
        (it) => it.id
      )
    ).toEqual([first.id]);
    expect(
      (getServerObjects(clsid.script_stalker as TClassId, false) as unknown as MockLuaTable<TIndex, ServerObject>).map(
        (it) => it.id
      )
    ).toEqual([first.id]);
    expect(
      (getServerObjects(clsid.pseudodog_s as TClassId) as unknown as MockLuaTable<TIndex, ServerObject>).map((it) => {
        return it.id;
      })
    ).toEqual([second.id]);
    expect(
      (getServerObjects(clsid.pseudodog_s as TClassId, false) as unknown as MockLuaTable<TIndex, ServerObject>).map(
        (it) => {
          return it.id;
        }
      )
    ).toEqual([]);

    expect(
      (getServerObjects("dog") as unknown as MockLuaTable<TIndex, ServerObject>).map((it) => {
        return it.id;
      })
    ).toEqual([second.id]);
    expect(
      (getServerObjects("dog_name") as unknown as MockLuaTable<TIndex, ServerObject>).map((it) => {
        return it.id;
      })
    ).toEqual([second.id]);
    expect(
      (getServerObjects("dog", false) as unknown as MockLuaTable<TIndex, ServerObject>).map((it) => {
        return it.id;
      })
    ).toEqual([]);
    expect(
      (getServerObjects("dog", false) as unknown as MockLuaTable<TIndex, ServerObject>).map((it) => {
        return it.id;
      })
    ).toEqual([]);
    expect(
      (getServerObjects((it) => it.name().endsWith("_name")) as unknown as MockLuaTable<TIndex, ServerObject>).map(
        (it) => {
          return it.id;
        }
      )
    ).toEqual([first.id, second.id]);
  });
});

describe("getNearestGameObject util", () => {
  beforeEach(() => {
    MockGameObject.REGISTRY.reset();
    MockAlifeSimulator.reset();
    registerSimulator();
  });

  it("should correctly search for client objects", () => {
    const actor: GameObject = MockGameObject.mockActor({
      clsid: clsid.actor,
      name: "actor_name",
    });

    registerActor(actor);

    const first: GameObject = MockGameObject.mock({
      clsid: clsid.dog_s,
      name: "dog_name",
    });
    const second: GameObject = MockGameObject.mock({
      clsid: clsid.dog_red,
      name: "dog_name",
    });
    const third: GameObject = MockGameObject.mock();
    const fourth: GameObject = MockGameObject.mock();

    jest.spyOn(fourth, "parent").mockImplementation(() => actor);

    jest.spyOn(actor.position(), "distance_to_sqr").mockImplementation(() => 1);
    jest.spyOn(first.position(), "distance_to_sqr").mockImplementation(() => 145 * 145);
    jest.spyOn(second.position(), "distance_to_sqr").mockImplementation(() => 130 * 130);
    jest.spyOn(third.position(), "distance_to_sqr").mockImplementation(() => 100 * 100);
    jest.spyOn(fourth.position(), "distance_to_sqr").mockImplementation(() => 25 * 25);

    expect(getNearestGameObject()?.id()).toBe(third.id());
    expect(getNearestGameObject(null)?.id()).toBe(third.id());
    expect(getNearestGameObject("dog_")?.id()).toBe(second.id());
    expect(getNearestGameObject(clsid.dog_s as TClassId)?.id()).toBe(first.id());
    expect(getNearestGameObject((it) => it.name() === "dog_name" && it.clsid() === clsid.dog_red)?.id()).toBe(
      second.id()
    );
  });
});

describe("getGameObjects util", () => {
  beforeEach(() => {
    MockGameObject.REGISTRY.reset();
    MockAlifeSimulator.reset();
    registerSimulator();
  });

  it("should correctly search for client objects", () => {
    const actor: GameObject = MockGameObject.mockActor({
      clsid: clsid.actor,
      name: "actor_name",
    });
    const first: GameObject = MockGameObject.mock({
      clsid: clsid.script_stalker,
      name: "stalker_name",
    });
    const second: GameObject = MockGameObject.mock({
      clsid: clsid.pseudodog_s,
      name: "dog_name",
    });
    const third: GameObject = MockGameObject.mock();

    const actorItem: GameObject = MockGameObject.mock();

    jest.spyOn(actorItem, "parent").mockImplementation(() => actor);

    registerActor(actor);

    const firstList: MockLuaTable<TIndex, GameObject> = getGameObjects() as unknown as MockLuaTable<TIndex, GameObject>;

    expect(firstList.map((it) => it.id())).toEqual([first.id(), second.id(), third.id()]);

    expect(
      (getGameObjects(clsid.script_stalker as TClassId) as unknown as MockLuaTable<TIndex, GameObject>).map((it) => {
        return it.id();
      })
    ).toEqual([first.id()]);
    expect(
      (getGameObjects(clsid.pseudodog_s as TClassId) as unknown as MockLuaTable<TIndex, GameObject>).map((it) => {
        return it.id();
      })
    ).toEqual([second.id()]);

    expect(
      (getGameObjects("dog") as unknown as MockLuaTable<TIndex, GameObject>).map((it) => {
        return it.id();
      })
    ).toEqual([second.id()]);
    expect(
      (getGameObjects("dog_name") as unknown as MockLuaTable<TIndex, GameObject>).map((it) => {
        return it.id();
      })
    ).toEqual([second.id()]);
    expect(
      (
        getGameObjects((it) => it.name() === "dog_name" && it.clsid() === clsid.pseudodog_s) as unknown as MockLuaTable<
          TIndex,
          GameObject
        >
      ).map((it) => {
        return it.id();
      })
    ).toEqual([second.id()]);
  });
});
