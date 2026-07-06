import { Phrase } from "xray16/alias";
import { MockPhraseScript } from "xray16/mocks";

/**
 * Mock phrase entry for game dialogs.
 */
export class MockPhrase {
  public static mock(id: string, text: string, prevPhraseId: string, goodwillLevel: number): Phrase {
    return new MockPhrase(id, text, prevPhraseId, goodwillLevel) as unknown as Phrase;
  }

  public id: string;
  public text: string;
  public prevPhraseId: string;
  public goodwillLevel: number;
  public script: MockPhraseScript;

  public constructor(id: string, text: string, prevPhraseId: string, goodwillLevel: number) {
    this.id = id;
    this.text = text;
    this.prevPhraseId = prevPhraseId;
    this.goodwillLevel = goodwillLevel;
    this.script = new MockPhraseScript();
  }

  public GetPhraseScript(): MockPhraseScript {
    return this.script;
  }
}
