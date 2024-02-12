import { describe, expect, it } from "@jest/globals";
import { game } from "xray16";

import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { areNoStalkersWorkingOnJobs, isJobAvailableToObject } from "@/engine/core/objects/smart_terrain/job/job_check";
import { createObjectJobDescriptor } from "@/engine/core/objects/smart_terrain/job/job_create";
import { IObjectJobState, ISmartTerrainJobDescriptor } from "@/engine/core/objects/smart_terrain/job/job_types";
import { AnyObject, ServerCreatureObject, ServerMonsterBaseObject } from "@/engine/lib/types";
import { MockSmartTerrain } from "@/fixtures/engine";
import { MockAlifeHumanStalker, MockAlifeMonsterBase } from "@/fixtures/xray";

describe("areNoStalkersWorkingOnJobs util", () => {
  it("should correctly check whether no stalkers are working", () => {
    expect(areNoStalkersWorkingOnJobs($fromArray<IObjectJobState>([]))).toBe(true);
    expect(
      areNoStalkersWorkingOnJobs(
        $fromArray<IObjectJobState>([
          createObjectJobDescriptor(MockAlifeMonsterBase.mock()),
          createObjectJobDescriptor(MockAlifeMonsterBase.mock()),
        ])
      )
    ).toBe(true);
    expect(
      areNoStalkersWorkingOnJobs(
        $fromArray<IObjectJobState>([
          createObjectJobDescriptor(MockAlifeMonsterBase.mock()),
          createObjectJobDescriptor(MockAlifeHumanStalker.mock()),
        ])
      )
    ).toBe(false);
    expect(
      areNoStalkersWorkingOnJobs(
        $fromArray<IObjectJobState>([
          createObjectJobDescriptor(MockAlifeHumanStalker.mock()),
          createObjectJobDescriptor(MockAlifeHumanStalker.mock()),
        ])
      )
    ).toBe(false);
  });
});

describe("isJobAvailableToObject util", () => {
  it("should correctly check job accessibility for creatures", () => {
    const terrain: SmartTerrain = MockSmartTerrain.mock();
    const monster: ServerMonsterBaseObject = MockAlifeMonsterBase.mock();
    const stalker: ServerMonsterBaseObject = MockAlifeHumanStalker.mock();

    expect(
      isJobAvailableToObject(
        createObjectJobDescriptor(monster),
        { isMonsterJob: false, id: 2 } as ISmartTerrainJobDescriptor,
        terrain
      )
    ).toBe(false);
    expect(
      isJobAvailableToObject(
        createObjectJobDescriptor(monster),
        { isMonsterJob: true, id: 1 } as ISmartTerrainJobDescriptor,
        terrain
      )
    ).toBe(true);
    expect(
      isJobAvailableToObject(
        createObjectJobDescriptor(stalker),
        { isMonsterJob: false, id: 2 } as ISmartTerrainJobDescriptor,
        terrain
      )
    ).toBe(true);
    expect(
      isJobAvailableToObject(
        createObjectJobDescriptor(stalker),
        { isMonsterJob: true, id: 1 } as ISmartTerrainJobDescriptor,
        terrain
      )
    ).toBe(false);
  });

  it("should wait sometime if job worker died", () => {
    const terrain: SmartTerrain = MockSmartTerrain.mock();
    const deadStalker: ServerMonsterBaseObject = MockAlifeHumanStalker.mock();

    terrain.jobDeadTimeById.set(10, game.get_game_time());

    expect(
      isJobAvailableToObject(
        createObjectJobDescriptor(deadStalker),
        { isMonsterJob: false, id: 10 } as ISmartTerrainJobDescriptor,
        terrain
      )
    ).toBe(false);
    expect(
      isJobAvailableToObject(
        createObjectJobDescriptor(deadStalker),
        { isMonsterJob: false, id: 11 } as ISmartTerrainJobDescriptor,
        terrain
      )
    ).toBe(true);

    terrain.jobDeadTimeById.delete(10);

    expect(
      isJobAvailableToObject(
        createObjectJobDescriptor(deadStalker),
        { isMonsterJob: false, id: 10 } as ISmartTerrainJobDescriptor,
        terrain
      )
    ).toBe(true);
    expect(
      isJobAvailableToObject(
        createObjectJobDescriptor(deadStalker),
        { isMonsterJob: false, id: 11 } as ISmartTerrainJobDescriptor,
        terrain
      )
    ).toBe(true);
  });

  it("should correctly check job accessibility with precondition call", () => {
    const terrain: SmartTerrain = MockSmartTerrain.mock();
    const monster: ServerMonsterBaseObject = MockAlifeMonsterBase.mock();
    const job: IObjectJobState = createObjectJobDescriptor(monster);

    expect(
      isJobAvailableToObject(
        job,
        {
          isMonsterJob: true,
          id: 1,
          preconditionFunction: () => true,
        } as AnyObject as ISmartTerrainJobDescriptor,
        terrain
      )
    ).toBe(true);
    expect(
      isJobAvailableToObject(
        job,
        { isMonsterJob: true, id: 1, preconditionFunction: () => false } as AnyObject as ISmartTerrainJobDescriptor,
        terrain
      )
    ).toBe(false);

    expect(
      isJobAvailableToObject(
        job,
        {
          isMonsterJob: true,
          id: 1,
          preconditionFunction: (
            serverObject: ServerCreatureObject,
            smartTerrainParameter: SmartTerrain,
            preconditionParameters: AnyObject,
            objectJobDescriptor: IObjectJobState
          ) =>
            serverObject === monster &&
            smartTerrainParameter === terrain &&
            preconditionParameters.a === 1 &&
            objectJobDescriptor === job,
          preconditionParameters: { a: 1 },
        } as AnyObject as ISmartTerrainJobDescriptor,
        terrain
      )
    ).toBe(true);
    expect(
      isJobAvailableToObject(
        job,
        {
          isMonsterJob: true,
          id: 1,
          preconditionFunction: (
            serverObject: ServerCreatureObject,
            smartTerrainParameter: SmartTerrain,
            preconditionParameters: AnyObject,
            objectJobDescriptor: IObjectJobState
          ) =>
            serverObject === monster &&
            smartTerrainParameter === terrain &&
            preconditionParameters.a === 2 &&
            objectJobDescriptor === job,
          preconditionParameters: { a: 1 },
        } as AnyObject as ISmartTerrainJobDescriptor,
        terrain
      )
    ).toBe(false);
  });
});
