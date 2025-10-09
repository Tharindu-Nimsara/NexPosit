const Logo = ({ size = "default", showTagline = false }) => {
  const sizes = {
    small: {
      container: "flex items-center gap-2",
      icon: "24px",
      text: "text-xl",
      tagline: "text-xs",
    },
    default: {
      container: "flex items-center gap-3",
      icon: "32px",
      text: "text-2xl",
      tagline: "text-sm",
    },
    large: {
      container: "flex flex-col items-center gap-2",
      icon: "48px",
      text: "text-4xl",
      tagline: "text-base",
    },
  };

  const currentSize = sizes[size];

  return (
    <div className={currentSize.container}>
      <div className="flex items-center gap-2">
        {/* Logo Icon - Forward arrow in a rounded square */}
        {/* <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg p-2 shadow-md">
          <svg
            className="text-white"
            style={{ width: currentSize.icon, height: currentSize.icon }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </div> */}

        {/* Brand Name */}
        <div className="flex flex-col">
          <h1
            className={`${currentSize.text} font-bold bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent`}
          >
            NexPosit
          </h1>
          {showTagline && (
            <p
              className={`${currentSize.tagline} text-gray-600 dark:text-gray-400 font-medium`}
            >
              Next-level planning
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Logo;
