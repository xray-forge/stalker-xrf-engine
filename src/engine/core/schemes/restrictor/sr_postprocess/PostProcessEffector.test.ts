import { describe, expect, it, jest } from "@jest/globals";
import { effector, effector_params } from "xray16";
import { EffectorParams } from "xray16/alias";
import { AnyObject } from "xray16/lib";

import { PostProcessEffector } from "@/engine/core/schemes/restrictor/sr_postprocess/PostProcessEffector";

describe("PostProcessEffector", () => {
  it("should correctly initialize", () => {
    const postProcessEffector: PostProcessEffector = new PostProcessEffector(2005);

    expect(postProcessEffector).toBeInstanceOf(effector);
    expect((postProcessEffector as unknown as AnyObject).type).toBe(2005);
    expect((postProcessEffector as unknown as AnyObject).time).toBe(10_000_000);
    expect(postProcessEffector.params).toBeInstanceOf(effector_params);
  });

  it("should assign own parameters when processing", () => {
    const postProcessEffector: PostProcessEffector = new PostProcessEffector(2005);
    const params: EffectorParams = new effector_params();
    const baseProcess = jest.spyOn(effector.prototype, "process");

    postProcessEffector.params.gray = 0.5;

    expect(postProcessEffector.process(params)).toBe(true);
    expect(params.assign).toHaveBeenCalledWith(postProcessEffector.params);
    expect(baseProcess).toHaveBeenCalledWith(params);

    baseProcess.mockRestore();
  });
});
