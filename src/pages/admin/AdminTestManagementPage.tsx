import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { MockTestMetadata } from "../../domain/examTypes";
import { adminTestService } from "../../services/adminTestService";
import styles from "./AdminTestManagementPage.module.css";

function formatTestType(testType: MockTestMetadata["testType"]): string {
  return testType === "academic" || testType === "Academic"
    ? "Academic"
    : "General Training";
}

function moduleSummary(test: MockTestMetadata): string {
  return Object.entries(test.modules)
    .filter(([, available]) => available)
    .map(([module]) => module[0].toUpperCase() + module.slice(1))
    .join(" | ");
}

export function AdminTestManagementPage() {
  const [tests, setTests] = useState<MockTestMetadata[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">(
    "loading",
  );

  useEffect(() => {
    let isMounted = true;

    void adminTestService
      .listAllTests()
      .then((items) => {
        if (!isMounted) {
          return;
        }

        setTests(items);
        setStatus("ready");
      })
      .catch(() => {
        if (isMounted) {
          setStatus("unavailable");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className={styles.page}>
      <Link className={styles.backLink} to="/">
        Back to Test Library
      </Link>
      <section className={styles.header}>
        <h1>Test Management</h1>
        <p>Mock test metadata, publication state, import and asset operations.</p>
      </section>

      {status === "loading" ? <p>Loading tests...</p> : null}
      {status === "unavailable" ? (
        <section className={styles.notice}>
          <h2>Backend unavailable</h2>
          <p>
            Set VITE_API_BASE_URL and start the FastAPI backend to manage tests.
          </p>
        </section>
      ) : null}
      {status === "ready" && tests.length === 0 ? (
        <section className={styles.notice}>
          <h2>No backend tests found</h2>
          <p>Use the structured import endpoint to add a draft mock test.</p>
        </section>
      ) : null}

      {tests.length > 0 ? (
        <section className={styles.tablePanel}>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Modules</th>
                <th>Status</th>
                <th>Version</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => (
                <tr key={test.id}>
                  <td>{test.title}</td>
                  <td>{formatTestType(test.testType)}</td>
                  <td>{moduleSummary(test) || "None"}</td>
                  <td>{test.status}</td>
                  <td>{test.version}</td>
                  <td>{new Date(test.updatedAt).toLocaleString()}</td>
                  <td>
                    <span>Preview</span>
                    <span>Edit Metadata</span>
                    <span>Assets</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
    </main>
  );
}
