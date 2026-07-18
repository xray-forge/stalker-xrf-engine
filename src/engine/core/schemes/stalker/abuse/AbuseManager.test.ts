import { beforeEach, describe, expect, it } from "@jest/globals";
import { time_global } from "xray16";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";
import { replaceFunctionMockOnce } from "xray16/testing/utils";

import { ISchemeAbuseState } from "@/engine/core/schemes/stalker/abuse/abuse_types";
import { AbuseManager } from "@/engine/core/schemes/stalker/abuse/AbuseManager";
import { EScheme } from "@/engine/lib/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";

describe("AbuseManager", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should initialize with default abuse settings", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeAbuseState = mockSchemeState(EScheme.ABUSE);
    const manager: AbuseManager = new AbuseManager(object, state);

    expect(manager.object).toBe(object);
    expect(manager.state).toBe(state);
    expect(manager.isEnabled).toBe(true);
    expect(manager.isHitDone).toBe(false);
    expect(manager.abuseRate).toBe(2);
    expect(manager.abuseValue).toBe(0);
    expect(manager.abuseThreshold).toBe(5);
    expect(manager.lastUpdatedAt).toBeNull();
  });

  it("should initialize update time, decay abuse, and clamp its maximum", () => {
    const manager: AbuseManager = new AbuseManager(MockGameObject.mock(), mockSchemeState(EScheme.ABUSE));

    replaceFunctionMockOnce(time_global, () => 1_000);

    expect(manager.update()).toBe(false);
    expect(manager.lastUpdatedAt).toBe(1_000);

    manager.abuseValue = 10;

    replaceFunctionMockOnce(time_global, () => 11_000);

    expect(manager.update()).toBe(true);
    expect(manager.abuseValue).toBe(5.5);
    expect(manager.lastUpdatedAt).toBe(11_000);
  });

  it("should report threshold abuse and re-arm a completed hit after decay", () => {
    const manager: AbuseManager = new AbuseManager(MockGameObject.mock(), mockSchemeState(EScheme.ABUSE));

    manager.abuseValue = 5;
    expect(manager.isAbused()).toBe(true);

    manager.abuseValue = 4;
    expect(manager.isAbused()).toBe(false);

    manager.isHitDone = true;
    manager.lastUpdatedAt = 0;

    replaceFunctionMockOnce(time_global, () => 20_000);

    expect(manager.update()).toBe(false);
    expect(manager.abuseValue).toBe(3);
    expect(manager.isHitDone).toBe(false);
  });

  it("should add abuse using the configured rate and clear it", () => {
    const manager: AbuseManager = new AbuseManager(MockGameObject.mock(), mockSchemeState(EScheme.ABUSE));

    manager.addAbuse(2);
    expect(manager.abuseValue).toBe(4);

    manager.setAbuseRate(3);
    manager.addAbuse(2);
    expect(manager.abuseValue).toBe(10);

    manager.clearAbuse();
    expect(manager.abuseValue).toBe(0);
  });

  it("should disable updates and additions until abuse is enabled again", () => {
    const manager: AbuseManager = new AbuseManager(MockGameObject.mock(), mockSchemeState(EScheme.ABUSE));

    manager.addAbuse(2);
    manager.disableAbuse();
    manager.addAbuse(2);

    expect(manager.abuseValue).toBe(4);
    expect(manager.update()).toBe(false);
    expect(manager.lastUpdatedAt).toBeNull();

    manager.enableAbuse();
    manager.addAbuse(2);

    expect(manager.isEnabled).toBe(true);
    expect(manager.abuseValue).toBe(8);
  });
});
