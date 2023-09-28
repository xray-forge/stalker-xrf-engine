import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { clsid } from "xray16";

import { registerActor, registerSimulator } from "@/engine/core/database";
import {
  getClientObjects,
  getNearestClientObject,
  getNearestServerObject,
  getServerObjects,
} from "@/engine/core/utils/registry";
import { AnyObject, ClientObject, ServerObject, TClassId, TIndex } from "@/engine/lib/types";
import { MockLuaTable } from "@/fixtures/lua";
import {
  CLIENT_SIDE_REGISTRY,
  mockActorClientGameObject,
  MockAlifeSimulator,
  mockClientGameObject,
  mockServerAlifeCreatureActor,
  mockServerAlifeObject,
} from "@/fixtures/xray";

describe("registry find utils", () => {
  beforeEach(() => {
    CLIENT_SIDE_REGISTRY.reset();
    MockAlifeSimulator.reset();
    registerSimulator();
  });

  it("getNearestServerObject should correctly search for client objects", () => {
    registerActor(mockActorClientGameObject());

    const actor: ServerObject = mockServerAlifeCreatureActor({
      clsid: () => clsid.actor as TClassId,
      name: <T>() => "actor_name" as T,
    });
    const first: ServerObject = mockServerAlifeObject({
      clsid: () => clsid.dog_s as TClassId,
      name: <T>() => "dog_name" as T,
    });
    const second: ServerObject = mockServerAlifeObject({
      clsid: () => clsid.dog_red as TClassId,
      name: <T>() => "dog_name" as T,
    });
    const third: ServerObject = mockServerAlifeObject();
    const fourth: ServerObject = mockServerAlifeObject({ parent_id: actor.id });

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

  it("getServerObjects should correctly search for client objects", () => {
    const actor: ServerObject = mockServerAlifeCreatureActor({
      clsid: () => clsid.actor as TClassId,
      name: <T>() => "actor_name" as T,
    });
    const first: ServerObject = mockServerAlifeObject({
      clsid: () => clsid.script_stalker as TClassId,
      name: <T>() => "stalker_name" as T,
    });
    const second: ServerObject = mockServerAlifeObject({
      clsid: () => clsid.pseudodog_s as TClassId,
      name: <T>() => "dog_name" as T,
    });
    const third: ServerObject = mockServerAlifeObject();

    mockServerAlifeObject({ parent_id: actor.id });

    mockClientGameObject({ idOverride: actor.id });
    mockClientGameObject({ idOverride: first.id });

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

  it("getNearestClientObject should correctly search for client objects", () => {
    const actor: ClientObject = mockActorClientGameObject({
      clsid: () => clsid.actor as TClassId,
      name: () => "actor_name",
    });

    registerActor(actor);

    const first: ClientObject = mockClientGameObject({
      clsid: () => clsid.dog_s as TClassId,
      name: () => "dog_name",
    });
    const second: ClientObject = mockClientGameObject({
      clsid: () => clsid.dog_red as TClassId,
      name: () => "dog_name",
    });
    const third: ClientObject = mockClientGameObject();
    const fourth: ClientObject = mockClientGameObject({ parent: () => actor });

    jest.spyOn(actor.position(), "distance_to_sqr").mockImplementation(() => 1);
    jest.spyOn(first.position(), "distance_to_sqr").mockImplementation(() => 145 * 145);
    jest.spyOn(second.position(), "distance_to_sqr").mockImplementation(() => 130 * 130);
    jest.spyOn(third.position(), "distance_to_sqr").mockImplementation(() => 100 * 100);
    jest.spyOn(fourth.position(), "distance_to_sqr").mockImplementation(() => 25 * 25);

    expect(getNearestClientObject()?.id()).toBe(third.id());
    expect(getNearestClientObject(null)?.id()).toBe(third.id());
    expect(getNearestClientObject("dog_")?.id()).toBe(second.id());
    expect(getNearestClientObject(clsid.dog_s as TClassId)?.id()).toBe(first.id());
    expect(getNearestClientObject((it) => it.name() === "dog_name" && it.clsid() === clsid.dog_red)?.id()).toBe(
      second.id()
    );
  });

  it("getClientObjects should correctly search for client objects", () => {
    const actor: ClientObject = mockActorClientGameObject({
      clsid: () => clsid.actor as TClassId,
      name: () => "actor_name",
    });
    const first: ClientObject = mockClientGameObject({
      clsid: () => clsid.script_stalker as TClassId,
      name: () => "stalker_name",
    });
    const second: ClientObject = mockClientGameObject({
      clsid: () => clsid.pseudodog_s as TClassId,
      name: () => "dog_name",
    });
    const third: ClientObject = mockClientGameObject();

    mockClientGameObject({ parent: () => actor });

    registerActor(actor);

    const firstList: MockLuaTable<TIndex, ClientObject> = getClientObjects() as unknown as MockLuaTable<
      TIndex,
      ClientObject
    >;

    expect(firstList.map((it) => it.id())).toEqual([first.id(), second.id(), third.id()]);

    expect(
      (getClientObjects(clsid.script_stalker as TClassId) as unknown as MockLuaTable<TIndex, ClientObject>).map(
        (it) => {
          return it.id();
        }
      )
    ).toEqual([first.id()]);
    expect(
      (getClientObjects(clsid.pseudodog_s as TClassId) as unknown as MockLuaTable<TIndex, ClientObject>).map((it) => {
        return it.id();
      })
    ).toEqual([second.id()]);

    expect(
      (getClientObjects("dog") as unknown as MockLuaTable<TIndex, ClientObject>).map((it) => {
        return it.id();
      })
    ).toEqual([second.id()]);
    expect(
      (getClientObjects("dog_name") as unknown as MockLuaTable<TIndex, ClientObject>).map((it) => {
        return it.id();
      })
    ).toEqual([second.id()]);
    expect(
      (
        getClientObjects(
          (it) => it.name() === "dog_name" && it.clsid() === clsid.pseudodog_s
        ) as unknown as MockLuaTable<TIndex, ClientObject>
      ).map((it) => {
        return it.id();
      })
    ).toEqual([second.id()]);
  });
});
