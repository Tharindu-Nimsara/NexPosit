import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Social Post Planner
            </h1>
            <button onClick={logout} className="btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">
            Welcome, {user?.full_name}! 👋
          </h2>
          <p className="text-gray-600 mb-4">You're successfully logged in!</p>
          <div className="bg-blue-50 border-l-4 border-primary p-4 rounded">
            <p className="text-sm text-gray-700">
              <strong>User Info:</strong>
            </p>
            <ul className="mt-2 text-sm text-gray-600 space-y-1">
              <li>📧 Email: {user?.email}</li>
              <li>🌍 Timezone: {user?.timezone}</li>
              <li>
                📅 Joined: {new Date(user?.created_at).toLocaleDateString()}
              </li>
            </ul>
          </div>

          <div className="mt-6">
            <p className="text-gray-500 text-sm">
              Dashboard features coming soon! We'll add Contexts, Projects, and
              Posts here.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
