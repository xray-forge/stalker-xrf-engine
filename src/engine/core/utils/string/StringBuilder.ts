import { LuaArray } from "@/engine/lib/types";

/**
 * Class to handle large strings building.
 */
export class StringBuilder {
  protected content: LuaArray<string> = new LuaTable();

  public append(value: string): void {
    table.insert(this.content, value);
  }

  public build(separator: string = ""): string {
    if (this.content.length() > 0) {
      return table.concat(this.content, separator);
    } else {
      return "";
    }
  }
}
