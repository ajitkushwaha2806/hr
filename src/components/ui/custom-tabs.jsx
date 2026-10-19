import { cn } from "@/lib/utils";

export function CustomTabs({ tabs, activeTab, setActiveTab }) {
  return (
    <div className="border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 rounded-t-md">
      <nav className="-mb-px flex space-x-8 overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors flex items-center gap-2",
                isActive
                  ? tab.activeColor || "border-primary text-primary"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-zinc-700 hover:text-gray-700 dark:hover:text-gray-200"
              )}
            >
              {tab.label}
              {tab.badge != null && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold",
                    tab.badgeClasses || "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300"
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
