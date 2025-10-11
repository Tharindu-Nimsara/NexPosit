import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { contextAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import DarkModeToggle from "../components/DarkModeToggle";
import Logo from "../components/Logo";
import ProfileIcon from "../components/ProfileIcon";

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Logo size="small" />
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/about")}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
              >
                About
              </button>
              <DarkModeToggle />
              <ProfileIcon size="md" />
              <button
                onClick={logout}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Your Organizations
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            + Create Organization
          </button>
        </div>

        {/* Contexts Grid */}
        {contexts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No organizations yet
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium transition-colors"
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
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {context.name}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      context.user_role === "admin"
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {context.user_role}
                  </span>
                </div>
                {context.description && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                    {context.description}
                  </p>
                )}
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Created {new Date(context.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Context Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Create New Organization
            </h3>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 p-4 mb-4 rounded">
                <p className="text-red-700 dark:text-red-300 text-sm">
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleCreateContext}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="My Organization"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
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
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
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
