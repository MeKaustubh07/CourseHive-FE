import React, { useEffect, useState } from "react";
import api from "../../lib/api";

// Move BackgroundWrapper outside component to prevent re-creation on each render
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

export default function AdminTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    durationMinutes: 30,
    questions: [],
  });

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      setAuthError(true);
      setLoading(false);
    }
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    setAuthError(false);

    try {
      const token = localStorage.getItem("admin_token");
      const { data } = await api.get("/api/admin/alltests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setTests(data.tests);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("admin_token");
        setAuthError(true);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token && !authError) fetchTests();
  }, [authError]);

  const addQuestion = () =>
    setForm((f) => ({
      ...f,
      questions: [
        ...f.questions,
        { text: "", options: ["", ""], correctIndex: 0, marks: 1 },
      ],
    }));

  const updateQuestion = (i, partial) =>
    setForm((f) => {
      const q = [...f.questions];
      q[i] = { ...q[i], ...partial };
      return { ...f, questions: q };
    });

  const removeQuestion = (i) =>
    setForm((f) => ({
      ...f,
      questions: f.questions.filter((_, idx) => idx !== i),
    }));

  const createOrUpdate = async () => {
    try {
      if (editing) {
        await api.put(`/api/admin/tests/${editing}`, form);
      } else {
        await api.post("/api/admin/managetests", form);
      }
      await fetchTests();
      setEditing(null);
      setForm({
        title: "",
        description: "",
        subject: "",
        durationMinutes: 30,
        questions: [],
      });
    } catch (err) {
      alert("Error saving test: " + (err.response?.data?.message || err.message));
    }
  };

  const del = async (id) => {
    if (!confirm("Delete test?")) return;
    try {
      await api.delete(`/api/admin/tests/${id}`);
      fetchTests();
    } catch (err) {
      alert("Error deleting test: " + (err.response?.data?.message || err.message));
    }
  };

  const edit = (t) => {
    setEditing(t._id);
    setForm({
      title: t.title,
      description: t.description,
      subject: t.subject,
      durationMinutes: t.durationMinutes,
      questions: t.questions,
    });
  };

  if (authError) {
    return (
      <BackgroundWrapper>
        <div className="max-w-4xl mx-auto p-8">
          <div className="bg-white/70 backdrop-blur rounded-2xl p-6 shadow-lg border border-red-100/60 text-center">
            <h2 className="text-xl font-bold text-red-700 mb-2">
              Authentication Required
            </h2>
            <p className="text-red-600 mb-4">
              Please log in as an admin to access this page.
            </p>
            <button
              onClick={() => (window.location.href = "/admin/login")}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <div className="p-8 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Admin — Manage Tests</h2>

        {/* Create New */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => {
              setEditing(null);
              setForm({
                title: "",
                description: "",
                subject: "",
                durationMinutes: 30,
                questions: [],
              });
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
          >
            Create New Test
          </button>
        </div>

        {/* Form */}
        <div className="bg-white/70 backdrop-blur rounded-2xl shadow-lg border border-gray-100/60 p-6 mb-10">
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full p-2 border rounded-lg mb-3"
          />
          <input
            placeholder="Subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full p-2 border rounded-lg mb-3"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full p-2 border rounded-lg mb-3"
          />
          <div className="mb-4 flex items-center gap-3">
            <label className="font-medium">Duration (minutes)</label>
            <input
              type="number"
              value={form.durationMinutes}
              onChange={(e) =>
                setForm({
                  ...form,
                  durationMinutes: parseInt(e.target.value || 0),
                })
              }
              className="p-2 border rounded-lg w-28"
            />
          </div>

          <div className="space-y-6">
            <h4 className="font-semibold text-lg">Questions</h4>
            {form.questions.map((q, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg bg-white/60 shadow-sm">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question {i + 1}
                  </label>
                  <textarea
                    className="w-full p-3 border rounded-lg resize-none text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder={`Enter question ${i + 1}...`}
                    value={q.text}
                    onChange={(e) => updateQuestion(i, { text: e.target.value })}
                    rows={3}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Answer Options (select the correct one):
                  </label>
                  <div className="space-y-3">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            className="flex-1 p-2 border rounded-lg text-base min-w-0"
                            value={opt}
                            placeholder={`Option ${oi + 1}`}
                            onChange={(e) => {
                              const opts = [...q.options];
                              opts[oi] = e.target.value;
                              updateQuestion(i, { options: opts });
                            }}
                          />
                          <label className="text-sm flex items-center gap-1 flex-shrink-0 whitespace-nowrap">
                            <input
                              type="radio"
                              name={`correct-${i}`}
                              checked={q.correctIndex === oi}
                              onChange={() =>
                                updateQuestion(i, { correctIndex: oi })
                              }
                              className="w-4 h-4"
                            />
                            <span className="text-blue-600 font-medium">Correct</span>
                          </label>
                        </div>
                        {/* Remove option button for mobile - only show if more than 2 options */}
                        {q.options.length > 2 && (
                          <button
                            onClick={() => {
                              const opts = q.options.filter((_, idx) => idx !== oi);
                              updateQuestion(i, { options: opts });
                              // Adjust correct index if needed
                              if (q.correctIndex === oi) {
                                updateQuestion(i, { correctIndex: 0 });
                              } else if (q.correctIndex > oi) {
                                updateQuestion(i, { correctIndex: q.correctIndex - 1 });
                              }
                            }}
                            className="w-full sm:w-auto px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                          >
                            Remove Option
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <button
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm w-full sm:w-auto"
                    onClick={() =>
                      updateQuestion(i, { options: [...q.options, ""] })
                    }
                  >
                    Add Option
                  </button>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium whitespace-nowrap">Marks:</label>
                    <input
                      type="number"
                      value={q.marks}
                      onChange={(e) =>
                        updateQuestion(i, {
                          marks: parseFloat(e.target.value || 1),
                        })
                      }
                      className="w-16 p-2 border rounded-lg text-center"
                      placeholder="1"
                      min="1"
                      max="10"
                    />
                  </div>
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm w-full sm:w-auto sm:ml-auto"
                    onClick={() => removeQuestion(i)}
                  >
                    Remove Question
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={addQuestion}
              className="px-4 py-2 bg-gray-200 rounded-lg shadow hover:bg-gray-300"
            >
              Add Question
            </button>
            <button
              onClick={createOrUpdate}
              className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
              disabled={!form.title || form.questions.length === 0}
            >
              {editing ? "Update" : "Create"}
            </button>
          </div>
        </div>

        {/* Tests List */}
        <div>
          {loading ? (
            <div className="bg-white/70 backdrop-blur rounded-2xl p-8 text-center shadow">
              <p className="text-gray-500">Loading…</p>
            </div>
          ) : tests.length === 0 ? (
            <div className="bg-white/70 backdrop-blur rounded-2xl p-8 text-center shadow">
              <p className="text-gray-600">No tests created yet.</p>
              <p className="text-gray-500 text-sm">
                Click "Create New Test" to get started!
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {tests.map((t) => (
                <div
                  key={t._id}
                  className="bg-white/70 backdrop-blur rounded-2xl p-6 shadow border border-gray-100/60 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-lg">{t.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {t.subject} • {t.durationMinutes} min • {t.totalMarks}{" "}
                      marks • {t.questions?.length || 0} questions
                    </p>
                    {t.description && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {t.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      className="px-3 py-1 border rounded-lg hover:bg-gray-50"
                      onClick={() => edit(t)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 border rounded-lg text-red-600 hover:bg-red-50"
                      onClick={() => del(t._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </BackgroundWrapper>
  );
}