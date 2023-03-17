import { ILtxConfigDescriptor, ILtxFieldDescriptor, LTX_ROOT, renderField } from "#/utils";

/**
 * todo;
 */
function renderLtxSection(
  name: string | typeof LTX_ROOT,
  object: Record<string, ILtxFieldDescriptor<unknown>> | Array<ILtxFieldDescriptor<unknown>>
): string {
  const sectionName: string = name === LTX_ROOT ? "\n" : `\n[${name}]\n`;

  if (Array.isArray(object)) {
    return sectionName + object.map((it) => renderField(null, it)).join("\n");
  }

  return Object.entries(object).reduce((result, [key, value]) => result + renderField(key, value) + "\n", sectionName);
}

/**
 * todo;
 */
export function renderJsonToLtx(filename: string, object: ILtxConfigDescriptor): string {
  let header: string = `; ${filename} @ generated ${new Date().toString()}\n`;

  if (object[LTX_ROOT]) {
    header += renderLtxSection(LTX_ROOT, object[LTX_ROOT]);
  }

  return (
    header +
    Object.entries(object).reduce((result, [key, object]) => {
      return result + renderLtxSection(key, object);
    }, "")
  );
}
