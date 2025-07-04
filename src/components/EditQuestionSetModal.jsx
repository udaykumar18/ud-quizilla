import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../services/api";

const EditQuestionSetModal = ({
  isOpen,
  onClose,
  questionSetId,
  onUpdated,
}) => {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!questionSetId || !isOpen) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.getQuestionSet(questionSetId);
        setFormData(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load question set");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [questionSetId, isOpen]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: formData.name,
      question_type: formData.question_type,
      time_limit: Number(formData.time_limit),
      description: formData.description,
      difficulty: formData.difficulty,
    };

    console.log("Final Payload:", payload);
    try {
      const res = await api.updateQuestionSet(questionSetId, payload);
      console.log("Update API response:", res);
      toast.success("Question set updated successfully");
      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update question set");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-lg"
        >
          ×
        </button>

        <h2 className="text-xl font-semibold mb-4">Edit Question Set</h2>

        {loading || !formData ? (
          <p>Loading...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              placeholder="Set Name"
            />

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              placeholder="Description"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                name="question_type"
                value={formData.question_type}
                onChange={handleChange}
                className="border px-3 py-2 rounded"
              >
                <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                <option value="SHORT_ANSWER">Short Answer</option>
              </select>

              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="border px-3 py-2 rounded"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>

              <input
                name="time_limit"
                type="number"
                min="1"
                value={formData.time_limit}
                onChange={handleChange}
                className="border px-3 py-2 rounded"
                placeholder="Time (min)"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {saving ? "Saving..." : "Update"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditQuestionSetModal;
