import * as path from "path";

import { describe, expect, it } from "@jest/globals";

import { getExternDocs } from "#/parse/utils/get_extern_docs";
import { IExternFileDescriptor } from "#/parse/utils/types";

describe("parse_externals utility", () => {
  const SAMPLE_TS_FILE: string = path.resolve(__dirname, "__test__", "declaration.ts");

  it("should correctly collect extern docs", () => {
    const docs: Array<IExternFileDescriptor> = getExternDocs([SAMPLE_TS_FILE]);

    expect(docs).toHaveLength(1);
    expect(docs[0].extern).toHaveLength(4);

    expect(docs[0].extern[0]).toEqual({
      doc: "",
      file: SAMPLE_TS_FILE,
      name: "module.callback_name_one",
      parameters: [
        { parameterName: "a", parameterTypeName: "number" },
        { parameterName: "b", parameterTypeName: "string" },
        { parameterName: "c", parameterTypeName: "boolean" },
      ],
    });

    expect(docs[0].extern[1]).toEqual({
      doc: `Docblock.

[param] a - some number
[param] b - some string
[param] c - some boolean
[returns] some boolean value`,
      file: SAMPLE_TS_FILE,
      name: "module_two.callback_name_two",
      parameters: [
        { parameterName: "a", parameterTypeName: "SomeClass" },
        { parameterName: "b", parameterTypeName: "IAbstractInterface" },
      ],
    });

    expect(docs[0].extern[2]).toEqual({
      doc: `Docblock 2.

[param] c - some array
[param] d - another array
[returns] some boolean value`,
      file: SAMPLE_TS_FILE,
      name: "module_two.callback_name_two",
      parameters: [
        { parameterName: "c", parameterTypeName: "Array" },
        { parameterName: "d", parameterTypeName: "[number, string]" },
      ],
    });

    expect(docs[0].extern[3]).toEqual({
      doc: "",
      file: SAMPLE_TS_FILE,
      name: "module_two.callback_name_three",
      parameters: [{ parameterName: "[e, f]", parameterTypeName: "[number, string]" }],
    });
  });
});
