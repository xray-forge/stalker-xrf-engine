import { CPhraseDialog } from "xray16";

import { MockPhrase } from "@/fixtures/xray/mocks/dialogs/Phrase.mock";

/**
 * Mock dialog phrase.
 */
export class MockPhraseDialog {
  public static mock(dialog = new MockPhraseDialog()): CPhraseDialog {
    return dialog as unknown as CPhraseDialog;
  }

  public static create(): MockPhraseDialog {
    return new MockPhraseDialog();
  }

  public list: Record<string, MockPhrase> = {};

  public AddPhrase(id: string, text: string, prevPhraseId: string, goodwillLevel: number) {
    const phrase = new MockPhrase(id, text, prevPhraseId, goodwillLevel);

    this.list[id] = phrase;

    return phrase;
  }
}
