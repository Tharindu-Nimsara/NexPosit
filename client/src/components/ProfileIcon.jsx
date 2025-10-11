import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const ProfileIcon = ({ size = "md", showTooltip = true }) => {
  const { user } = useAuth();
  const [showTooltipState, setShowTooltipState] = useState(false);

  // Size configurations
  const sizes = {
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg",
    xl: "h-16 w-16 text-2xl",
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Generate color from email for consistency
  const getColorFromEmail = (email) => {
    if (!email) return "bg-gray-500";
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-red-500",
      "bg-orange-500",
      "bg-yellow-500",
      "bg-green-500",
      "bg-teal-500",
      "bg-indigo-500",
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  if (!user) return null;

  const hasProfilePicture = user.profile_picture && user.is_google_user;
  const initials = getInitials(user.full_name);
  const backgroundColor = getColorFromEmail(user.email);

  return (
    <div className="relative inline-block">
      <div
        className={`${sizes[size]} rounded-full flex items-center justify-center overflow-hidden cursor-pointer ring-2 ring-white dark:ring-gray-700 shadow-lg transition-transform hover:scale-105`}
        onMouseEnter={() => setShowTooltipState(true)}
        onMouseLeave={() => setShowTooltipState(false)}
      >
        {hasProfilePicture ? (
          <img
            src={user.profile_picture}
            alt={user.full_name}
            className="h-full w-full object-cover"
            onError={(e) => {
              // Fallback if image fails to load
              e.target.style.display = "none";
              e.target.parentElement.innerHTML = `
                <div class="${sizes[size]} ${backgroundColor} flex items-center justify-center text-white font-semibold">
                  ${initials}
                </div>
              `;
            }}
          />
        ) : (
          <div
            className={`${backgroundColor} h-full w-full flex items-center justify-center text-white font-semibold`}
          >
            {initials}
          </div>
        )}
      </div>

      {/* Tooltip - Now positioned BELOW the icon */}
      {showTooltip && showTooltipState && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-50 animate-fadeIn">
          <div className="font-medium">{user.full_name}</div>
          <div className="text-gray-300 text-xs">{user.email}</div>
          {/* Arrow pointing UP */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-[-1px]">
            <div className="border-4 border-transparent border-b-gray-900 dark:border-b-gray-700"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileIcon;
