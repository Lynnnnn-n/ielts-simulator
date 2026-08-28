import { useEffect } from "react";

export function useActiveExamLeaveWarning(isActive: boolean) {
  useEffect(() => {
    if (!isActive) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isActive]);
}
