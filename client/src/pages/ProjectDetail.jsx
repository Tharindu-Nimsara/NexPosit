import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectAPI, postAPI, contextAPI } from "../services/api";
import { format } from "date-fns";

const ProjectDetail = () => {
  const { contextId, projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [posts, setPosts] = useState([]);
  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    publish_date: "",
    time_type: "slot", // 'slot' or 'specific'
    publish_time_slot: "morning",
    specific_time: "",
  });
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      const [projectRes, postsRes, contextRes] = await Promise.all([
        projectAPI.getById(projectId),
        postAPI.getByProject(projectId),
        contextAPI.getById(contextId),
      ]);
      setProject(projectRes.data.project);
      setPosts(postsRes.data.posts);
      setContext(contextRes.data.context);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      navigate(`/contexts/${contextId}/dashboard`);
    } finally {
      setLoading(false);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                {project.name}
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: project.color_code }}
                />
              </h1>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              + Create Post
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Posts</p>
            <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Pending Approval</p>
            <p className="text-2xl font-bold text-orange-500">
              {pendingPosts.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Approved</p>
            <p className="text-2xl font-bold text-green-500">
              {approvedPosts.length}
            </p>
          </div>
        </div>

        {/* Posts List */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 mb-4">No posts yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              Create your first post
            </button>
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
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {posts.map((post) => (
                    <tr
                      key={post.id}
                      className="hover:bg-gray-50 transition-colors"
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
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            post.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {post.status === "approved" ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {post.created_by_user?.full_name || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleEditClick(post)}
                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(post.id)}
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                              >
                                Delete
                              </button>
                            </>
                          )}
                          {!isAdmin && post.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleEditClick(post)}
                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(post.id)}
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                              >
                                Delete
                              </button>
                            </>
                          )}
                          {post.status === "pending" && isAdmin && (
                            <button
                              onClick={() => handleApprove(post.id)}
                              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
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

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
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
                          {post.status === "approved" ? "Approved" : "Pending"}
                        </span>
                      </div>
                      <div className="space-y-1 mb-3">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Time:</span>{" "}
                          {formatTime(post)}
                        </div>
                        <div className="text-xs text-gray-500">
                          By {post.created_by_user?.full_name || "Unknown"}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleEditClick(post)}
                              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(post.id)}
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                            >
                              Delete
                            </button>
                            {post.status === "pending" && (
                              <button
                                onClick={() => handleApprove(post.id)}
                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
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
                              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(post.id)}
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
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
        )}
      </main>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Create New Post
            </h3>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleCreatePost}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Title *{" "}
                  <span className="text-gray-500">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Launch Facebook campaign"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
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
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {/* Edit Post Modal */}
      {showEditModal && editingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Post</h3>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleUpdatePost}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Title *{" "}
                  <span className="text-gray-500">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Launch Facebook campaign"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
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
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {creating ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
