import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { postAPI, projectAPI, contextAPI } from "../services/api";
import { format } from "date-fns";

const MainGrid = () => {
  const { contextId } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    fetchData();
  }, [contextId]);

  const fetchData = async () => {
    try {
      const [postsRes, projectsRes, contextRes] = await Promise.all([
        postAPI.getByContext(contextId),
        projectAPI.getByContext(contextId),
        contextAPI.getById(contextId),
      ]);
      setPosts(postsRes.data.posts);
      setProjects(projectsRes.data.projects);
      setContext(contextRes.data.context);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      navigate("/contexts");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (post) => {
    if (post.specific_time) {
      return format(new Date(`2000-01-01T${post.specific_time}`), "h:mm a");
    }
    if (post.publish_time_slot) {
      return (
        post.publish_time_slot.charAt(0).toUpperCase() +
        post.publish_time_slot.slice(1)
      );
    }
    return "No time";
  };

  const filteredPosts = posts.filter((post) => {
    if (selectedProject !== "all" && post.project_id !== selectedProject) {
      return false;
    }
    if (selectedStatus !== "all" && post.status !== selectedStatus) {
      return false;
    }
    return true;
  });

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/contexts/${contextId}/dashboard`)}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Main Schedule
                </h1>
                <p className="text-sm text-gray-600">{context?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Project Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Project
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Posts</p>
            <p className="text-2xl font-bold text-gray-900">
              {filteredPosts.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Projects</p>
            <p className="text-2xl font-bold text-blue-500">
              {projects.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-orange-500">
              {filteredPosts.filter((p) => p.status === "pending").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Approved</p>
            <p className="text-2xl font-bold text-green-500">
              {filteredPosts.filter((p) => p.status === "approved").length}
            </p>
          </div>
        </div>

        {/* Posts Table */}
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 mb-4">
              {posts.length === 0
                ? "No posts yet"
                : "No posts match your filters"}
            </p>
            {posts.length === 0 && (
              <button
                onClick={() => navigate(`/contexts/${contextId}/dashboard`)}
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                Go to dashboard to create posts
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Post Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPosts.map((post) => {
                    const project = projects.find(
                      (p) => p.id === post.project_id
                    );
                    return (
                      <tr
                        key={post.id}
                        onClick={() =>
                          navigate(
                            `/contexts/${contextId}/projects/${post.project_id}`
                          )
                        }
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-blue-100 rounded-lg px-3 py-2 border-l-4 border-blue-500">
                              <div className="text-xs font-medium text-blue-600 uppercase">
                                {format(new Date(post.publish_date), "MMM")}
                              </div>
                              <div className="text-2xl font-bold text-blue-900">
                                {format(new Date(post.publish_date), "dd")}
                              </div>
                              <div className="text-xs text-blue-600">
                                {format(new Date(post.publish_date), "yyyy")}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatTime(post)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">
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
                            <span className="text-sm text-gray-700">
                              {project?.name || "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              post.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {post.status === "approved"
                              ? "Approved"
                              : "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {post.created_by_user?.full_name || "Unknown"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {filteredPosts.map((post) => {
                const project = projects.find((p) => p.id === post.project_id);
                return (
                  <div
                    key={post.id}
                    onClick={() =>
                      navigate(
                        `/contexts/${contextId}/projects/${post.project_id}`
                      )
                    }
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex gap-4">
                      {/* Date Box */}
                      <div className="bg-blue-100 rounded-lg px-3 py-2 border-l-4 border-blue-500 flex-shrink-0">
                        <div className="text-xs font-medium text-blue-600 uppercase">
                          {format(new Date(post.publish_date), "MMM")}
                        </div>
                        <div className="text-2xl font-bold text-blue-900">
                          {format(new Date(post.publish_date), "dd")}
                        </div>
                        <div className="text-xs text-blue-600">
                          {format(new Date(post.publish_date), "yyyy")}
                        </div>
                      </div>

                      {/* Post Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-sm font-semibold text-gray-900 flex-1">
                            {post.title}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                              post.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {post.status === "approved"
                              ? "Approved"
                              : "Pending"}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-gray-600">
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
                            <span className="text-sm text-gray-700">
                              {project?.name || "Unknown"}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            By {post.created_by_user?.full_name || "Unknown"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This is a read-only view. To edit or create
            posts, go to the specific project from the dashboard.
          </p>
        </div>
      </main>
    </div>
  );
};

export default MainGrid;
