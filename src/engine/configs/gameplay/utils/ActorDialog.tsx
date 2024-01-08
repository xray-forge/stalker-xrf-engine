import { JSXNode, JSXXML } from "jsx-xml";

export interface IActorDialogProps {
  children: string;
}

/**
 * Description of generic character actor dialog.
 */
export function ActorDialog({ children }: IActorDialogProps): JSXNode {
  return <actor_dialog>{children}</actor_dialog>;
}
