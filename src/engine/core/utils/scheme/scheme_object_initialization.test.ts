import { describe, expect, it } from "@jest/globals";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import {
  initializeObjectCanSelectWeaponState,
  initializeObjectGroup,
  initializeObjectIgnoreThreshold,
  initializeObjectInfo,
  initializeObjectInvulnerability,
  initializeObjectTakeItemsEnabledState,
} from "@/engine/core/utils/scheme/scheme_object_initialization";
import { EScheme, GameObject } from "@/engine/lib/types";
import { mockGameObject, mockIniFile } from "@/fixtures/xray";

describe("scheme_object_initialization utils", () => {
  it("initializeObjectInvulnerability should correctly initialize", () => {
    const object: GameObject = mockGameObject();
    const state: IRegistryObjectState = registerObject(object);

    state.ini = mockIniFile("example.ltx", {
      existing: {
        invulnerable: true,
      },
    });
    state.activeSection = "existing";

    initializeObjectInvulnerability(object);

    expect(object.invulnerable).toHaveBeenCalledTimes(2);
    expect(object.invulnerable).toHaveBeenNthCalledWith(1);
    expect(object.invulnerable).toHaveBeenNthCalledWith(2, true);

    state.activeSection = "not-existing";

    initializeObjectInvulnerability(object);
    expect(object.invulnerable).toHaveBeenCalledTimes(4);
    expect(object.invulnerable).toHaveBeenNthCalledWith(3);
    expect(object.invulnerable).toHaveBeenNthCalledWith(4, false);
  });

  it("initializeObjectCanSelectWeaponState should correctly initialize", () => {
    const object: GameObject = mockGameObject();
    const state: IRegistryObjectState = registerObject(object);

    state.ini = mockIniFile("example.ltx", {
      logic: {},
      existing: {
        can_select_weapon: false,
      },
    });

    state.sectionLogic = "logic";
    state.activeSection = "existing";

    initializeObjectCanSelectWeaponState(object, EScheme.MEET, state, "existing");

    expect(object.can_select_weapon).toHaveBeenCalledTimes(1);
    expect(object.can_select_weapon).toHaveBeenNthCalledWith(1, false);

    state.activeSection = "not-existing";

    initializeObjectCanSelectWeaponState(object, EScheme.MEET, state, "not-existing");
    expect(object.can_select_weapon).toHaveBeenCalledTimes(2);
    expect(object.can_select_weapon).toHaveBeenNthCalledWith(2, true);

    state.ini = mockIniFile("example.ltx", {
      logic: {
        can_select_weapon: false,
      },
    });

    initializeObjectCanSelectWeaponState(object, EScheme.MEET, state, "not-existing");
    expect(object.can_select_weapon).toHaveBeenCalledTimes(3);
    expect(object.can_select_weapon).toHaveBeenNthCalledWith(3, false);
  });

  it("initializeObjectTakeItemsEnabledState should correctly initialize", () => {
    const object: GameObject = mockGameObject();
    const state: IRegistryObjectState = registerObject(object);

    state.ini = mockIniFile("example.ltx", {
      logic: {},
      existing: {
        take_items: false,
      },
    });

    state.sectionLogic = "logic";
    state.activeSection = "existing";

    initializeObjectTakeItemsEnabledState(object, EScheme.MEET, state, "existing");

    expect(object.take_items_enabled).toHaveBeenCalledTimes(1);
    expect(object.take_items_enabled).toHaveBeenNthCalledWith(1, false);

    state.activeSection = "not-existing";

    initializeObjectTakeItemsEnabledState(object, EScheme.MEET, state, "not-existing");
    expect(object.take_items_enabled).toHaveBeenCalledTimes(2);
    expect(object.take_items_enabled).toHaveBeenNthCalledWith(2, true);

    state.ini = mockIniFile("example.ltx", {
      logic: {
        take_items: false,
      },
    });

    initializeObjectTakeItemsEnabledState(object, EScheme.MEET, state, "not-existing");
    expect(object.take_items_enabled).toHaveBeenCalledTimes(3);
    expect(object.take_items_enabled).toHaveBeenNthCalledWith(3, false);
  });

  it("initializeObjectGroup should correctly initialize", () => {
    const object: GameObject = mockGameObject();

    initializeObjectGroup(object, mockIniFile("example.ltx", {}), "not-existing");

    expect(object.change_team).not.toHaveBeenCalled();

    initializeObjectGroup(
      object,
      mockIniFile("example.ltx", {
        existing: { group: 10 },
      }),
      "existing"
    );

    expect(object.change_team).toHaveBeenCalledWith(140, 150, 10);
  });

  it("initializeObjectInfo should correctly initialize", () => {
    const object: GameObject = mockGameObject();

    initializeObjectInfo(object, mockIniFile("example.ltx", {}), "not-existing");
    expect(object.give_info_portion).not.toHaveBeenCalled();
    expect(object.disable_info_portion).not.toHaveBeenCalled();

    initializeObjectInfo(
      object,
      mockIniFile("example.ltx", {
        existing: {
          in: "a|b",
          out: "c|d",
        },
      }),
      "existing"
    );
    expect(object.give_info_portion).toHaveBeenCalledTimes(2);
    expect(object.give_info_portion).toHaveBeenNthCalledWith(1, "a");
    expect(object.give_info_portion).toHaveBeenNthCalledWith(2, "b");

    expect(object.disable_info_portion).toHaveBeenCalledTimes(2);
    expect(object.disable_info_portion).toHaveBeenNthCalledWith(1, "c");
    expect(object.disable_info_portion).toHaveBeenNthCalledWith(2, "d");
  });

  it("initializeObjectIgnoreThreshold should correctly initialize", () => {
    const object: GameObject = mockGameObject();
    const state: IRegistryObjectState = registerObject(object);

    state.ini = mockIniFile("example.ltx", {
      logic: {
        threshold: "second",
      },
      existing: {
        threshold: "first",
      },
      first: {
        max_ignore_distance: 25,
        ignore_monster: 10,
      },
      second: {},
    });

    initializeObjectIgnoreThreshold(object, null, state, "meet@example");
    initializeObjectIgnoreThreshold(object, EScheme.NIL, state, "meet@example");

    expect(object.max_ignore_monster_distance).not.toHaveBeenCalled();
    expect(object.restore_max_ignore_monster_distance).not.toHaveBeenCalled();
    expect(object.ignore_monster_threshold).not.toHaveBeenCalled();
    expect(object.restore_ignore_monster_threshold).not.toHaveBeenCalled();

    initializeObjectIgnoreThreshold(object, EScheme.MEET, state, "existing");

    expect(object.max_ignore_monster_distance).toHaveBeenCalledWith(25);
    expect(object.ignore_monster_threshold).toHaveBeenCalledWith(10);
    expect(object.restore_max_ignore_monster_distance).not.toHaveBeenCalled();
    expect(object.restore_ignore_monster_threshold).not.toHaveBeenCalled();

    state.sectionLogic = "logic";
    initializeObjectIgnoreThreshold(object, null, state, "not-existing");

    expect(object.restore_max_ignore_monster_distance).toHaveBeenCalled();
    expect(object.restore_ignore_monster_threshold).toHaveBeenCalled();
  });
});
