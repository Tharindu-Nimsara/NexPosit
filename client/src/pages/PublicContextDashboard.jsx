import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";
import Logo from "../components/Logo";
import DarkModeToggle from "../components/DarkModeToggle";
import api from "../services/api";

const PublicContextDashboard = () => {
  const { contextId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [context, setContext] = useState(null);
  const [projects, setProjects] = useState([]);
  const [upcomingPosts, setUpcomingPosts] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalPosts: 0,
    draftPosts: 0,
    scheduledPosts: 0,
    publishedPosts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  // Fetch public dashboard data
  const fetchPublicData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/public/${contextId}/dashboard`);

      if (response.data.success) {
        const { context, projects, stats, upcomingPosts } = response.data.data;
        setContext(context);
        setProjects(projects || []);
        setUpcomingPosts(upcomingPosts || []);
        setStats(
          stats || {
            totalProjects: 0,
            totalPosts: 0,
            draftPosts: 0,
            scheduledPosts: 0,
            publishedPosts: 0,
          }
        );
      }
    } catch (err) {
      console.error("Failed to fetch public data:", err);
      setError(err.response?.data?.error || "Failed to load organization");
    } finally {
      setLoading(false);
    }
  }, [contextId]);

  useEffect(() => {
    if (contextId) {
      fetchPublicData();
    }
  }, [contextId, fetchPublicData]);

  // Format time helper - adapted from ContextDashboard
  const formatTime = (post) => {
    if (post.specific_time) {
      try {
        return format(new Date(`2000-01-01T${post.specific_time}`), "h:mm a");
      } catch (e) {
        console.log(e);
        return "Invalid time";
      }
    }
    if (post.publish_time_slot) {
      return (
        post.publish_time_slot.charAt(0).toUpperCase() +
        post.publish_time_slot.slice(1)
      );
    }
    return "No time";
  };

  const handleSignupPrompt = () => {
    setShowSignupPrompt(true);
  };

  const handleSignup = () => {
    // Save context ID to session storage for auto-join after signup
    sessionStorage.setItem("pendingContextJoin", contextId);
    navigate("/register");
  };

  const handleLogin = () => {
    // Save context ID to session storage for auto-join after login
    sessionStorage.setItem("pendingContextJoin", contextId);
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !context) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || "Organization Not Found"}
          </h2>
          <button
            onClick={() => navigate("/")}
            className="text-blue-500 hover:text-blue-600"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Logo size="small" />
            <div className="flex items-center gap-3">
              {!isAuthenticated && (
                <>
                  <button
                    onClick={handleLogin}
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleSignup}
                    className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                  >
                    Sign Up Free
                  </button>
                </>
              )}
              {isAuthenticated && (
                <button
                  onClick={() => navigate("/contexts")}
                  className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  Go to Dashboard
                </button>
              )}
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Public View Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-lg font-semibold">
                👀 You're viewing {context.name}'s content plan
              </p>
              <p className="text-blue-100 text-sm">
                Sign up free to collaborate and create your own plans
              </p>
            </div>
            <button
              onClick={handleSignup}
              className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg whitespace-nowrap"
            >
              Sign Up to Collaborate
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Organization Info */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {context.name}
          </h1>
          {context.description && (
            <p className="text-gray-600 dark:text-gray-400">
              {context.description}
            </p>
          )}
        </div>

        {/* Coming Posts Section - Enhanced Design from ContextDashboard */}
        {upcomingPosts.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Coming Posts (Next 4 Days)
              </h2>
              <button
                onClick={handleSignupPrompt}
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
              >
                Show More →
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Post Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Project
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {upcomingPosts.map((post) => {
                      const project = post.project;

                      // Validate date before formatting
                      const postDate = post.publish_date
                        ? new Date(post.publish_date)
                        : null;
                      const isValidDate =
                        postDate && !isNaN(postDate.getTime());

                      if (!isValidDate) {
                        console.warn(
                          "Invalid date for post:",
                          post.id,
                          post.publish_date
                        );
                        return null; // Skip posts with invalid dates
                      }

                      return (
                        <tr
                          key={post.id}
                          onClick={handleSignupPrompt}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div
                              className="rounded-lg px-3 py-2 border-l-4 inline-block"
                              style={{
                                backgroundColor: `${project?.color_code}15`,
                                borderLeftColor:
                                  project?.color_code || "#3B82F6",
                              }}
                            >
                              <div
                                className="text-xs font-medium uppercase"
                                style={{
                                  color: project?.color_code || "#3B82F6",
                                }}
                              >
                                {format(postDate, "MMM")}
                              </div>
                              <div
                                className="text-2xl font-bold"
                                style={{
                                  color: project?.color_code || "#3B82F6",
                                }}
                              >
                                {format(postDate, "dd")}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatTime(post)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {post.title}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor:
                                    project?.color_code || "#3B82F6",
                                }}
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {project?.name || "Unknown"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                post.status === "published"
                                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                  : post.status === "scheduled"
                                  ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                                  : post.status === "approved"
                                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                  : "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200"
                              }`}
                            >
                              {post.status === "approved"
                                ? "Approved"
                                : post.status.charAt(0).toUpperCase() +
                                  post.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
                {upcomingPosts.map((post) => {
                  const project = post.project;

                  // Validate date before formatting
                  const postDate = post.publish_date
                    ? new Date(post.publish_date)
                    : null;
                  const isValidDate = postDate && !isNaN(postDate.getTime());

                  if (!isValidDate) {
                    return null; // Skip posts with invalid dates
                  }

                  return (
                    <div
                      key={post.id}
                      onClick={handleSignupPrompt}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <div className="flex gap-4">
                        {/* Date Box */}
                        <div
                          className="rounded-lg px-3 py-2 border-l-4 flex-shrink-0"
                          style={{
                            backgroundColor: `${project?.color_code}15`,
                            borderLeftColor: project?.color_code || "#3B82F6",
                          }}
                        >
                          <div
                            className="text-xs font-medium uppercase"
                            style={{ color: project?.color_code || "#3B82F6" }}
                          >
                            {format(postDate, "MMM")}
                          </div>
                          <div
                            className="text-2xl font-bold"
                            style={{ color: project?.color_code || "#3B82F6" }}
                          >
                            {format(postDate, "dd")}
                          </div>
                        </div>

                        {/* Post Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex-1">
                              {post.title}
                            </h3>
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                                post.status === "published"
                                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                  : post.status === "scheduled"
                                  ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                                  : post.status === "approved"
                                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                  : "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200"
                              }`}
                            >
                              {post.status === "approved"
                                ? "Approved"
                                : post.status.charAt(0).toUpperCase() +
                                  post.status.slice(1)}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              <span className="font-medium">Time:</span>{" "}
                              {formatTime(post)}
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor:
                                    project?.color_code || "#3B82F6",
                                }}
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {project?.name || "Unknown"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Projects
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalProjects}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <svg
                  className="w-8 h-8 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Posts
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalPosts}
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                <svg
                  className="w-8 h-8 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Draft
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.draftPosts}
                </p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg">
                <svg
                  className="w-8 h-8 text-orange-600 dark:text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Published
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.publishedPosts}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <svg
                  className="w-8 h-8 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Projects
            </h2>
            <button
              onClick={handleSignupPrompt}
              className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              + Create Project
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No projects yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={handleSignupPrompt}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer relative group"
                >
                  <div className="absolute inset-0 bg-blue-500 bg-opacity-0 group-hover:bg-opacity-5 rounded-lg transition-all" />
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${project.color_code}20` }}
                    >
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: project.color_code }}
                      />
                    </div>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                      View Only
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <div className="mt-4 text-xs text-gray-500 dark:text-gray-500">
                    Click to sign up and view details
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View All Posts Button */}
        <div className="text-center">
          <button
            onClick={handleSignupPrompt}
            className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-6 py-3 rounded-lg transition-colors font-medium shadow-md border border-gray-200 dark:border-gray-700"
          >
            📅 View All Posts Schedule
          </button>
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">
            Want to create your own content plan?
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Join Nexposit and start planning, collaborating, and publishing with
            your team. It's free to get started!
          </p>
          <button
            onClick={handleSignup}
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg"
          >
            Sign Up Free - No Credit Card Required
          </button>
        </div>
      </main>

      {/* Signup Prompt Modal */}
      {showSignupPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-8 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Sign Up to Continue
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create a free account to view project details, create posts, and
              collaborate with your team.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleSignup}
                className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Sign Up Free
              </button>
              <button
                onClick={handleLogin}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Already have an account? Login
              </button>
              <button
                onClick={() => setShowSignupPrompt(false)}
                className="text-sm text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-400 transition-colors"
              >
                Continue viewing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Logo size="small" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            © 2025 Nexposit. Plan smarter, collaborate better.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicContextDashboard;
