import { Navigate, Route, Routes } from "react-router";
import { ModuleIntroPage } from "../pages/ModuleIntroPage";
import { ListeningExamPage } from "../pages/ListeningExamPage";
import { FinalResultPage } from "../pages/FinalResultPage";
import { ObjectiveExamPage } from "../pages/ObjectiveExamPage";
import { ResultPage } from "../pages/ResultPage";
import { ReviewPage } from "../pages/ReviewPage";
import { TestSelectionPage } from "../pages/TestSelectionPage";
import { WritingExamPage } from "../pages/WritingExamPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<TestSelectionPage />} />
      <Route path="/test/:testId/:module" element={<ModuleIntroPage />} />
      <Route
        path="/test/:testId/reading/exam"
        element={<ObjectiveExamPage module="reading" />}
      />
      <Route
        path="/test/:testId/listening/exam"
        element={<ListeningExamPage />}
      />
      <Route
        path="/test/:testId/writing/exam"
        element={<WritingExamPage />}
      />
      <Route path="/test/:testId/:module/result" element={<ResultPage />} />
      <Route path="/test/:testId/:module/review" element={<ReviewPage />} />
      <Route path="/test/:testId/final-result" element={<FinalResultPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
