import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuth();
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      const token = searchParams.get("token");
      const errorParam = searchParams.get("error");

      // Handle error from backend
      if (errorParam) {
        let errorMessage = "Authentication failed";
        if (errorParam === "google_auth_failed") {
          errorMessage = "Google authentication failed. Please try again.";
        } else if (errorParam === "auth_failed") {
          errorMessage = "Authentication failed. Please try again.";
        }
        setError(errorMessage);
        setProcessing(false);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login?error=" + errorParam);
        }, 3000);
        return;
      }

      // Handle successful authentication
      if (token) {
        try {
          const result = await handleOAuthCallback(token);

          if (result.success) {
            setProcessing(false);

            // Small delay to show success state
            setTimeout(() => {
              // Check for pending invite code
              const pendingInviteCode =
                sessionStorage.getItem("pendingInviteCode");
              if (pendingInviteCode) {
                sessionStorage.removeItem("pendingInviteCode");
                navigate(`/join/${pendingInviteCode}`);
              } else {
                navigate("/contexts");
              }
            }, 500);
          } else {
            setError(result.error || "Authentication failed");
            setProcessing(false);

            // Redirect to login after 3 seconds
            setTimeout(() => {
              navigate("/login?error=auth_failed");
            }, 3000);
          }
        } catch (err) {
          console.error("OAuth callback error:", err);
          setError("An unexpected error occurred. Please try again.");
          setProcessing(false);

          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate("/login?error=auth_failed");
          }, 3000);
        }
      } else {
        // No token and no error - something went wrong
        setError("Invalid authentication response. Please try again.");
        setProcessing(false);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    };

    processCallback();
  }, [searchParams, navigate, handleOAuthCallback]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full">
        {error ? (
          // Error State
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Authentication Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
              <span>Redirecting to login...</span>
            </div>
          </div>
        ) : processing ? (
          // Processing State
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Completing Sign In
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we set up your account...
            </p>
          </div>
        ) : (
          // Success State
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Success!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Redirecting you to your dashboard...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
