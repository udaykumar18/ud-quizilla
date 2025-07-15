import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../services/api";

const UpdateAssessmentModal = ({ assessmentId, onClose, onUpdated }) => {
  const [formData, setFormData] = useState(null);
  const [questionSets, setQuestionSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const assessmentRes = await api.getAssessmentById(assessmentId);
      const setRes = await api.getQuestionSets();

      const assessment = assessmentRes?.data?.assessment;
      const sets = Array.isArray(setRes?.data?.question_sets)
        ? setRes.data.question_sets
        : [];

      setFormData({
        name: assessment.name,
        status: assessment.status,
        set_ids: assessment.set_ids,
        instruction: assessment.instruction,
      });

      setQuestionSets(sets);
    } catch (error) {
      toast.error("Error loading assessment or question sets");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assessmentId) {
      setLoading(true);
      fetchData();
    }
  }, [assessmentId]);

  const calculateTotalTime = (selectedSetIds) => {
    return questionSets
      .filter((set) => selectedSetIds.includes(set.id))
      .reduce((total, set) => total + set.time_limit, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        total_time: calculateTotalTime(formData.set_ids),
      };

      if (!formData.instruction.trim()) {
        delete payload.instruction;
      }

      await api.updateAssessment(assessmentId, payload);
      toast.success("Assessment updated successfully");
      onUpdated();
      onClose();
    } catch (err) {
      console.error("Error updating assessment", err);
      toast.error("Failed to update assessment");
    } finally {
      setSaving(false);
    }
  };

  if (!assessmentId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>

        <h2 className="text-xl font-semibold mb-4">Update Assessment</h2>

        {loading || !formData ? (
          <div className="py-10 text-center text-gray-500 text-sm">
            Loading assessment details...
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 max-h-[70vh] overflow-y-auto pr-2"
          >
            <input
              type="text"
              placeholder="Assessment Name"
              value={formData.name}
              required
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full border px-3 py-2 rounded-lg"
            />

            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full border px-3 py-2 rounded-lg"
            >
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
              <option value="DRAFT">Draft</option>
            </select>

            <div>
              <p className="font-medium text-sm mb-1">Select Question Sets</p>
              <div className="max-h-48 overflow-y-auto border rounded p-2 space-y-2">
                {questionSets.map((set) => (
                  <label key={set.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.set_ids.includes(set.id)}
                      onChange={() => {
                        const selected = formData.set_ids.includes(set.id)
                          ? formData.set_ids.filter((id) => id !== set.id)
                          : [...formData.set_ids, set.id];
                        setFormData({ ...formData, set_ids: selected });
                      }}
                    />
                    <span className="text-sm">{set.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <textarea
              rows={5}
              placeholder="Instructions (optional)"
              value={formData.instruction}
              onChange={(e) =>
                setFormData({ ...formData, instruction: e.target.value })
              }
              className="w-full border px-3 py-2 rounded-lg"
            />

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdateAssessmentModal;
