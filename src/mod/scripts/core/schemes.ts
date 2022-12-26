export const schemes: Record<string, string> = {};
export const stypes: Record<string, string> = {};

export function loadScheme(filename: string, scheme: string, stype: string): void {
  schemes[scheme] = filename;
  stypes[scheme] = stype;
}
