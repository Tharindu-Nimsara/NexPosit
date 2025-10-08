/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

const DarkModeContext = createContext();

// Custom hook to use dark mode
export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error("useDarkMode must be used within DarkModeProvider");
  }
  return context;
}

// Provider component
export function DarkModeProvider({ children }) {
  // Check localStorage and system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode !== null) {
      return savedMode === "true";
    }
    // Check system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    // Apply dark mode class to html element
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}
