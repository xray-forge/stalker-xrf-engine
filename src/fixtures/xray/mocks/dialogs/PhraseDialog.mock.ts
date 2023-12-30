import { jest } from "@jest/globals";
import { CPhraseDialog } from "xray16";

import { PhraseDialog, TRate, TStringId } from "@/engine/lib/types";
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

  public AddPhrase = jest.fn((text: string, phraseId: TStringId, prevPhraseId: TStringId, goodwillLevel: TRate) => {
    const phrase: MockPhrase = new MockPhrase(phraseId, text, prevPhraseId, goodwillLevel);

    this.list[phraseId] = phrase;

    return phrase;
  });

  public GetPhrase = jest.fn((id: TStringId) => {
    if (this.list[id]) {
      return this.list[id];
    } else {
      throw new Error(`Unexpected phrase ID for get provided: '${id}'.`);
    }
  });

  public asMock(): PhraseDialog {
    return this as unknown as PhraseDialog;
  }
}
