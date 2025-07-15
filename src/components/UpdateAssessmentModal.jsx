import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../services/api";

const UpdateAssessmentModal = ({ assessmentId, onClose, onUpdated }) => {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!assessmentId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.getAssessmentById(assessmentId);
        setFormData(res.data.assessment);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load assessment");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [assessmentId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        instruction: formData.instruction,
        total_time: Number(formData.total_time),
      };
      const res = await api.updateAssessment(assessmentId, payload);
      toast.success("Assessment updated successfully");
      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update assessment");
    } finally {
      setSaving(false);
    }
  };

  if (!assessmentId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-lg"
        >
          ×
        </button>

        <h2 className="text-xl font-semibold mb-4">Edit Assessment</h2>

        {loading || !formData ? (
          <p>Loading...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              placeholder="Assessment Name"
            />

            <textarea
              name="instruction"
              value={formData.instruction}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              placeholder="Instructions"
            />

            <input
              name="total_time"
              type="number"
              min="1"
              value={formData.total_time}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              placeholder="Total Time (in minutes)"
            />

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

export default UpdateAssessmentModal;
