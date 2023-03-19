import { describe, expect, it } from "@jest/globals";

describe("'bind' entry point", () => {
  const checkBinding = (name: string) => {
    // @ts-ignore
    expect(typeof global["bind"]).not.toBeNull();
    // @ts-ignore
    expect(typeof global["bind"]).toBe("object");
    // @ts-ignore
    expect(typeof global["bind"][name]).toBe("function");
  };

  it("should correctly inject binding for game objects", () => {
    require("@/engine/scripts/bind");

    checkBinding("actor");
    checkBinding("anomalyField");
    checkBinding("anomalyZone");
    checkBinding("artefact");
    checkBinding("camp");
    checkBinding("campfire");
    checkBinding("crow");
    checkBinding("heli");
    checkBinding("labX8Door");
    checkBinding("levelChanger");
    checkBinding("monster");
    checkBinding("phantom");
    checkBinding("physicObject");
    checkBinding("restrictor");
    checkBinding("signalLight");
    checkBinding("smartCover");
    checkBinding("smartTerrain");
    checkBinding("stalker");
  });
});
