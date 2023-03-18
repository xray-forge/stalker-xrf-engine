import { ILtxConfigDescriptor, ILtxFieldDescriptor, LTX_ROOT, renderField } from "#/utils";

type TPossibleFieldDescriptorBase = Record<string, ILtxFieldDescriptor<unknown>> | Array<ILtxFieldDescriptor<unknown>>;
type TPossibleFieldDescriptorFull = TPossibleFieldDescriptorBase | (() => TPossibleFieldDescriptorBase);

/**
 * todo;
 */
function renderLtxSection(name: string | typeof LTX_ROOT, descriptorRaw: TPossibleFieldDescriptorFull): string {
  const sectionName: string = name === LTX_ROOT ? "\n" : `\n[${name}]\n`;
  const descriptor: TPossibleFieldDescriptorBase =
    typeof descriptorRaw === "function" ? descriptorRaw() : descriptorRaw;

  if (Array.isArray(descriptor)) {
    return sectionName + descriptor.map((it) => renderField(null, it)).join("\n") + "\n";
  }

  return Object.entries(descriptor).reduce(
    (result, [key, value]) => result + renderField(key, value) + "\n",
    sectionName
  );
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
