import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";
import DarkModeToggle from "../components/DarkModeToggle";

const About = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: "📅",
      title: "Visual Planning",
      description:
        "See all your posts in a beautiful calendar grid view. Plan weeks or months ahead with ease.",
    },
    {
      icon: "👥",
      title: "Team Collaboration",
      description:
        "Work together with your team. Assign roles, manage permissions, and collaborate seamlessly.",
    },
    {
      icon: "✅",
      title: "Approval Workflow",
      description:
        "Admins can review and approve posts before they go live. Keep quality control in check.",
    },
    {
      icon: "🎨",
      title: "Multi-Project Management",
      description:
        "Organize posts by projects. Use custom colors to differentiate campaigns visually.",
    },
    {
      icon: "📊",
      title: "Real-Time Stats",
      description:
        "Track pending and approved posts. Monitor your content pipeline at a glance.",
    },
    {
      icon: "🌙",
      title: "Dark Mode",
      description:
        "Easy on the eyes. Switch between light and dark themes for comfortable planning.",
    },
  ];

  const steps = [
    {
      number: "1",
      title: "Create or Join an Organization",
      description:
        "Start by creating your own organization or join an existing one with an invite code.",
      details: [
        "Click 'Create Organization' on the main page",
        "Give it a name and description",
        "Or use an invite code to join a team",
      ],
    },
    {
      number: "2",
      title: "Set Up Projects",
      description:
        "Organize your content into projects. Each project can represent a campaign, client, or platform.",
      details: [
        "Go to your organization dashboard",
        "Click 'Create Project'",
        "Choose a name and color for easy identification",
        "Assign team members to specific projects",
      ],
    },
    {
      number: "3",
      title: "Create Posts",
      description:
        "Schedule your social media posts with titles, dates, and specific times or time slots.",
      details: [
        "Open a project",
        "Click 'Create Post'",
        "Add a title and publish date",
        "Choose a specific time or time slot (morning/noon/evening)",
      ],
    },
    {
      number: "4",
      title: "Review & Approve",
      description:
        "Admins review posts before they go live. Members can edit their pending posts.",
      details: [
        "Posts start as 'Pending' status",
        "Admins can approve posts with one click",
        "View all posts in the calendar grid",
        "Track progress with real-time statistics",
      ],
    },
  ];

  const roles = [
    {
      role: "Admin",
      color: "blue",
      permissions: [
        "Create, edit, and delete projects",
        "Manage team members",
        "Approve or reject posts",
        "Edit and delete any posts",
        "Access all project settings",
        "Generate invite codes",
      ],
    },
    {
      role: "Member",
      color: "gray",
      permissions: [
        "Create posts in assigned projects",
        "Edit own pending posts",
        "Delete own pending posts",
        "View all posts in the calendar",
        "Collaborate with team members",
      ],
    },
  ];

  const faqs = [
    {
      question: "What's the difference between Organizations and Projects?",
      answer:
        "Organizations are like workspaces - they contain your team and all projects. Projects are folders within an organization that help you organize posts by campaign, client, or platform.",
    },
    {
      question: "Can I schedule posts for specific times?",
      answer:
        "Yes! You can either choose a specific time (like 2:30 PM) or select a time slot (morning, noon, or evening) for more flexible scheduling.",
    },
    {
      question: "How do approval workflows work?",
      answer:
        "When a member creates a post, it starts as 'Pending'. Admins can then review and approve it. Once approved, the post status changes to 'Approved' and appears in the final calendar.",
    },
    {
      question: "Can I work on multiple projects?",
      answer:
        "Absolutely! You can be a member of multiple projects within an organization. Each project can have different team members and color coding.",
    },
    {
      question: "What happens if I delete a project?",
      answer:
        "Only admins can delete projects. When deleted, all posts within that project are permanently removed. Make sure to back up any important information first!",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Logo size="small" />
            <div className="flex items-center gap-3">
              <DarkModeToggle />
              {isAuthenticated ? (
                <button
                  onClick={() => navigate("/contexts")}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate("/register")}
                    className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome to Nexposit</h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Next-level social media planning for teams. Plan, collaborate, and
            publish with confidence.
          </p>
          {!isAuthenticated && (
            <button
              onClick={() => navigate("/register")}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-colors shadow-lg"
            >
              Get Started Free
            </button>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Powerful Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            How to Get Started
          </h2>
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md"
              >
                <div className="flex items-start gap-6">
                  <div className="bg-blue-500 dark:bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold flex-shrink-0">
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {step.description}
                    </p>
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-gray-700 dark:text-gray-400"
                        >
                          <span className="text-blue-500 dark:text-blue-400 mt-1">
                            •
                          </span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Understanding User Roles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {roles.map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      item.color === "blue"
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                        : "bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {item.role}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Permissions:
                </h3>
                <ul className="space-y-3">
                  {item.permissions.map((permission, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                    >
                      <span className="text-green-500 dark:text-green-400 text-xl">
                        ✓
                      </span>
                      <span>{permission}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join teams already planning smarter with Nexposit
          </p>
          {!isAuthenticated ? (
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate("/register")}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-colors shadow-lg"
              >
                Sign Up Free
              </button>
              <button
                onClick={() => navigate("/login")}
                className="bg-blue-700 text-white hover:bg-blue-800 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
              >
                Login
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/contexts")}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-colors shadow-lg"
            >
              Go to Dashboard
            </button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Logo size="small" />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              © 2025 Nexposit. All rights reserved.
            </div>
            <div className="flex gap-6">
              <button
                onClick={() => navigate("/about")}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                About
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => navigate("/contexts")}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
