import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Trash2, Pencil } from "lucide-react";
import EditQuestionSetModal from "./EditQuestionSetModal";

const QuestionSetTable = ({ questionSets, onDelete, onUpdated }) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      onDelete(id);
    }
  };

  const openEditModal = (id) => {
    setEditId(id);
    setEditModalOpen(true);
  };

  return (
    <>
      <EditQuestionSetModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        questionSetId={editId}
        onUpdated={onUpdated}
      />

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Difficulty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time Limit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Questions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {questionSets.map((set) => (
              <tr key={set.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {set.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {set.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      set.difficulty === "EASY"
                        ? "bg-green-100 text-green-800"
                        : set.difficulty === "MEDIUM"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {set.difficulty}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {set.time_limit} min
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {set.question_count} questions
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Link
                      to={`/questions/${set.id}`}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Questions"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => openEditModal(set.id)}
                      className="text-yellow-600 hover:text-yellow-900"
                      title="Edit Question Set"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(set.id, set.name)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Question Set"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default QuestionSetTable;
