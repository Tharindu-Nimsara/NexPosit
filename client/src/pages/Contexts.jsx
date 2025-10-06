import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { contextAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Contexts = () => {
  const [contexts, setContexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchContexts();
  }, []);

  const fetchContexts = async () => {
    try {
      const response = await contextAPI.getAll();
      setContexts(response.data.contexts);
    } catch (err) {
      console.error("Failed to fetch contexts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContext = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.name.length < 3) {
      setError("Context name must be at least 3 characters");
      return;
    }

    setCreating(true);

    try {
      const response = await contextAPI.create(formData);
      setContexts([...contexts, response.data.context]);
      setShowCreateModal(false);
      setFormData({ name: "", description: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create context");
    } finally {
      setCreating(false);
    }
  };

  const handleContextClick = (contextId) => {
    navigate(`/contexts/${contextId}/dashboard`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Social Post Planner
            </h1>
            <button
              onClick={logout}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Your Organizations
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            + Create Organization
          </button>
        </div>

        {/* Contexts Grid */}
        {contexts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No organizations yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              Create your first organization
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contexts.map((context) => (
              <div
                key={context.id}
                onClick={() => handleContextClick(context.id)}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {context.name}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      context.user_role === "admin"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {context.user_role}
                  </span>
                </div>
                {context.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {context.description}
                  </p>
                )}
                <div className="text-xs text-gray-500">
                  Created {new Date(context.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Context Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Create New Organization
            </h3>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleCreateContext}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="My Organization"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Brief description..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ name: "", description: "" });
                    setError("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contexts;
