import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../lib/api";

/**
 * Unified user test component:
 * - list published tests
 * - start an attempt (from list or via :testId route param)
 * - attempt view (timer + progress + questions)
 * - auto-submit on expiry and manual submit
 * - result view
 *
 * Background/wrapper uses the gradient overlay you provided.
 */

export default function UserAttempt() {
  const { testId: routeTestId } = useParams(); // optional param to auto-start
  const navigate = useNavigate();

  // UI state
  const [step, setStep] = useState("loading"); // loading | list | attempt | result | error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Tests list
  const [tests, setTests] = useState([]);

  // Attempt state
  const [test, setTest] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [answers, setAnswers] = useState([]); // array of {questionIndex, selectedIndex}
  const [expiresAt, setExpiresAt] = useState(null); // timestamp ms
  const [durationMs, setDurationMs] = useState(0); // for progress calculation
  const [timeLeftSec, setTimeLeftSec] = useState(0);
  const timerRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);

  // Result
  const [attemptResult, setAttemptResult] = useState(null);

  // --- Utility: go to login on 401 ---
  const handleAuthError = () => {
    localStorage.removeItem("user_token");
    navigate("/user/login");
  };

  // --- Fetch tests list ---
  async function fetchTests() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/user/givetests");
      if (data?.success) {
        setTests(Array.isArray(data.tests) ? data.tests : []);
        setStep("list");
      } else {
        setError(data?.message || "Could not load tests");
        setStep("error");
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        handleAuthError();
        return;
      }
      setError("Failed to load tests. Try again later.");
      setStep("error");
    } finally {
      setLoading(false);
    }
  }

  // --- Start attempt (server returns attemptId, test payload, expiresAt) ---
  async function startAttempt(testId) {
    setError("");
    setSubmitting(false);
    try {
      setLoading(true);
      const { data } = await api.post(`/api/user/${testId}/start`);
      if (!data?.success) {
        const msg = data?.message || "Cannot start test.";
        setError(msg);
        alert(msg);
        return;
      }

      // server returns attemptId, test, expiresAt
      setAttemptId(data.attemptId);
      setTest(data.test);
      setAnswers([]);
      const exp = data.expiresAt ? new Date(data.expiresAt).getTime() : Date.now() + (data.test.durationMinutes || 0) * 60000;
      setExpiresAt(exp);
      const dur = (data.test.durationMinutes || 0) * 60 * 1000;
      setDurationMs(dur || (exp - Date.now()));
      setStep("attempt");

      // ensure no duplicate interval
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // tick once immediately (so UI shows correct time without waiting 1s)
      const now = Date.now();
      const left = Math.max(0, Math.round((exp - now) / 1000));
      setTimeLeftSec(left);

      // start interval using expiresAt computation (robust against re-renders)
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const left = Math.max(0, Math.round((exp - now) / 1000));
        setTimeLeftSec(left);
        if (left <= 0) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          autoSubmit(); // auto-submit
        }
      }, 500); // 500ms for smoother progress updates
    } catch (err) {
      if (err?.response?.status === 401) {
        handleAuthError();
        return;
      }
      setError(err?.response?.data?.message || "Failed to start attempt");
      alert(error || "Failed to start attempt");
    } finally {
      setLoading(false);
    }
  }

  // --- Select option ---
  function selectOption(questionIndex, optionIndex) {
    setAnswers(prev => {
      const next = [...prev];
      const found = next.find(a => a.questionIndex === questionIndex);
      if (found) found.selectedIndex = optionIndex;
      else next.push({ questionIndex, selectedIndex: optionIndex });
      return next;
    });
  }

  // --- Submit attempt (manual/auto) ---
  async function submitAttempt(isAuto = false) {
    if (!attemptId || !test?._id) {
      alert("Attempt not properly started.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = { attemptId, answers };
      const { data } = await api.post(`/api/user/${test._id}/submit`, payload);
      if (!data?.success) {
        alert(data?.message || "Submit failed");
        setSubmitting(false);
        return;
      }

      // fetch the attempt result (use attemptId returned or our attemptId)
      const id = data.attemptId || attemptId;
      await fetchAttemptResult(id);
    } catch (err) {
      if (err?.response?.status === 401) {
        handleAuthError();
        return;
      }
      alert("Submit error. Try again.");
    } finally {
      setSubmitting(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }

  // auto submit wrapper
  function autoSubmit() {
    submitAttempt(true);
  }

  // --- Fetch attempt/result by id ---
  async function fetchAttemptResult(id) {
    setLoading(true);
    try {
      // try primary endpoint first
      let res;
      try {
        res = await api.get(`/api/user/attempt/${id}`);
      } catch (e) {
        // fallback
        res = await api.get(`/api/user/result/${id}`);
      }

      if (res?.data?.success) {
        const attempt = res.data.attempt || res.data.attemptData || res.data;
        setAttemptResult(attempt);
        setStep("result");
      } else {
        setError(res?.data?.message || "Could not fetch attempt result");
        setStep("error");
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        handleAuthError();
        return;
      }
      setError("Failed to retrieve result");
      setStep("error");
    } finally {
      setLoading(false);
    }
  }

  // --- Effects: initial list load and optional auto-start from route param ---
  useEffect(() => {
    // if a routeTestId is present, start attempt directly (auto-start)
    if (routeTestId) {
      // no list fetch required; start attempt for the given id
      startAttempt(routeTestId);
      return;
    }
    // otherwise load list
    fetchTests();
    // cleanup on unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeTestId]);

  // --- Derived values for timer/progress ---
  const percentLeft = (() => {
    if (!expiresAt || !durationMs) return 0;
    const now = Date.now();
    const leftMs = Math.max(0, expiresAt - now);
    return Math.max(0, Math.min(100, Math.round((leftMs / durationMs) * 100)));
  })();

  // --- UI: background wrapper you requested ---
  const BackgroundWrapper = ({ children }) => (
    <div className="min-h-screen w-full bg-white relative">
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(229,231,235,0.8) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(229,231,235,0.8) 1px, transparent 1px),
            radial-gradient(circle 500px at 0% 20%, rgba(139,92,246,0.3), transparent),
            radial-gradient(circle 500px at 100% 0%, rgba(59,130,246,0.3), transparent)
          `,
          backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );

  // --- Rendering branches ---

  // Loading (global)
  if (loading && step !== "attempt") {
    return (
      <BackgroundWrapper>
        <div className="max-w-4xl mx-auto p-8">
          <div className="bg-white/70 backdrop-blur rounded-2xl p-8 shadow-lg border border-gray-100/60 text-center">
            <div className="animate-spin inline-block w-10 h-10 border-4 border-gray-300 border-t-gray-700 rounded-full mb-4" />
            <div className="text-gray-700">Loading…</div>
          </div>
        </div>
      </BackgroundWrapper>
    );
  }

  // Error
  if (step === "error") {
    return (
      <BackgroundWrapper>
        <div className="max-w-3xl mx-auto p-8">
          <div className="bg-white/70 backdrop-blur rounded-2xl p-6 shadow-lg border border-red-100/60 text-center">
            <h3 className="text-xl font-semibold text-red-700 mb-2">Something went wrong</h3>
            <p className="text-sm text-red-600 mb-4">{error || "An unexpected error occurred."}</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => { setError(""); fetchTests(); }} className="px-4 py-2 bg-indigo-600 text-white rounded">Retry</button>
              <button onClick={() => navigate("/")} className="px-4 py-2 border rounded">Home</button>
            </div>
          </div>
        </div>
      </BackgroundWrapper>
    );
  }

  // LIST view
  if (step === "list") {
    return (
      <BackgroundWrapper>
        <div className="max-w-5xl mx-auto p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Available Tests</h1>
              <p className="text-gray-600 mt-1">Attempt published tests and see your results instantly.</p>
            </div>
            <div>
              <button onClick={() => fetchTests()} className="px-4 py-2 bg-white/60 backdrop-blur border border-gray-200 rounded shadow">Refresh</button>
            </div>
          </div>

          {tests.length === 0 ? (
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow border border-gray-100/60 text-center">
              <p className="text-gray-600">No tests published yet.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {tests.map(t => (
                <div key={t._id} className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow border border-gray-100/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{t.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{t.subject}</p>
                      {t.description && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{t.description}</p>}
                      <div className="mt-3 text-sm text-gray-600">{t.durationMinutes} min • {t.totalMarks} marks</div>
                    </div>
                    <div className="space-y-2">
                      <button onClick={() => startAttempt(t._id)} className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm">Start</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </BackgroundWrapper>
    );
  }

  // ATTEMPT view
  if (step === "attempt" && test) {
    const minutes = Math.floor(timeLeftSec / 60);
    const seconds = timeLeftSec % 60;

    return (
      <BackgroundWrapper>
        <div className="max-w-6xl mx-auto p-8">
          <div className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow border border-gray-100/60 mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{test.title}</h2>
              <p className="text-sm text-gray-600">{test.description}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Time left</div>
              <div className="text-2xl font-mono text-indigo-700">{String(minutes).padStart(2,'0')}:{String(seconds).padStart(2,'0')}</div>
            </div>
          </div>

          {/* progress */}
          <div className="mb-6">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 transition-[width] duration-300 ease-linear" style={{ width: `${percentLeft}%` }} />
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-5">
            {test.questions.map((q) => (
              <div key={q.questionIndex} className="bg-white/70 backdrop-blur rounded-xl p-4 shadow border border-gray-100/50">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium mb-2">Q{q.questionIndex + 1}. {q.text}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((opt, oi) => {
                        const isSelected = !!answers.find(a => a.questionIndex === q.questionIndex && a.selectedIndex === oi);
                        return (
                          <button
                            key={oi}
                            onClick={() => selectOption(q.questionIndex, oi)}
                            className={`p-3 text-left rounded-lg border flex items-center gap-3 ${isSelected ? 'bg-indigo-50 border-indigo-300' : 'border-gray-200 hover:bg-gray-50'}`}
                          >
                            <div className="font-semibold">{String.fromCharCode(65 + oi)}.</div>
                            <div className="text-sm">{opt}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="ml-4 text-sm text-gray-500">{q.marks} pts</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => {
                if (!submitting && confirm("Submit your answers now?")) submitAttempt(false);
              }}
              disabled={submitting}
              className={`px-5 py-2 rounded-md text-white ${submitting ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
            >
              {submitting ? "Submitting…" : "Submit"}
            </button>

            <button
              onClick={() => {
                if (confirm("Leave test? Your attempt will be auto-submitted when time runs out.")) {
                  // clear timer and go back to list
                  if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
                  setStep("list");
                  setTest(null);
                  setAttemptId(null);
                  setAnswers([]);
                }
              }}
              className="px-4 py-2 border rounded-md"
            >
              Exit
            </button>
          </div>
        </div>
      </BackgroundWrapper>
    );
  }

  // RESULT view
  if (step === "result" && attemptResult) {
    const a = attemptResult;
    const showTestTitle = a.test?.title || test?.title || "Test";
    return (
      <BackgroundWrapper>
        <div className="max-w-3xl mx-auto p-8">
          <div className="bg-white/70 backdrop-blur rounded-2xl p-6 shadow border border-gray-100/60">
            <h2 className="text-2xl font-bold mb-2">Result</h2>
            <p className="text-gray-600 mb-4">{showTestTitle}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-white rounded-lg text-center shadow">
                <div className="text-sm text-gray-500">Score</div>
                <div className="text-xl font-bold">{a.score ?? "—"}</div>
              </div>
              <div className="p-4 bg-white rounded-lg text-center shadow">
                <div className="text-sm text-gray-500">Max Score</div>
                <div className="text-xl font-bold">{a.maxScore ?? a.test?.totalMarks ?? "—"}</div>
              </div>
              <div className="p-4 bg-white rounded-lg text-center shadow">
                <div className="text-sm text-gray-500">Status</div>
                <div className="text-xl font-bold">{a.status ?? "—"}</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setStep("list"); setAttemptResult(null); setTest(null); setAnswers([]); }} className="px-4 py-2 bg-indigo-600 text-white rounded">Back to tests</button>
              <button onClick={() => navigate(`/user/attempt/${test?._id}`)} className="px-4 py-2 border rounded">Review</button>
            </div>
          </div>
        </div>
      </BackgroundWrapper>
    );
  }

  // safety fallback - should never reach here
  return (
    <BackgroundWrapper>
      <div className="max-w-3xl mx-auto p-8">
        <div className="bg-white/70 backdrop-blur rounded-2xl p-6 shadow border text-center">
          <p className="text-gray-600">Something unexpected happened. Try reloading the page.</p>
          <div className="mt-4">
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-indigo-600 text-white rounded">Reload</button>
          </div>
        </div>
      </div>
    </BackgroundWrapper>
  );
}