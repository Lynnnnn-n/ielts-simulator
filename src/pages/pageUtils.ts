import { useEffect, useState } from "react";
import { testRepository } from "../services/testRepository";
import type { ExamModule, MockTest } from "../domain/examTypes";

export function isExamModule(value: string | undefined): value is ExamModule {
  return value === "listening" || value === "reading" || value === "writing";
}

export function useMockTest(testId: string | undefined) {
  const [test, setTest] = useState<MockTest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    void testRepository.loadTest(testId ?? "").then((loaded) => {
      if (isMounted) {
        setTest(loaded);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [testId]);

  return { test, isLoading };
}

export function moduleTitle(module: ExamModule): string {
  if (module === "listening") {
    return "Listening";
  }

  if (module === "reading") {
    return "Reading";
  }

  return "Writing";
}
