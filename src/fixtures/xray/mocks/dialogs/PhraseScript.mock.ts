import { Optional, PhraseScript, TName } from "@/engine/lib/types";

/**
 * Mock phrase script entry for game dialogs.
 */
export class MockPhraseScript {
  public static mock(): PhraseScript {
    return new MockPhraseScript() as unknown as PhraseScript;
  }

  public text: Optional<string> = null;
  public actions: Array<TName> = [];
  public preconditions: Array<TName> = [];

  public SetScriptText(text: string): void {
    this.text = text;
  }

  public AddPrecondition(precondition: string): void {
    this.preconditions.push(precondition);
  }

  public AddAction(action: string): void {
    this.actions.push(action);
  }
}
