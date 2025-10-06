import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { contextAPI } from "../services/api";

const ContextDashboard = () => {
  const { contextId } = useParams();
  const navigate = useNavigate();
  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchContext();
  }, [contextId]);

  const fetchContext = async () => {
    try {
      const response = await contextAPI.getById(contextId);
      setContext(response.data.context);
    } catch (err) {
      console.error("Failed to fetch context:", err);
      navigate("/contexts");
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/join/${context.invite_code}`;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!context) {
    return null;
  }

  const isAdmin = context.user_role === "admin";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/contexts")}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {context.name}
              </h1>
              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  isAdmin
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {context.user_role}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Context Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Organization Info
          </h2>

          {context.description && (
            <p className="text-gray-600 mb-4">{context.description}</p>
          )}

          {/* Invite Code Section */}
          {isAdmin && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Invite Code
                  </p>
                  <p className="text-2xl font-mono font-bold text-blue-600">
                    {context.invite_code}
                  </p>
                </div>
                <button
                  onClick={copyInviteLink}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {copied ? "✓ Copied!" : "Copy Link"}
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Share this link with team members to invite them
              </p>
            </div>
          )}
        </div>

        {/* Coming Soon Section */}
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Projects & Posts Coming Soon!
          </h3>
          <p className="text-gray-600 mb-6">
            We'll add the ability to create projects, add posts, and view the
            main schedule grid here.
          </p>
          <div className="flex gap-4 justify-center">
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <p className="font-medium text-gray-900">📁 Projects</p>
              <p className="text-sm text-gray-600">Organize posts by project</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <p className="font-medium text-gray-900">📝 Posts</p>
              <p className="text-sm text-gray-600">Schedule your content</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <p className="font-medium text-gray-900">📅 Grid View</p>
              <p className="text-sm text-gray-600">See all posts at a glance</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContextDashboard;
