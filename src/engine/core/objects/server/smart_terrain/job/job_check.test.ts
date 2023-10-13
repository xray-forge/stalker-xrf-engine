import { describe, expect, it } from "@jest/globals";
import { game } from "xray16";

import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain";
import {
  areNoStalkersWorkingOnJobs,
  isJobAvailableToObject,
} from "@/engine/core/objects/server/smart_terrain/job/job_check";
import { createObjectJobDescriptor } from "@/engine/core/objects/server/smart_terrain/job/job_create";
import {
  IObjectJobDescriptor,
  ISmartTerrainJobDescriptor,
} from "@/engine/core/objects/server/smart_terrain/job/job_types";
import { AnyObject, ServerCreatureObject, ServerMonsterBaseObject } from "@/engine/lib/types";
import { mockSmartTerrain } from "@/fixtures/engine";
import { mockServerAlifeHumanStalker, mockServerAlifeMonsterBase } from "@/fixtures/xray";

describe("job_check utils", () => {
  it("areNoStalkersWorkingOnJobs should correctly check whether no stalkers are working", () => {
    expect(areNoStalkersWorkingOnJobs($fromArray<IObjectJobDescriptor>([]))).toBe(true);
    expect(
      areNoStalkersWorkingOnJobs(
        $fromArray<IObjectJobDescriptor>([
          createObjectJobDescriptor(mockServerAlifeMonsterBase()),
          createObjectJobDescriptor(mockServerAlifeMonsterBase()),
        ])
      )
    ).toBe(true);
    expect(
      areNoStalkersWorkingOnJobs(
        $fromArray<IObjectJobDescriptor>([
          createObjectJobDescriptor(mockServerAlifeMonsterBase()),
          createObjectJobDescriptor(mockServerAlifeHumanStalker()),
        ])
      )
    ).toBe(false);
    expect(
      areNoStalkersWorkingOnJobs(
        $fromArray<IObjectJobDescriptor>([
          createObjectJobDescriptor(mockServerAlifeHumanStalker()),
          createObjectJobDescriptor(mockServerAlifeHumanStalker()),
        ])
      )
    ).toBe(false);
  });

  it("isJobAvailableToObject should correctly check job accessibility for creatures", () => {
    const smartTerrain: SmartTerrain = mockSmartTerrain();
    const monster: ServerMonsterBaseObject = mockServerAlifeMonsterBase();
    const stalker: ServerMonsterBaseObject = mockServerAlifeHumanStalker();

    expect(
      isJobAvailableToObject(
        createObjectJobDescriptor(monster),
        { isMonsterJob: false, id: 2 } as ISmartTerrainJobDescriptor,
        smartTerrain
      )
    ).toBe(false);
    expect(
      isJobAvailableToObject(
        createObjectJobDescriptor(monster),
        { isMonsterJob: true, id: 1 } as ISmartTerrainJobDescriptor,
        smartTerrain
      )
    ).toBe(true);
    expect(
      isJobAvailableToObject(
        createObjectJobDescriptor(stalker),
        { isMonsterJob: false, id: 2 } as ISmartTerrainJobDescriptor,
        smartTerrain
      )
    ).toBe(true);
    expect(
      isJobAvailableToObject(
        createObjectJobDescriptor(stalker),
        { isMonsterJob: true, id: 1 } as ISmartTerrainJobDescriptor,
        smartTerrain
      )
    ).toBe(false);
  });

  it("isJobAvailableToObject should wait sometime if job worker died", () => {
    const smartTerrain: SmartTerrain = mockSmartTerrain();
    const deadStalker: ServerMonsterBaseObject = mockServerAlifeHumanStalker();

    smartTerrain.jobDeadTimeById.set(10, game.get_game_time());

    expect(
      isJobAvailableToObject(
        createObjectJobDescriptor(deadStalker),
        { isMonsterJob: false, id: 10 } as ISmartTerrainJobDescriptor,
        smartTerrain
      )
    ).toBe(false);
    expect(
      isJobAvailableToObject(
        createObjectJobDescriptor(deadStalker),
        { isMonsterJob: false, id: 11 } as ISmartTerrainJobDescriptor,
        smartTerrain
      )
    ).toBe(true);

    smartTerrain.jobDeadTimeById.delete(10);

    expect(
      isJobAvailableToObject(
        createObjectJobDescriptor(deadStalker),
        { isMonsterJob: false, id: 10 } as ISmartTerrainJobDescriptor,
        smartTerrain
      )
    ).toBe(true);
    expect(
      isJobAvailableToObject(
        createObjectJobDescriptor(deadStalker),
        { isMonsterJob: false, id: 11 } as ISmartTerrainJobDescriptor,
        smartTerrain
      )
    ).toBe(true);
  });

  it("isJobAvailableToObject should correctly check job accessibility with precondition call", () => {
    const smartTerrain: SmartTerrain = mockSmartTerrain();
    const monster: ServerMonsterBaseObject = mockServerAlifeMonsterBase();
    const job: IObjectJobDescriptor = createObjectJobDescriptor(monster);

    expect(
      isJobAvailableToObject(
        job,
        {
          isMonsterJob: true,
          id: 1,
          preconditionFunction: () => true,
        } as AnyObject as ISmartTerrainJobDescriptor,
        smartTerrain
      )
    ).toBe(true);
    expect(
      isJobAvailableToObject(
        job,
        { isMonsterJob: true, id: 1, preconditionFunction: () => false } as AnyObject as ISmartTerrainJobDescriptor,
        smartTerrain
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
            objectJobDescriptor: IObjectJobDescriptor
          ) =>
            serverObject === monster &&
            smartTerrainParameter === smartTerrain &&
            preconditionParameters.a === 1 &&
            objectJobDescriptor === job,
          preconditionParameters: { a: 1 },
        } as AnyObject as ISmartTerrainJobDescriptor,
        smartTerrain
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
            objectJobDescriptor: IObjectJobDescriptor
          ) =>
            serverObject === monster &&
            smartTerrainParameter === smartTerrain &&
            preconditionParameters.a === 2 &&
            objectJobDescriptor === job,
          preconditionParameters: { a: 1 },
        } as AnyObject as ISmartTerrainJobDescriptor,
        smartTerrain
      )
    ).toBe(false);
  });
});
