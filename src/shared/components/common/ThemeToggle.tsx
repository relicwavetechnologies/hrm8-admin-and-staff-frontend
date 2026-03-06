import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/utils";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");

    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative inline-flex h-7 w-[52px] shrink-0 items-center rounded-full border transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isDark
          ? "bg-slate-700 border-slate-600"
          : "bg-sky-100 border-sky-200"
      )}
      aria-label="Toggle theme"
    >
      {/* Track icons */}
      <Sun className={cn(
        "absolute left-1.5 h-3 w-3 transition-opacity duration-200",
        isDark ? "opacity-30 text-slate-400" : "opacity-70 text-amber-500"
      )} />
      <Moon className={cn(
        "absolute right-1.5 h-3 w-3 transition-opacity duration-200",
        isDark ? "opacity-70 text-blue-300" : "opacity-30 text-slate-400"
      )} />

      {/* Sliding knob */}
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 rounded-full shadow-sm ring-0 transition-all duration-300 ease-in-out flex items-center justify-center",
          isDark
            ? "translate-x-[26px] bg-slate-800 shadow-blue-500/20"
            : "translate-x-[3px] bg-white shadow-amber-500/20"
        )}
      >
        {isDark ? (
          <Moon className="h-3 w-3 text-blue-300" />
        ) : (
          <Sun className="h-3 w-3 text-amber-500" />
        )}
      </span>
    </button>
  );
}
