import { mockTest01 } from "../data/mockTest01";
import type { MockTest } from "../domain/examTypes";

export interface TestRepository {
  listTests(): Promise<MockTest[]>;
  loadTest(testId: string): Promise<MockTest | null>;
}

export class LocalTestRepository implements TestRepository {
  async listTests(): Promise<MockTest[]> {
    return [mockTest01];
  }

  async loadTest(testId: string): Promise<MockTest | null> {
    return mockTest01.metadata.id === testId ? mockTest01 : null;
  }
}

export const testRepository = new LocalTestRepository();
