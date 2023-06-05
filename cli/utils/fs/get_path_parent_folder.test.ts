import { describe, expect, it } from "@jest/globals";

import { getPathParentFolder } from "#/utils/fs/get_path_parent_folder";

describe("getPathParentFolder utility", () => {
  it("should correctly get parent folder", () => {
    expect(getPathParentFolder("/user/bin/utils/example.sh")).toBe("utils");
    expect(getPathParentFolder("something/example.sh")).toBe("something");
    expect(getPathParentFolder("a/b.sh")).toBe("a");
    expect(getPathParentFolder("/a.sh")).toBe("");
    expect(getPathParentFolder("F:\\parent\\it.exe")).toBe("parent");
    expect(getPathParentFolder("F:\\another\\nested\\it.exe")).toBe("nested");
    expect(getPathParentFolder("F:\\it.exe")).toBe("");
  });
});
