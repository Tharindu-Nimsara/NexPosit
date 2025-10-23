import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectAPI, postAPI, contextAPI } from "../services/api";
import { format } from "date-fns";
import DarkModeToggle from "../components/DarkModeToggle";
import ProfileIcon from "../components/ProfileIcon";

const ProjectDetail = () => {
  const { contextId, projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [posts, setPosts] = useState([]);
  const [context, setContext] = useState(null);
  const [contextMembers, setContextMembers] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    publish_date: "",
    time_type: "slot",
    publish_time_slot: "morning",
    specific_time: "",
  });
  const [projectFormData, setProjectFormData] = useState({
    name: "",
    description: "",
    color_code: "#3B82F6",
  });
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [updatingProject, setUpdatingProject] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [projectRes, postsRes, contextRes] = await Promise.all([
        projectAPI.getById(projectId),
        postAPI.getByProject(projectId),
        contextAPI.getById(contextId),
      ]);
      setProject(projectRes.data.project);
      setPosts(postsRes.data.posts);
      setContext(contextRes.data.context);

      // Fetch members if admin
      if (contextRes.data.context.user_role === "admin") {
        const [contextMembersRes, projectMembersRes] = await Promise.all([
          contextAPI.getMembers(contextId),
          projectAPI.getMembers(projectId),
        ]);
        setContextMembers(contextMembersRes.data.members);
        setProjectMembers(projectMembersRes.data.members);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      navigate(`/contexts/${contextId}/dashboard`);
    } finally {
      setLoading(false);
    }
  }, [projectId, contextId, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEditProjectClick = () => {
    setProjectFormData({
      name: project.name,
      description: project.description || "",
      color_code: project.color_code,
    });
    setShowEditProjectModal(true);
    setError("");
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setError("");

    if (projectFormData.name.length < 3) {
      setError("Project name must be at least 3 characters");
      return;
    }

    setUpdatingProject(true);

    try {
      const response = await projectAPI.update(projectId, projectFormData);
      setProject(response.data.project);
      setShowEditProjectModal(false);
      setProjectFormData({ name: "", description: "", color_code: "#3B82F6" });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update project");
    } finally {
      setUpdatingProject(false);
    }
  };

  const handleDeleteProject = async () => {
    try {
      await projectAPI.delete(projectId);
      navigate(`/contexts/${contextId}/dashboard`);
    } catch (err) {
      console.error("Failed to delete project:", err);
      alert(err.response?.data?.error || "Failed to delete project");
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.title.length < 3) {
      setError("Post title must be at least 3 characters");
      return;
    }

    if (!formData.publish_date) {
      setError("Publish date is required");
      return;
    }

    setCreating(true);

    try {
      const postData = {
        title: formData.title,
        publish_date: formData.publish_date,
      };

      if (formData.time_type === "slot") {
        postData.publish_time_slot = formData.publish_time_slot;
      } else {
        postData.specific_time = formData.specific_time;
      }

      await postAPI.create(projectId, postData);

      // Refetch all posts to get complete data
      const postsRes = await postAPI.getByProject(projectId);
      setPosts(postsRes.data.posts);

      setShowCreateModal(false);
      setFormData({
        title: "",
        publish_date: "",
        time_type: "slot",
        publish_time_slot: "morning",
        specific_time: "",
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create post");
    } finally {
      setCreating(false);
    }
  };

  const handleEditClick = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      publish_date: post.publish_date,
      time_type: post.specific_time ? "specific" : "slot",
      publish_time_slot: post.publish_time_slot || "morning",
      specific_time: post.specific_time || "",
    });
    setShowEditModal(true);
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.title.length < 3) {
      setError("Post title must be at least 3 characters");
      return;
    }

    if (!formData.publish_date) {
      setError("Publish date is required");
      return;
    }

    setCreating(true);

    try {
      const postData = {
        title: formData.title,
        publish_date: formData.publish_date,
        publish_time_slot: null,
        specific_time: null,
      };

      if (formData.time_type === "slot") {
        postData.publish_time_slot = formData.publish_time_slot;
      } else {
        postData.specific_time = formData.specific_time;
      }

      await postAPI.update(editingPost.id, postData);

      // Refetch all posts
      const postsRes = await postAPI.getByProject(projectId);
      setPosts(postsRes.data.posts);

      setShowEditModal(false);
      setEditingPost(null);
      setFormData({
        title: "",
        publish_date: "",
        time_type: "slot",
        publish_time_slot: "morning",
        specific_time: "",
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update post");
    } finally {
      setCreating(false);
    }
  };

  const handleApprove = async (postId) => {
    try {
      await postAPI.approve(postId);
      setPosts(
        posts.map((p) => (p.id === postId ? { ...p, status: "approved" } : p))
      );
    } catch (err) {
      console.error("Failed to approve post:", err);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await postAPI.delete(postId);
      setPosts(posts.filter((p) => p.id !== postId));
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  const handleAddMember = async (userId) => {
    try {
      await projectAPI.addMember(projectId, userId);
      // Refetch project members
      const projectMembersRes = await projectAPI.getMembers(projectId);
      setProjectMembers(projectMembersRes.data.members);
    } catch (err) {
      console.error("Failed to add member:", err);
      alert(err.response?.data?.error || "Failed to add member");
    }
  };

  const handleRemoveMember = async (userId) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this member from the project?"
      )
    )
      return;

    try {
      await projectAPI.removeMember(projectId, userId);
      // Refetch project members
      const projectMembersRes = await projectAPI.getMembers(projectId);
      setProjectMembers(projectMembersRes.data.members);
    } catch (err) {
      console.error("Failed to remove member:", err);
      alert(err.response?.data?.error || "Failed to remove member");
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
    return "No time set";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!project) return null;

  const isAdmin = context?.user_role === "admin";
  const pendingPosts = posts.filter((p) => p.status === "pending");
  const approvedPosts = posts.filter((p) => p.status === "approved");

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];
  // Get date 60 days from now
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 60);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  // Predefined color palette
  const colorPalette = [
    "#3B82F6", // Blue
    "#10B981", // Green
    "#F59E0B", // Orange
    "#EF4444", // Red
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#06B6D4", // Cyan
    "#84CC16", // Lime
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/contexts/${contextId}/dashboard`)}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                {project.name}
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: project.color_code }}
                />
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <DarkModeToggle />
              <ProfileIcon size="md" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Description */}
        {project.description && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              {project.description}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Posts
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {posts.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Pending Approval
            </p>
            <p className="text-2xl font-bold text-orange-500 dark:text-orange-400">
              {pendingPosts.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
            <p className="text-2xl font-bold text-green-500 dark:text-green-400">
              {approvedPosts.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Team Members
            </p>
            <p className="text-2xl font-bold text-blue-500 dark:text-blue-400">
              {projectMembers.length}
            </p>
          </div>
        </div>

        {/* Posts List */}
        {posts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No posts yet
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium transition-colors"
            >
              Create your first post
            </button>
          </div>
        ) : (
          <>
            {/* project control buttons - separated from post list */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start gap-3">
                {isAdmin && (
                  <>
                    <button
                      onClick={handleEditProjectClick}
                      className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      ✏️ Edit Project
                    </button>
                    <button
                      onClick={() => setShowDeleteProjectModal(true)}
                      className="w-full sm:w-auto bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      🗑️ Delete
                    </button>
                    <button
                      onClick={() => setShowMembersModal(true)}
                      className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      👥 Members
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  +  Create New Post
                </button>
              </div>
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
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Created By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {posts.map((post) => (
                      <tr
                        key={post.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className="rounded-lg px-3 py-2 border-l-4"
                              style={{
                                backgroundColor: `${project.color_code}15`,
                                borderLeftColor: project.color_code,
                              }}
                            >
                              <div
                                className="text-xs font-medium uppercase"
                                style={{ color: project.color_code }}
                              >
                                {format(new Date(post.publish_date), "MMM")}
                              </div>
                              <div
                                className="text-2xl font-bold"
                                style={{ color: project.color_code }}
                              >
                                {format(new Date(post.publish_date), "dd")}
                              </div>
                              <div
                                className="text-xs"
                                style={{ color: project.color_code }}
                              >
                                {format(new Date(post.publish_date), "yyyy")}
                              </div>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {post.created_by_user?.full_name || "Unknown"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => handleEditClick(post)}
                                  className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(post.id)}
                                  className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                            {!isAdmin && post.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleEditClick(post)}
                                  className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(post.id)}
                                  className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                            {post.status === "pending" && isAdmin && (
                              <button
                                onClick={() => handleApprove(post.id)}
                                className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                              >
                                Approve
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* project control buttons were moved above to separate the card visually */}

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex gap-4">
                      {/* Date Box */}
                      <div
                        className="rounded-lg px-3 py-2 border-l-4 flex-shrink-0"
                        style={{
                          backgroundColor: `${project.color_code}15`,
                          borderLeftColor: project.color_code,
                        }}
                      >
                        <div
                          className="text-xs font-medium uppercase"
                          style={{ color: project.color_code }}
                        >
                          {format(new Date(post.publish_date), "MMM")}
                        </div>
                        <div
                          className="text-2xl font-bold"
                          style={{ color: project.color_code }}
                        >
                          {format(new Date(post.publish_date), "dd")}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: project.color_code }}
                        >
                          {format(new Date(post.publish_date), "yyyy")}
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
                        <div className="space-y-1 mb-3">
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Time:</span>{" "}
                            {formatTime(post)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            By {post.created_by_user?.full_name || "Unknown"}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleEditClick(post)}
                                className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(post.id)}
                                className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                              >
                                Delete
                              </button>
                              {post.status === "pending" && (
                                <button
                                  onClick={() => handleApprove(post.id)}
                                  className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                >
                                  Approve
                                </button>
                              )}
                            </>
                          )}
                          {!isAdmin && post.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleEditClick(post)}
                                className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(post.id)}
                                className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Edit Project Modal */}
      {showEditProjectModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Edit Project
            </h3>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 p-4 mb-4 rounded">
                <p className="text-red-700 dark:text-red-300 text-sm">
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleUpdateProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={projectFormData.name}
                  onChange={(e) =>
                    setProjectFormData({
                      ...projectFormData,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="My Project"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={projectFormData.description}
                  onChange={(e) =>
                    setProjectFormData({
                      ...projectFormData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  rows="3"
                  placeholder="Brief description..."
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Color
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {colorPalette.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setProjectFormData({
                          ...projectFormData,
                          color_code: color,
                        })
                      }
                      className={`w-full h-12 rounded-lg transition-all ${
                        projectFormData.color_code === color
                          ? "ring-4 ring-offset-2 ring-blue-500 dark:ring-blue-400 dark:ring-offset-gray-800"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditProjectModal(false);
                    setProjectFormData({
                      name: "",
                      description: "",
                      color_code: "#3B82F6",
                    });
                    setError("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingProject}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {updatingProject ? "Updating..." : "Update Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Project Confirmation Modal */}
      {showDeleteProjectModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
              ⚠️ Delete Project
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Are you sure you want to delete <strong>{project.name}</strong>?
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              This will permanently delete the project and all {posts.length}{" "}
              posts associated with it. This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteProjectModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                className="flex-1 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Create New Post
            </h3>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 p-4 mb-4 rounded">
                <p className="text-red-700 dark:text-red-300 text-sm">
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleCreatePost}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Post Title *{" "}
                  <span className="text-gray-500 dark:text-gray-400">
                    ({formData.title.length}/200)
                  </span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="Launch Facebook campaign"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Publish Date *
                </label>
                <input
                  type="date"
                  required
                  min={today}
                  max={maxDateStr}
                  value={formData.publish_date}
                  onChange={(e) =>
                    setFormData({ ...formData, publish_date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Publishing Time
                </label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, time_type: "slot" })
                    }
                    className={`flex-1 py-2 rounded-lg transition-colors ${
                      formData.time_type === "slot"
                        ? "bg-blue-500 dark:bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    Time Slot
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, time_type: "specific" })
                    }
                    className={`flex-1 py-2 rounded-lg transition-colors ${
                      formData.time_type === "specific"
                        ? "bg-blue-500 dark:bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    Specific Time
                  </button>
                </div>

                {formData.time_type === "slot" ? (
                  <select
                    value={formData.publish_time_slot}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        publish_time_slot: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="morning">Morning (6AM - 12PM)</option>
                    <option value="noon">Noon (12PM - 6PM)</option>
                    <option value="evening">Evening (6PM - 12AM)</option>
                  </select>
                ) : (
                  <input
                    type="time"
                    value={formData.specific_time}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specific_time: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({
                      title: "",
                      publish_date: "",
                      time_type: "slot",
                      publish_time_slot: "morning",
                      specific_time: "",
                    });
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

      {/* Edit Post Modal */}
      {showEditModal && editingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Edit Post
            </h3>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 p-4 mb-4 rounded">
                <p className="text-red-700 dark:text-red-300 text-sm">
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleUpdatePost}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Post Title *{" "}
                  <span className="text-gray-500 dark:text-gray-400">
                    ({formData.title.length}/200)
                  </span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="Launch Facebook campaign"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Publish Date *
                </label>
                <input
                  type="date"
                  required
                  min={today}
                  max={maxDateStr}
                  value={formData.publish_date}
                  onChange={(e) =>
                    setFormData({ ...formData, publish_date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Publishing Time
                </label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, time_type: "slot" })
                    }
                    className={`flex-1 py-2 rounded-lg transition-colors ${
                      formData.time_type === "slot"
                        ? "bg-blue-500 dark:bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    Time Slot
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, time_type: "specific" })
                    }
                    className={`flex-1 py-2 rounded-lg transition-colors ${
                      formData.time_type === "specific"
                        ? "bg-blue-500 dark:bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    Specific Time
                  </button>
                </div>

                {formData.time_type === "slot" ? (
                  <select
                    value={formData.publish_time_slot}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        publish_time_slot: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="morning">Morning (6AM - 12PM)</option>
                    <option value="noon">Noon (12PM - 6PM)</option>
                    <option value="evening">Evening (6PM - 12AM)</option>
                  </select>
                ) : (
                  <input
                    type="time"
                    value={formData.specific_time}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specific_time: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPost(null);
                    setFormData({
                      title: "",
                      publish_date: "",
                      time_type: "slot",
                      publish_time_slot: "morning",
                      specific_time: "",
                    });
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
                  {creating ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Members Modal */}
      {showMembersModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Manage Project Members
              </h3>
              <button
                onClick={() => setShowMembersModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            {/* Current Project Members */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Current Members ({projectMembers.length})
              </h4>
              {projectMembers.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No members assigned to this project yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {projectMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {member.users?.full_name || "Unknown User"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {member.users?.email || "No email"}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleRemoveMember(member.users?.id || member.user_id)
                        }
                        className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Available Members to Add */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Add Members
              </h4>
              {(() => {
                // Filter out members already in the project
                const projectMemberIds = projectMembers.map(
                  (pm) => pm.users?.id || pm.user_id
                );
                const availableMembers = contextMembers.filter(
                  (cm) => !projectMemberIds.includes(cm.user_id)
                );

                if (availableMembers.length === 0) {
                  return (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      All context members are already assigned to this project.
                    </p>
                  );
                }

                return (
                  <div className="space-y-2">
                    {availableMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {member.full_name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {member.email}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Role: {member.role}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAddMember(member.user_id)}
                          className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowMembersModal(false)}
                className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
