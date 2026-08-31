import { Navigate, Route, Routes } from "react-router";
import { ModuleIntroPage } from "../pages/exam/ModuleIntroPage";
import { FinalResultPage } from "../pages/results/FinalResultPage";
import { ObjectiveExamPage } from "../pages/exam/ObjectiveExamPage";
import { ResultPage } from "../pages/results/ResultPage";
import { ReviewPage } from "../pages/results/ReviewPage";
import { TestSelectionPage } from "../pages/library/TestSelectionPage";
import { TestOverviewPage } from "../pages/library/TestOverviewPage";
import { WritingExamPage } from "../pages/exam/WritingExamPage";
import { AdminTestManagementPage } from "../pages/admin/AdminTestManagementPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<TestSelectionPage />} />
      <Route path="/test/:testId" element={<TestOverviewPage />} />
      <Route path="/test/:testId/:module" element={<ModuleIntroPage />} />
      <Route
        path="/test/:testId/reading/exam"
        element={<ObjectiveExamPage module="reading" />}
      />
      <Route
        path="/test/:testId/listening/exam"
        element={<ObjectiveExamPage module="listening" />}
      />
      <Route
        path="/test/:testId/writing/exam"
        element={<WritingExamPage />}
      />
      <Route path="/test/:testId/:module/result" element={<ResultPage />} />
      <Route path="/test/:testId/:module/review" element={<ReviewPage />} />
      <Route path="/test/:testId/final-result" element={<FinalResultPage />} />
      <Route path="/admin/tests" element={<AdminTestManagementPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
