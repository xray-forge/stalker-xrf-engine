import { JSXNode, JSXXML } from "jsx-xml";

export interface IStartDialogProps {
  children: string;
}

/**
 * Description of generic character actor dialog.
 */
export function StartDialog({ children }: IStartDialogProps): JSXNode {
  return <start_dialog>{children}</start_dialog>;
}
