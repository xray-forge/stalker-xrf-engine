import { PhraseScript } from "@/engine/lib/types";

/**
 * Mock phrase script entry for game dialogs.
 */
export class MockPhraseScript {
  public static mock(): PhraseScript {
    return new MockPhraseScript() as unknown as PhraseScript;
  }

  public text?: string;
  public action?: string;
  public precondition?: string;

  public SetScriptText(text: string): void {
    this.text = text;
  }

  public AddPrecondition(precondition: string): void {
    this.precondition = precondition;
  }

  public AddAction(action: string): void {
    this.precondition = action;
  }
}
