/**
 * Add include tag for multi-xml files.
 */
export function includeXmlFile(path: string): string {
  return `\n#include "${path}"\n`;
}
