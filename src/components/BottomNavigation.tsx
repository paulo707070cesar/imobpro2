import React from 'react';
import {
  LayoutDashboard,
  Kanban,
  Users,
  Settings,
} from 'lucide-react';

export type NavigationTab = 'dashboard' | 'pipeline' | 'clients' | 'settings';

interface BottomNavigationProps {
  activeTab: NavigationTab;
  onChangeTab: (tab: NavigationTab) => void;
  followUpCount?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onChangeTab,
  followUpCount = 0,
}) => {
  const tabs = [
    {
      id: 'dashboard' as const,
      label: 'Início',
      icon: LayoutDashboard,
      badge: followUpCount > 0 ? followUpCount : null,
    },
    {
      id: 'pipeline' as const,
      label: 'Negócios',
      icon: Kanban,
    },
    {
      id: 'clients' as const,
      label: 'Clientes',
      icon: Users,
    },
    {
      id: 'settings' as const,
      label: 'Ajustes',
      icon: Settings,
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-[#080E1A]/95 backdrop-blur-xl border-t border-cyan-500/15 shadow-[0_-4px_24px_rgba(0,0,0,0.7)] pb-safe md:hidden">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center h-full gap-0.5 transition-all relative ${
                isActive ? 'text-[#00D2FF] font-semibold' : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'text-[#00D2FF] drop-shadow-[0_0_8px_rgba(0,210,255,0.6)] scale-105' : 'text-slate-400'
                  }`}
                />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2 px-1 py-0.2 rounded-full bg-[#00D2FF] text-[#080E1A] text-[9px] font-extrabold flex items-center justify-center shadow-[0_0_8px_#00D2FF]">
                    {tab.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className="text-[11px] font-headline tracking-tight">
                {tab.label}
              </span>

              {/* Glowing active indicator pill at bottom */}
              <span
                className={`absolute bottom-1 h-1 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'w-6 bg-[#00D2FF] shadow-[0_0_8px_#00D2FF]'
                    : 'w-0 bg-transparent'
                }`}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
};
