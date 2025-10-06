import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { contextAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const JoinContext = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      // Save the invite code and redirect to login
      sessionStorage.setItem("pendingInviteCode", code);
      navigate("/login");
    }
  }, [isAuthenticated, code, navigate]);

  const handleJoin = async () => {
    setLoading(true);
    setError("");

    try {
      await contextAPI.join(code);
      setSuccess(true);

      // Redirect to contexts list after 1.5 seconds
      setTimeout(() => {
        navigate("/contexts");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to join organization");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {success ? (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Successfully Joined!
              </h2>
              <p className="text-gray-600 mb-4">
                Redirecting to organizations...
              </p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Join Organization
              </h2>
              <p className="text-gray-600 mb-6">
                You've been invited to join an organization with code:
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-3xl font-mono font-bold text-blue-600">
                  {code}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleJoin}
                disabled={loading}
                className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 font-medium"
              >
                {loading ? "Joining..." : "Join Organization"}
              </button>

              <button
                onClick={() => navigate("/contexts")}
                className="w-full mt-3 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinContext;
