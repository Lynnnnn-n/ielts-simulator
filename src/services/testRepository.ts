import { mockTest01 } from "../data/mockTest01";
import { mockTest02 } from "../data/mockTest02";
import { mockTest03 } from "../data/mockTest03";
import { mockTest04 } from "../data/mockTest04";
import type { MockTest, MockTestMetadata } from "../domain/examTypes";
import { apiRequest, hasApiBaseUrl } from "./api/apiClient";

const localMockTests = [mockTest01, mockTest02, mockTest03, mockTest04];

export interface TestRepository {
  listTests(): Promise<MockTest[]>;
  loadTest(testId: string): Promise<MockTest | null>;
}

export class LocalTestRepository implements TestRepository {
  async listTests(): Promise<MockTest[]> {
    return localMockTests.filter((test) => test.metadata.status === "published");
  }

  async loadTest(testId: string): Promise<MockTest | null> {
    return (
      localMockTests.find(
        (test) => test.metadata.id === testId || test.metadata.slug === testId,
      ) ?? null
    );
  }
}

export class BackendAwareTestRepository implements TestRepository {
  private readonly localRepository = new LocalTestRepository();

  async listTests(): Promise<MockTest[]> {
    if (!hasApiBaseUrl()) {
      return this.localRepository.listTests();
    }

    try {
      const metadata = await apiRequest<MockTestMetadata[]>("/api/tests");
      const localTests = await this.localRepository.listTests();

      return metadata.map((item) => {
        const localTest = localTests.find(
          (test) => test.metadata.id === item.id || test.metadata.slug === item.slug,
        );

        if (!localTest) {
          return {
            ...mockTest01,
            metadata: item,
            materials: {
              listening: {
                available: item.modules.listening,
                notes: [],
                missing: item.modules.listening ? [] : ["Listening material is unavailable."],
              },
              reading: {
                available: item.modules.reading,
                notes: [],
                missing: item.modules.reading ? [] : ["Reading material is unavailable."],
              },
              writing: {
                available: item.modules.writing,
                notes: [],
                missing: item.modules.writing ? [] : ["Writing material is unavailable."],
              },
            },
          };
        }

        return {
          ...localTest,
          metadata: {
            ...localTest.metadata,
            ...item,
          },
        };
      });
    } catch {
      return this.localRepository.listTests();
    }
  }

  async loadTest(testId: string): Promise<MockTest | null> {
    return this.localRepository.loadTest(testId);
  }
}

export const testRepository = new BackendAwareTestRepository();
