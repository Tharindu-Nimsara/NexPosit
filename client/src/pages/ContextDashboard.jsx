import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { contextAPI, projectAPI, postAPI } from "../services/api";
import { format } from "date-fns";
import DarkModeToggle from "../components/DarkModeToggle";
import Logo from "../components/Logo";

const PRESET_COLORS = [
  { name: "Blue", value: "#3B82F6" },
  { name: "Green", value: "#10B981" },
  { name: "Red", value: "#EF4444" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Orange", value: "#F97316" },
  { name: "Pink", value: "#EC4899" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Teal", value: "#14B8A6" },
];

const ContextDashboard = () => {
  const { contextId } = useParams();
  const navigate = useNavigate();
  const [context, setContext] = useState(null);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", color_code: "#3B82F6" });
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  // Get current user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchContextData();
  }, [contextId]);

  const fetchContextData = async () => {
    try {
      const [contextRes, projectsRes, membersRes, postsRes] = await Promise.all(
        [
          contextAPI.getById(contextId),
          projectAPI.getByContext(contextId),
          contextAPI.getMembers(contextId),
          postAPI.getByContext(contextId),
        ]
      );

      console.log("Members data:", membersRes.data.members); // Debug log

      setContext(contextRes.data.context);
      setProjects(projectsRes.data.projects);
      setMembers(membersRes.data.members || []);
      setPosts(postsRes.data.posts || []);
    } catch (err) {
      console.error("Failed to fetch context data:", err);
      navigate("/contexts");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.name.length < 3) {
      setError("Project name must be at least 3 characters");
      return;
    }

    setCreating(true);

    try {
      const response = await projectAPI.create(contextId, formData);
      setProjects([response.data.project, ...projects]);
      setShowCreateModal(false);
      setFormData({ name: "", color_code: "#3B82F6" });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const handlePromoteMember = async (userId) => {
    if (!window.confirm("Promote this member to admin?")) return;

    try {
      await contextAPI.updateMemberRole(contextId, userId, "admin");
      // Refresh members
      const membersRes = await contextAPI.getMembers(contextId);
      setMembers(membersRes.data.members);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to promote member");
    }
  };

  const handleDemoteMember = async (userId) => {
    if (!window.confirm("Demote this admin to member?")) return;

    try {
      await contextAPI.updateMemberRole(contextId, userId, "member");
      // Refresh members
      const membersRes = await contextAPI.getMembers(contextId);
      setMembers(membersRes.data.members);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to demote admin");
    }
  };

  const handleRemoveMember = async (userId) => {
    if (
      !window.confirm(
        "Remove this member? They will lose access to all projects in this context."
      )
    )
      return;

    try {
      await contextAPI.removeMember(contextId, userId);
      // Refresh members
      const membersRes = await contextAPI.getMembers(contextId);
      setMembers(membersRes.data.members);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to remove member");
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!context) {
    return null;
  }

  const isAdmin = context.user_role === "admin";
  const adminCount = members.filter((m) => m.role === "admin").length;
  const memberCount = members.filter((m) => m.role === "member").length;

  // Format time for posts
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

  // Get posts for next 4 days
  const getUpcomingPosts = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fourDaysLater = new Date();
    fourDaysLater.setDate(fourDaysLater.getDate() + 4);
    fourDaysLater.setHours(23, 59, 59, 999);

    return posts
      .filter((post) => {
        const postDate = new Date(post.publish_date);
        return postDate >= today && postDate <= fourDaysLater;
      })
      .sort((a, b) => new Date(a.publish_date) - new Date(b.publish_date));
  };

  const upcomingPosts = getUpcomingPosts();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/contexts")}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                ← Back
              </button>
              <Logo size="small" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {context.name}
              </h1>
              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  isAdmin
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                }`}
              >
                {context.user_role}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <DarkModeToggle />
              {isAdmin && (
                <button
                  onClick={() => setShowMembersModal(true)}
                  className="bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  👥 Manage Members ({members.length})
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Context Info & Invite */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          {context.description && (
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {context.description}
            </p>
          )}

          {isAdmin && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Invite Code
                  </p>
                  <p className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">
                    {context.invite_code}
                  </p>
                </div>
                <button
                  onClick={copyInviteLink}
                  className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {copied ? "✓ Copied!" : "Copy Link"}
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Share this link with team members to invite them
              </p>
            </div>
          )}
        </div>

        {/* Projects Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Projects
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/contexts/${contextId}/grid`)}
                className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                📅 View All Posts
              </button>
              {isAdmin && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  + Create Project
                </button>
              )}
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No projects yet
              </p>
              {isAdmin && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  Create your first project
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() =>
                    navigate(`/contexts/${contextId}/projects/${project.id}`)
                  }
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow cursor-pointer border-l-4"
                  style={{ borderLeftColor: project.color_code }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
                      {project.name}
                    </h3>
                    <div
                      className="w-6 h-6 rounded-full border-2 border-gray-200 dark:border-gray-600"
                      style={{ backgroundColor: project.color_code }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Created {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coming Posts Preview */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Coming Posts (Next 4 Days)
            </h2>
            <button
              onClick={() => navigate(`/contexts/${contextId}/grid`)}
              className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium text-sm transition-colors"
            >
              Show More →
            </button>
          </div>

          {upcomingPosts.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No posts scheduled for the next 4 days
              </p>
            </div>
          ) : (
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
                                {format(new Date(post.publish_date), "MMM")}
                              </div>
                              <div
                                className="text-2xl font-bold"
                                style={{
                                  color: project?.color_code || "#3B82F6",
                                }}
                              >
                                {format(new Date(post.publish_date), "dd")}
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
                                post.status === "approved"
                                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                  : "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200"
                              }`}
                            >
                              {post.status === "approved"
                                ? "Approved"
                                : "Pending"}
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
                  const project = projects.find(
                    (p) => p.id === post.project_id
                  );
                  return (
                    <div
                      key={post.id}
                      onClick={() =>
                        navigate(
                          `/contexts/${contextId}/projects/${post.project_id}`
                        )
                      }
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
                            {format(new Date(post.publish_date), "MMM")}
                          </div>
                          <div
                            className="text-2xl font-bold"
                            style={{ color: project?.color_code || "#3B82F6" }}
                          >
                            {format(new Date(post.publish_date), "dd")}
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
                                post.status === "approved"
                                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                  : "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200"
                              }`}
                            >
                              {post.status === "approved"
                                ? "Approved"
                                : "Pending"}
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
          )}
        </div>
      </main>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Create New Project
            </h3>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 p-4 mb-4 rounded">
                <p className="text-red-700 dark:text-red-300 text-sm">
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleCreateProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="Social Media Campaign"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Color
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, color_code: color.value })
                      }
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                        formData.color_code === color.value
                          ? "border-gray-900 dark:border-gray-100 bg-gray-50 dark:bg-gray-700"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: color.value }}
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ name: "", color_code: "#3B82F6" });
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

      {/* Members Management Modal */}
      {showMembersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Manage Members
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {context.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowMembersModal(false)}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {members.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Members
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {adminCount}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Admins
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                    {memberCount}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Members
                  </div>
                </div>
              </div>

              {/* Member List */}
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.user_id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 dark:bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                        {member.full_name
                          ? member.full_name.charAt(0).toUpperCase()
                          : "?"}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {member.full_name || "Unknown User"}
                          {member.user_id === user?.id && (
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                              (You)
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {member.email || "No email"}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          Joined{" "}
                          {member.created_at
                            ? format(new Date(member.created_at), "MMM d, yyyy")
                            : "Unknown"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Show Owner badge for context creator */}
                      {member.isOwner ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                          Owner 👑
                        </span>
                      ) : (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            member.role === "admin"
                              ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                              : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {member.role === "admin" ? "Admin 👑" : "Member"}
                        </span>
                      )}

                      {/* Only show action buttons if admin AND not the owner AND not yourself */}
                      {context.isAdmin &&
                        !member.isOwner &&
                        member.user_id !== user?.id && (
                          <>
                            {member.role === "member" ? (
                              <button
                                onClick={() =>
                                  handlePromoteMember(member.user_id)
                                }
                                className="px-3 py-1 bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white text-sm rounded transition-colors"
                              >
                                Promote
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleDemoteMember(member.user_id)
                                }
                                className="px-3 py-1 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white text-sm rounded transition-colors"
                              >
                                Demote
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveMember(member.user_id)}
                              className="px-3 py-1 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white text-sm rounded transition-colors"
                            >
                              Remove
                            </button>
                          </>
                        )}

                      {/* Show protected message for owner */}
                      {member.isOwner &&
                        context.isAdmin &&
                        member.user_id !== user?.id && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                            Protected
                          </span>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContextDashboard;
