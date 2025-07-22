import React, { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const defaultInstruction = `<p>Please read the instructions carefully before starting the assessment:</p><ul><li>Ensure a stable internet connection.</li><li>Do not refresh the page during the test.</li><li>Click 'Submit' after answering all questions.</li></ul>`;

const CreateAssessment = () => {
  const [formData, setFormData] = useState({
    name: "",
    instruction: defaultInstruction,
    set_ids: [],
  });
  const [questionSets, setQuestionSets] = useState([]);
  const [setTimeMap, setSetTimeMap] = useState({});
  const [questionsCountMap, setQuestionsCountMap] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestionSets = async () => {
      try {
        setLoading(true);
        const res = await api.get("/question-sets");
        setQuestionSets(res.data || []);
        const timeMap = {};
        const countMap = {};
        res.data.forEach((set) => {
          timeMap[set.id] = set.time_limit;
          countMap[set.id] = set.questions.length;
        });
        setSetTimeMap(timeMap);
        setQuestionsCountMap(countMap);
        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load question sets");
        setLoading(false);
      }
    };

    fetchQuestionSets();
  }, []);

  const handleSelectSet = (setId) => {
    const exists = formData.set_ids.find((s) => s.set_id === setId);
    if (exists) {
      setFormData((prev) => ({
        ...prev,
        set_ids: prev.set_ids.filter((s) => s.set_id !== setId),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        set_ids: [
          ...prev.set_ids,
          { set_id: setId, questions_per_set: questionsCountMap[setId] || 0 },
        ],
      }));
    }
  };

  const handleQuestionsPerSetChange = (setId, value) => {
    const parsed = parseInt(value, 10);
    setFormData((prev) => ({
      ...prev,
      set_ids: prev.set_ids.map((s) =>
        s.set_id === setId
          ? { ...s, questions_per_set: isNaN(parsed) ? 0 : parsed }
          : s
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const total_time = formData.set_ids.reduce(
      (sum, s) => sum + (setTimeMap[s.set_id] || 0),
      0
    );

    const payload = {
      name: formData.name,
      instruction: formData.instruction?.trim()
        ? formData.instruction
        : undefined, // allow backend default
      total_time,
      set_ids: formData.set_ids,
    };

    try {
      const res = await api.post("/assessment", payload);
      toast.success("Assessment created");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create assessment");
    }
  };

  const isSetSelected = (id) => formData.set_ids.some((s) => s.set_id === id);

  const getQuestionsPerSet = (id) => {
    const obj = formData.set_ids.find((s) => s.set_id === id);
    return obj ? obj.questions_per_set : "";
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-6">Create Assessment</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-medium mb-1">Assessment Name</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Instruction (HTML)</label>
          <textarea
            rows={6}
            className="w-full border px-3 py-2 rounded font-mono text-sm"
            value={formData.instruction}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                instruction: e.target.value,
              }))
            }
            placeholder="Enter HTML or leave empty for default"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Select Question Sets</label>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-4">
              {questionSets.map((set) => (
                <div
                  key={set.id}
                  className="flex items-center justify-between border p-3 rounded"
                >
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isSetSelected(set.id)}
                        onChange={() => handleSelectSet(set.id)}
                      />
                      <span className="font-medium">{set.name}</span>
                    </label>
                    <p className="text-sm text-gray-600">
                      {set.questions.length} questions • {set.time_limit} mins
                    </p>
                  </div>

                  {isSetSelected(set.id) && (
                    <input
                      type="number"
                      className="w-20 border px-2 py-1 rounded"
                      value={getQuestionsPerSet(set.id)}
                      onChange={(e) =>
                        handleQuestionsPerSetChange(set.id, e.target.value)
                      }
                      min={1}
                      max={set.questions.length}
                      required
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-right">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create Assessment
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAssessment;
