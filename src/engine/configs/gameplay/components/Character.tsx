import { JSXNode, JSXXML } from "jsx-xml";

export interface ICharacterProps {
  id: string;
  className?: string;
  specificCharacter?: string;
}

/**
 * Description of generic character profile declaration.
 */
export function Character({ id, className, specificCharacter }: ICharacterProps): JSXNode {
  return (
    <character id={id}>
      <class>{className ?? id}</class>
      {specificCharacter ? <specific_character>{specificCharacter}</specific_character> : null}
    </character>
  );
}
